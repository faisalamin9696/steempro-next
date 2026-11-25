import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Request analytics and the IP blocklist, kept in a local SQLite file.
 *
 * Why a file and not Supabase: this runs on the hosting box next to the app,
 * needs to answer inside the proxy on every request, and must work before
 * anyone runs a migration. `node:sqlite` is built into Node 22.5+, so there is
 * no dependency to install and no service that can be down.
 *
 * Trade-off, stated plainly: the file is per-machine. On a single VPS that is
 * exactly right. If this ever runs as several instances behind a load balancer,
 * each keeps its own view and blocklists stop being global — move the two
 * tables to a shared store at that point.
 *
 * Everything here is best-effort. Analytics must never be able to take a page
 * down, so an old Node without `node:sqlite`, a read-only disk or a malformed
 * row degrades to "no numbers" rather than an exception.
 */

const FLUSH_MS = 5_000;
const PRUNE_MS = 5 * 60_000;
const RETENTION_DAYS = Number(process.env.ANALYTICS_RETENTION_DAYS ?? 7);
const BLOCKLIST_REFRESH_MS = 15_000;
const ENABLED = process.env.ANALYTICS_ENABLED !== "false";

/** `0` means "handed to the app"; the proxy cannot see the final status. */
export const STATUS_PASSED = 0;
export const STATUS_DEFLECTED = 404;
export const STATUS_BLOCKED = 403;

export type Hit = {
  /** Unix seconds, truncated to the minute. */
  minute: number;
  ip: string;
  method: string;
  route: string;
  status: number;
  ua: string;
};

export type BlockedIp = {
  ip: string;
  reason: string;
  createdAt: number;
  createdBy: string | null;
  expiresAt: number | null;
};

export type RouteRow = { route: string; hits: number };
export type IpRow = {
  ip: string;
  hits: number;
  routes: number;
  topRoute: string;
  ua: string;
  lastSeen: number;
};
export type Deflection = { path: string; reason: string; at: number };

/** Shapes returned by the queries below, named so the rows are not `any`. */
type BlockedRow = {
  ip: string;
  reason: string;
  created_at: number;
  created_by: string | null;
  expires_at: number | null;
};
type OverviewRow = {
  total: number;
  ips: number;
  blocked: number;
  deflected: number;
  passed: number;
};
type RouteSqlRow = { route: string; hits: number };
type IpSqlRow = {
  ip: string;
  hits: number;
  routes: number;
  last_seen: number;
};
type ScalarRow = { route?: string; ua?: string };
type DeflectionRow = { path: string; reason: string; last_at: number };
export type Overview = {
  total: number;
  uniqueIps: number;
  blockedHits: number;
  deflectedHits: number;
  passedHits: number;
  windowStart: number;
};
export type Snapshot = {
  overview: Overview;
  routes: RouteRow[];
  ips: IpRow[];
  blocked: BlockedIp[];
  deflections: Deflection[];
  windowHours: number;
  generatedAt: number;
  available: boolean;
  /** Where this instance keeps its counters, so the console can show it. */
  dbPath: string;
  /** True when that file sits inside the release directory. */
  dbInReleaseDir: boolean;
};

/* ---------------------------------------------------------- sqlite loading */

/**
 * Typed by hand rather than imported: `@types/node` only declares `node:sqlite`
 * on recent versions, and the runtime module does not exist before Node 22.5.
 * Both facts are load-bearing for a project that may still deploy on Node 20.
 */
