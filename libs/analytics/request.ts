import { isAccountName, isHiveTag } from "@/utils/steemParams";

/**
 * Reading a request the way the proxy needs it: who sent it, what it asked for,
 * and whether the answer can be known without doing any work.
 */

const IP_HEADER = process.env.ANALYTICS_IP_HEADER?.trim().toLowerCase();

function first(value: string | null): string | null {
  if (!value) return null;
  const ip = value.split(",")[0]?.trim();
  return ip ? ip : null;
}

/**
 * The client address, in the order hosting setups usually provide it.
 *
 * `x-forwarded-for` is a list that a client can prepend to, so only the last
 * entry — the one the edge appended — is trusted. If your host puts the real
 * address somewhere else, set `ANALYTICS_IP_HEADER` to that header name.
 */
export function clientIp(headers: Headers): string {
  const chosen = IP_HEADER ? headers.get(IP_HEADER) : null;
  const candidate =
    first(chosen) ??
    first(headers.get("cf-connecting-ip")) ??
    first(headers.get("x-real-ip")) ??
    last(headers.get("x-forwarded-for"));

  if (!candidate) return "unknown";

  // `::ffff:1.2.3.4` is an IPv4 address wearing an IPv6 coat.
  const mapped = candidate.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i);
  return (mapped?.[1] ?? candidate).slice(0, 45);
}

function last(value: string | null): string | null {
  if (!value) return null;
  const parts = value.split(",").map((p) => p.trim()).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : null;
}

/**
 * A stable bucket for a path, so "top routes" stays readable instead of
 * becoming a list of ten thousand usernames.
 *
 * `/@alice/hello-world` and `/@bob/another-post` both count as
 * `/@:account/:slug`; the offender's volume is still visible per IP, and the
 * deflected-paths list keeps the literal strings.
 */
export function routeKey(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "/";

  // API paths are mostly static route names; keep them literal but bounded.
  if (segments[0] === "api") {
    const head = segments.slice(0, 3).map((s) => s.slice(0, 30));
    return "/" + head.join("/") + (segments.length > 3 ? "/…" : "");
  }

  const mapped = segments.slice(0, 4).map((segment, index) => {
    if (segment.startsWith("@")) return "@:account";
    if (/^hive-\d+$/i.test(segment)) return "hive-:tag";
    if (/^\d+$/.test(segment)) return ":id";
    if (index === 0) return segment.slice(0, 40);
    return ":slug";
  });

  return "/" + mapped.join("/") + (segments.length > 4 ? "/…" : "");
}

function decode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * A reason the request can be rejected without rendering, or `null`.
 *
 * This only covers shapes that can never be valid — an account name that
 * breaks Steem's own rules, or a community tag that is not a number. An
 * *unknown* account is not junk: that costs one SDS read and a real 404.
 */
export function junkReason(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const [first, second] = segments;

  if (first.startsWith("@")) {
    const account = decode(first.slice(1));
    if (!isAccountName(account)) return "malformed-account";
    return null;
  }

  if (first === "community" && second !== undefined) {
    const tag = decode(second);
    if (!isHiveTag(tag)) return "malformed-community";
  }

  return null;
}

/**
 * Addresses that must never be blocked: blocking one of these would take the
 * site down for its own operator or for every visitor behind the same edge.
 */
export function isProtectedIp(ip: string): boolean {
  if (!ip || ip === "unknown") return true;
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "0.0.0.0" ||
    ip.startsWith("127.") ||
    ip.toLowerCase() === "localhost"
  );
}

/** The address a request came from, when it is safe to echo back to a page. */
export function displayIp(ip: string): string {
  return ip === "unknown" ? "unknown" : ip;
}
