/* Verify the tabbed explorer redesign against localhost:3100. */
const BASE = "http://localhost:3100";

const count = (s, needle) => s.split(needle).length - 1;

async function get(path, headers = {}) {
  const t0 = Date.now();
  try {
    const r = await fetch(BASE + path, {
      headers,
      signal: AbortSignal.timeout(90000),
    });
    const body = await r.text();
    return { status: r.status, body, ms: Date.now() - t0 };
  } catch (e) {
    return { status: 0, body: String(e), ms: Date.now() - t0 };
  }
}

async function getJson(path) {
  const r = await get(path);
  try {
    return { status: r.status, ms: r.ms, j: JSON.parse(r.body) };
  } catch {
    return { status: r.status, ms: r.ms, raw: r.body.slice(0, 200) };
  }
}

(async () => {
  // readiness
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(BASE + "/", { signal: AbortSignal.timeout(3000) });
      if (r.status) break;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // ------------------------------------------------------------------ APIs
  const stats = await getJson("/api/explorer?section=statistics");
  const g = stats.j?.growth;
  console.log("statistics:", stats.status, stats.ms + "ms", JSON.stringify({
    ops: stats.j?.ops?.length,
    shareRates: stats.j?.shareRates?.length,
    growth: g && {
      last24h: g.last24h,
      last7d: g.last7d,
      perDay: g.perDay?.length,
      perDaySum: g.perDay?.reduce((s, d) => s + d.count, 0),
      coverageHours: g.coverageHours,
      partial: g.partial,
      ascending: g.perDay?.every((d, i, a) => i === 0 || a[i - 1].t <= d.t),
    },
  }));

  const content = await getJson("/api/explorer?section=content");
  console.log("content:", content.status, content.ms + "ms", JSON.stringify({
    top: content.j?.top?.length,
    active: content.j?.active?.length,
    top0: content.j?.top?.[0],
  }));

  const boards = await getJson("/api/explorer?section=leaderboards");
  const b = boards.j;
  console.log("leaderboards:", boards.status, boards.ms + "ms", JSON.stringify({
    witnesses: b?.witnesses?.length,
    missed: b?.missed?.length,
    topBalances: b?.topBalances?.length,
    stakeholders: b?.stakeholders?.length,
    st0: b?.stakeholders?.[0]?.name,
    st0Vests: b?.stakeholders?.[0]?.vests_own,
    followed: b?.followed?.length,
    f0: b?.followed && {
      name: b.followed[0].name,
      followers: b.followed[0].count_followers,
    },
    fSortedDesc: b?.followed?.every(
      (a, i, arr) => i === 0 || arr[i - 1].count_followers >= a.count_followers,
    ),
    newest: b?.newest?.length,
    communities: b?.communities?.length,
  }));

  const params = await getJson("/api/explorer?section=parameters");
  console.log("parameters:", params.status, params.ms + "ms", JSON.stringify({
    headBlock: params.j?.headBlock,
    hardfork: params.j?.hardfork,
    accountCount: params.j?.accountCount,
  }));

  const bad = await getJson("/api/explorer?section=nope");
  console.log("bad section →", bad.status, "(expect 400)");
  const badRange = await getJson("/api/explorer?section=activity&range=99x");
  console.log("bad range →", badRange.status, "(expect 400)");

  // ----------------------------------------------------------------- page
  const page = await get("/explorer");
  const bhtml = page.body;
  console.log("\nexplorer page:", page.status, page.ms + "ms", bhtml.length + "bytes");
  console.log("  h1:", count(bhtml, "<h1"), "| h2:", count(bhtml, "<h2"));
  console.log("  canonical:", (bhtml.match(/rel="canonical" href="([^"]+)"/) || [])[1]);
  console.log("  robots:", (bhtml.match(/name="robots" content="([^"]+)"/) || [])[1]);

  console.log("  -- server-rendered (expect >0):");
  for (const n of [
    "Overview",
    "Activity",
    "Statistics",
    "Content",
    "Leaderboards",
    "Parameters",
    "Lookup",
    "Chain totals",
    "Market · 24h",
    "Recent Blocks",
    "Search block number",
    "Head Block",
    "STEEM price",
  ]) console.log(`     "${n}": ${count(bhtml, n)}`);

  console.log("  -- client-only until tab opens (expect 0 rendered):");
  for (const n of [
    "Top stakeholders",
    "Most followed accounts",
    "Operation distribution",
    "Account creation per day",
    "Most used tags (all time)",
    "Most active authors",
    "Hardfork version",
  ]) console.log(`     "${n}": ${count(bhtml, n)}`);

  console.log("  links:", JSON.stringify({
    at: count(bhtml, 'href="/@'),
    trending: count(bhtml, 'href="/trending/'),
    account: count(bhtml, 'href="/explorer/account/'),
    block: count(bhtml, 'href="/explorer/block/'),
    market: count(bhtml, 'href="/market"'),
  }));

  // deep link + prefill
  const deep = await get("/explorer?tab=lookup&sub=accounts&q=notarealname123");
  console.log("deep link ?tab=lookup:", deep.status, deep.ms + "ms");

  // zh locale (cookie) — no missing keys, same tab labels
  const zh = await get("/explorer", { Cookie: "NEXT_LOCALE=zh" });
  console.log("zh:", zh.status, zh.ms + "ms",
    "missing-key-literals:", count(zh.body, "Explorer.tabs."),
    "| 'Overview':", count(zh.body, "Overview"));

  // ------------------------------------------------------------ regressions
  const home = await get("/");
  console.log("\nhome:", home.status, home.ms + "ms", "h1=" + count(home.body, "<h1"));
  const block = await get("/explorer/block/110000000");
  console.log("block page:", block.status, block.ms + "ms");
  const trend = await get("/trending/photography");
  console.log("trending:", trend.status, trend.ms + "ms");
})();