type Statement = {
  run(...params: unknown[]): unknown;
  get(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
};
type Database = {
  exec(sql: string): void;
  prepare(sql: string): Statement;
};

type DatabaseCtor = new (file: string) => Database;

let db: Database | null = null;
let loadFailed = false;
let loadAttempted = false;
let loadCtor: DatabaseCtor | null = null;

function sqlite(): DatabaseCtor | null {
  if (loadAttempted) return loadCtor;
  loadAttempted = true;
  try {
    // `require` is rewritten by the bundler, so ask Node itself for the builtin
    // at runtime. `getBuiltinModule` exists from Node 22.3 and returns
    // `undefined` (rather than throwing) when the id is unknown, which is
    // exactly the graceful path we want on an older runtime.
    const getBuiltin = (
      process as unknown as {
        getBuiltinModule?: (id: string) => unknown;
      }
    ).getBuiltinModule;
    const mod = getBuiltin?.("node:sqlite") as
      | { DatabaseSync?: DatabaseCtor }
      | undefined;
    loadCtor = mod?.DatabaseSync ?? null;
  } catch {
    loadCtor = null;
  }
  if (!loadCtor) {
    console.error(
      "[analytics] node:sqlite is unavailable (needs Node 22.5+) — request analytics and IP blocking are disabled",
    );
  }
  return loadCtor;
}

/**
 * Where the store lives.
 *
 * Absolute is strongly recommended for a deployment: the default sits inside
 * the release directory, so a fresh clone, a `git clean -fdx`, or a new
 * container arrives with an empty database. Point `ANALYTICS_DB_PATH` at a
 * path that outlives the release (e.g. `/var/lib/steempro/analytics.db`) and
 * the counters and blocklist survive every deploy. Relative values resolve
 * against the working directory.
 */
export function analyticsDbPath(): string {
  const configured = process.env.ANALYTICS_DB_PATH?.trim();
  if (configured) return path.resolve(configured);
  return path.join(process.cwd(), ".data", "analytics.db");
}

function open(): Database | null {
  if (db) return db;
  if (!ENABLED || loadFailed) return null;

  const Ctor = sqlite();
  if (!Ctor) {
    loadFailed = true;
    return null;
  }

  const preferred = analyticsDbPath();
  const fallback = path.join(os.tmpdir(), "steempro-analytics.db");

  // A container or a read-only checkout cannot write next to the app; the OS
  // temp directory always works and still survives for the process lifetime.
  const candidates = preferred === fallback ? [preferred] : [preferred, fallback];

  for (const [index, file] of candidates.entries()) {
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      const conn = new Ctor(file);
      // The file holds client addresses, so keep it owner-only. Best effort:
      // a filesystem without POSIX modes simply ignores this.
      try {
        fs.chmodSync(file, 0o600);
      } catch {
        /* not advisory-critical */
      }
      conn.exec(`
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;

        CREATE TABLE IF NOT EXISTS request_hits (
          minute  INTEGER NOT NULL,
          ip      TEXT    NOT NULL,
          method  TEXT    NOT NULL,
          route   TEXT    NOT NULL,
          status  INTEGER NOT NULL,
          ua      TEXT    NOT NULL,
          hits    INTEGER NOT NULL,
          PRIMARY KEY (minute, ip, method, route, status, ua)
        ) WITHOUT ROWID;

        CREATE INDEX IF NOT EXISTS request_hits_minute ON request_hits (minute);
        CREATE INDEX IF NOT EXISTS request_hits_ip ON request_hits (ip);

        CREATE TABLE IF NOT EXISTS blocked_ips (
          ip         TEXT PRIMARY KEY,
          reason     TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          created_by TEXT,
          expires_at INTEGER
        );

        -- Junk paths used to live in a module-level array. The proxy and the
        -- dashboard run in different bundles, so that array was only ever
        -- visible to the one that filled it: "Recently deflected" stayed empty
        -- no matter how much junk arrived. Same table, two readers.
        CREATE TABLE IF NOT EXISTS deflections (
          path    TEXT PRIMARY KEY,
          reason  TEXT NOT NULL,
          last_at INTEGER NOT NULL
        ) WITHOUT ROWID;

        CREATE INDEX IF NOT EXISTS deflections_last_at ON deflections (last_at);
      `);
      db = conn;
      // One line at startup so the operator can confirm the data is going
      // somewhere that outlives the next deploy.
      if (index > 0) {
        console.error(
          `[analytics] store opened at ${file} because ${preferred} is not writable — counters and the blocklist will be lost on restart`,
        );
      } else {
        console.log(`[analytics] store: ${file}`);
      }
      return db;
    } catch (error) {
      console.error(`[analytics] cannot open ${file}`, error);
    }
  }

  loadFailed = true;
  return null;
}

/* ------------------------------------------------------------------ writes */

/**
 * Aggregated in memory and written in batches: the proxy runs on every request
 * and a per-request commit would put a disk sync in front of every page view.
 * A lost batch costs at most `FLUSH_MS` of counters, never correctness.
 */
const pending = new Map<string, Hit & { hits: number }>();
let lastFlush = 0;
let lastPrune = 0;

/**
 * Junk paths, buffered like the hits so a probe burst is one write rather than
 * one per request, then persisted so the dashboard can read what this instance
 * deflected. Bounded by the same retention window as the counters.
 */
const pendingDeflections = new Map<string, { reason: string; lastAt: number }>();

export function recordHit(hit: Hit): void {
  if (!ENABLED) return;

  const key = `${hit.minute}|${hit.ip}|${hit.method}|${hit.route}|${hit.status}|${hit.ua}`;
  const existing = pending.get(key);
  if (existing) existing.hits += 1;
  else pending.set(key, { ...hit, hits: 1 });

  maybeFlush();
}

export function recordDeflection(pathname: string, reason: string): void {
  if (!ENABLED) return;
  pendingDeflections.set(pathname, { reason, lastAt: Date.now() });
  maybeFlush();
}

/**
 * The proxy calls this on every request, so the write path stays on a timer:
 * a burst of hits is one transaction every `FLUSH_MS`, not one per hit.
 */
function maybeFlush(): void {
  if (Date.now() - lastFlush >= FLUSH_MS) flushHits();
}

export function flushHits(): void {
  lastFlush = Date.now();
  if (pending.size === 0 && pendingDeflections.size === 0) return;

  const rows = [...pending.values()];
  const junk = [...pendingDeflections.entries()];
  pending.clear();
  pendingDeflections.clear();

  const conn = open();
  if (!conn) return;

  try {
    const stmt = conn.prepare(`
      INSERT INTO request_hits (minute, ip, method, route, status, ua, hits)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (minute, ip, method, route, status, ua)
      DO UPDATE SET hits = hits + excluded.hits
    `);
    const deflectionStmt = conn.prepare(`
      INSERT INTO deflections (path, reason, last_at)
      VALUES (?, ?, ?)
      ON CONFLICT (path)
      DO UPDATE SET reason = excluded.reason, last_at = excluded.last_at
    `);

    conn.exec("BEGIN");
    try {
      for (const row of rows) {
        stmt.run(
          row.minute,
          row.ip,
          row.method,
          row.route,
          row.status,
          row.ua,
          row.hits,
        );
      }
      for (const [pathname, entry] of junk) {
        deflectionStmt.run(pathname, entry.reason, entry.lastAt);
      }
      conn.exec("COMMIT");
    } catch (error) {
      conn.exec("ROLLBACK");
      throw error;
    }

    prune(conn);
  } catch (error) {
    console.error("[analytics] flush failed", error);
  }
}

function prune(conn: Database): void {
  const now = Date.now();
  if (now - lastPrune < PRUNE_MS) return;
  lastPrune = now;
  const cutoff = Math.floor(now / 1000) - RETENTION_DAYS * 86_400;
  conn.prepare("DELETE FROM request_hits WHERE minute < ?").run(cutoff);
  conn.prepare("DELETE FROM deflections WHERE last_at < ?").run(cutoff * 1000);
  // Keep the probe list readable even on a busy day: the dashboard shows the
  // newest 40, so anything beyond a few hundred rows is dead weight.
  conn
    .prepare(
      `DELETE FROM deflections
       WHERE path NOT IN (
         SELECT path FROM deflections ORDER BY last_at DESC LIMIT 500
       )`,
    )
    .run();
  conn
    .prepare(
      "DELETE FROM blocked_ips WHERE expires_at IS NOT NULL AND expires_at < ?",
    )
    .run(now);
}

/** Newest deflections, read from the shared table rather than module memory. */
function recentDeflections(limit: number): Deflection[] {
  const conn = open();
  if (!conn) return [];

  try {
    const rows = conn
      .prepare(
        `SELECT path, reason, last_at
         FROM deflections
         ORDER BY last_at DESC
         LIMIT ?`,
      )
      .all(limit) as DeflectionRow[];

    return rows.map((r) => ({
      path: r.path,
      reason: r.reason,
      at: Number(r.last_at),
    }));
  } catch (error) {
    console.error("[analytics] recentDeflections failed", error);
    return [];
  }
}

/* --------------------------------------------------------------- blocklist */

export function listBlocked(): BlockedIp[] {
  const conn = open();
  if (!conn) return [];

  try {
    const rows = conn
      .prepare(
        `SELECT ip, reason, created_at, created_by, expires_at
         FROM blocked_ips
         WHERE expires_at IS NULL OR expires_at > ?
         ORDER BY created_at DESC`,
      )
      .all(Date.now()) as BlockedRow[];

    return rows.map((r) => ({
      ip: r.ip,
      reason: r.reason,
      createdAt: Number(r.created_at),
      createdBy: r.created_by ?? null,
      expiresAt: r.expires_at === null ? null : Number(r.expires_at),
    }));
  } catch (error) {
    console.error("[analytics] listBlocked failed", error);
    return [];
  }
}

/**
 * Exact addresses, or a range written as `203.0.113.` / `203.0.113.*`.
 *
 * Ranges are stored with a trailing dot so the matcher is a plain prefix test;
 * a rule that is not a plausible address is rejected instead of being saved and
 * silently never matching.
 */
export function normalizeRule(value: string): string | null {
  const rule = value.trim();
  if (!rule) return null;

  if (rule.endsWith("*")) {
    const prefix = rule.slice(0, -1);
    if (!/^[0-9a-fA-F:.]{2,}$/.test(prefix)) return null;
    return prefix.endsWith(".") || prefix.endsWith(":") ? prefix : `${prefix}.`;
  }

  if (/[.:]$/.test(rule)) {
    return /^[0-9a-fA-F:.]{2,}$/.test(rule) ? rule : null;
  }

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(rule)) return rule;
  if (/^[0-9a-fA-F:]{2,45}$/.test(rule) && rule.includes(":")) return rule;
  return null;
}

export function blockIp(entry: {
  ip: string;
  reason: string;
  createdBy?: string | null;
  hours?: number | null;
}): void {
  const conn = open();
  if (!conn) throw new Error("analytics store unavailable");

  const now = Date.now();
  const expiresAt =
    entry.hours && entry.hours > 0 ? now + entry.hours * 3_600_000 : null;

  conn
    .prepare(
      `INSERT INTO blocked_ips (ip, reason, created_at, created_by, expires_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (ip) DO UPDATE SET
         reason = excluded.reason,
         created_at = excluded.created_at,
         created_by = excluded.created_by,
         expires_at = excluded.expires_at`,
    )
    .run(entry.ip, entry.reason, now, entry.createdBy ?? null, expiresAt);

  invalidateBlocklist();
}

export function unblockIp(ip: string): void {
  const conn = open();
  if (!conn) return;
  conn.prepare("DELETE FROM blocked_ips WHERE ip = ?").run(ip);
  invalidateBlocklist();
}

/**
 * The proxy cannot query SQLite per request without paying for a prepared
 * statement on every hit, so the rules are mirrored in memory and refreshed on
 * a timer. A newly blocked IP starts being refused within one refresh window.
 */
let snapshot: { at: number; rules: string[] } = { at: 0, rules: [] };

export function blockedRules(): string[] {
  if (!ENABLED) return [];
  if (Date.now() - snapshot.at < BLOCKLIST_REFRESH_MS) return snapshot.rules;
  try {
    snapshot = { at: Date.now(), rules: listBlocked().map((b) => b.ip) };
  } catch (error) {
    console.error("[analytics] blocklist refresh failed", error);
    snapshot = { at: Date.now(), rules: [] };
  }
  return snapshot.rules;
}

/** `true` when the address matches an exact rule or a range prefix. */
export function isBlocked(ip: string, rules = blockedRules()): boolean {
  if (!ip || ip === "unknown") return false;
  for (const rule of rules) {
    if (ip === rule) return true;
    if ((rule.endsWith(".") || rule.endsWith(":")) && ip.startsWith(rule)) {
      return true;
    }
  }
  return false;
}

function invalidateBlocklist(): void {
  snapshot = { at: 0, rules: [] };
}

/* ------------------------------------------------------------------ reads */

function sinceFor(windowHours: number): number {
  return Math.floor(Date.now() / 1000) - windowHours * 3600;
}

export function overview(windowHours: number): Overview {
  const since = sinceFor(windowHours);
  const empty: Overview = {
    total: 0,
    uniqueIps: 0,
    blockedHits: 0,
    deflectedHits: 0,
    passedHits: 0,
    windowStart: since,
  };

  const conn = open();
  if (!conn) return empty;

  try {
    const row = conn
      .prepare(
        `SELECT
           COALESCE(SUM(hits), 0) AS total,
           COUNT(DISTINCT ip)     AS ips,
           COALESCE(SUM(CASE WHEN status = 403 THEN hits ELSE 0 END), 0) AS blocked,
           COALESCE(SUM(CASE WHEN status = 404 THEN hits ELSE 0 END), 0) AS deflected,
           COALESCE(SUM(CASE WHEN status = 0   THEN hits ELSE 0 END), 0) AS passed
         FROM request_hits
         WHERE minute >= ?`,
      )
      .get(since) as OverviewRow;

    return {
      total: Number(row.total),
      uniqueIps: Number(row.ips),
      blockedHits: Number(row.blocked),
      deflectedHits: Number(row.deflected),
      passedHits: Number(row.passed),
      windowStart: since,
    };
  } catch (error) {
    console.error("[analytics] overview failed", error);
    return empty;
  }
}

export function topRoutes(windowHours: number, limit = 12): RouteRow[] {
  const since = sinceFor(windowHours);
  const conn = open();
  if (!conn) return [];

  try {
    const rows = conn
      .prepare(
        `SELECT route, SUM(hits) AS hits
         FROM request_hits
         WHERE minute >= ?
         GROUP BY route
         ORDER BY hits DESC
         LIMIT ?`,
      )
      .all(since, limit) as RouteSqlRow[];

    return rows.map((r) => ({ route: r.route, hits: Number(r.hits) }));
  } catch (error) {
    console.error("[analytics] topRoutes failed", error);
    return [];
  }
}

export function topIps(windowHours: number, limit = 25): IpRow[] {
  const since = sinceFor(windowHours);
  const conn = open();
  if (!conn) return [];

  try {
    const rows = conn
      .prepare(
        `SELECT ip,
                SUM(hits)             AS hits,
                COUNT(DISTINCT route) AS routes,
                MAX(minute)           AS last_seen
         FROM request_hits
         WHERE minute >= ?
         GROUP BY ip
         ORDER BY hits DESC
         LIMIT ?`,
      )
      .all(since, limit) as IpSqlRow[];

    const topRoute = conn.prepare(
      `SELECT route FROM request_hits
       WHERE minute >= ? AND ip = ?
       GROUP BY route ORDER BY SUM(hits) DESC LIMIT 1`,
    );
    const topUa = conn.prepare(
      `SELECT ua FROM request_hits
       WHERE minute >= ? AND ip = ?
       GROUP BY ua ORDER BY SUM(hits) DESC LIMIT 1`,
    );

    return rows.map((r) => ({
      ip: r.ip,
      hits: Number(r.hits),
      routes: Number(r.routes),
      lastSeen: Number(r.last_seen),
      topRoute: (topRoute.get(since, r.ip) as ScalarRow | undefined)?.route ?? "",
      ua: (topUa.get(since, r.ip) as ScalarRow | undefined)?.ua ?? "",
    }));
  } catch (error) {
    console.error("[analytics] topIps failed", error);
    return [];
  }
}

export function snapshotFor(windowHours: number): Snapshot {
  flushHits();
  return {
    overview: overview(windowHours),
    routes: topRoutes(windowHours),
    ips: topIps(windowHours),
    blocked: listBlocked(),
    deflections: recentDeflections(40),
    windowHours,
    generatedAt: Date.now(),
    available: ENABLED && !loadFailed,
    dbPath: analyticsDbPath(),
    dbInReleaseDir: analyticsDbPath().startsWith(
      `${process.cwd()}${path.sep}`,
    ),
  };
}

/**
 * Persist on a timer as well as on traffic.
 *
 * `recordHit` only flushes when a *new* request arrives, so a server that goes
 * idle would hold its last batch in memory indefinitely and lose it on
 * restart. The timer closes that gap; `unref` stops it from keeping the process
 * alive on its own, and the `globalThis` key keeps hot reload from stacking up
 * intervals.
 */
const FLUSH_TIMER = Symbol.for("steempro.analytics.flushTimer");
const globalScope = globalThis as unknown as Record<symbol, unknown>;

if (ENABLED && !globalScope[FLUSH_TIMER]) {
  const timer = setInterval(flushHits, FLUSH_MS);
  timer.unref?.();
  globalScope[FLUSH_TIMER] = timer;
}
