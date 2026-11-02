/**
 * SEO audit — the skill's "check-seo", implemented directly.
 *
 * The `@mohitjoer/nextjs-seo` package this skill is written against is not on
 * npm (404, `npm search mohitjoer` empty), so its `checkSeo()` is unavailable.
 * This audits the same concerns — metadata coverage, canonical, structured
 * data, sitemap/robots/llms reachability, heading hierarchy — by fetching the
 * rendered pages instead, which is what actually matters anyway.
 *
 * Usage:  npm run check-seo   [BASE_URL]
 * Exits non-zero if any check fails.
 */

const BASE = process.argv[2] || "http://localhost:3100";

let failures = 0;
function check(label, ok, detail = "") {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  — ${detail}` : ""}`);
}

async function get(path, accept = "*/*") {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { accept },
      signal: AbortSignal.timeout(60_000),
      redirect: "follow",
    });
    return { status: res.status, body: await res.text() };
  } catch (e) {
    return { status: 0, body: "", error: e?.message };
  }
}

/** Pull one attribute out of a tag matched by a regex-ish selector. */
function attr(html, re) {
  const m = html.match(re);
  return m ? m[1] : null;
}

const PAGES = [
  { path: "/", label: "home" },
  { path: "/about", label: "about" },
  { path: "/communities", label: "communities" },
  { path: "/market", label: "market" },
  { path: "/@faisalamin", label: "profile" },
];

console.log(`SEO audit — ${BASE}\n`);

/* ---- 1. Per-page metadata ------------------------------------------- */
for (const { path, label } of PAGES) {
  const { status, body } = await get(path);

  if (status !== 200) {
    check(`${label} ${path} responds`, false, `HTTP ${status}`);
    continue;
  }

  const canonical = attr(body, /<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)
    ?? attr(body, /<link[^>]*href="([^"]+)"[^>]*rel="canonical"/);
  const title = attr(body, /<title[^>]*>([^<]*)<\/title>/);
  const description = attr(body, /<meta[^>]*name="description"[^>]*content="([^"]*)"/)
    ?? attr(body, /<meta[^>]*content="([^"]*)"[^>]*name="description"/);
  const ogTitle = attr(body, /<meta[^>]*property="og:title"[^>]*content="([^"]*)"/);
  const ogImage = attr(body, /<meta[^>]*property="og:image"[^>]*content="([^"]*)"/);

  check(`${label} HTTP 200`, status === 200, `got ${status}`);
  check(`${label} has <title>`, !!title, title?.slice(0, 60));
  check(`${label} has meta description`, !!description);
  check(`${label} has og:title`, !!ogTitle);
  check(`${label} has og:image`, !!ogImage);
  check(`${label} has absolute canonical`, !!canonical && /^https?:\/\//.test(canonical), canonical);

  // A canonical should carry the same *path* as the URL being requested.
  // The origin may legitimately differ when auditing localhost, because the
  // canonical correctly points at production.
  if (canonical) {
    let canonicalPath = "/";
    try {
      canonicalPath = new URL(canonical).pathname;
    } catch {
      canonicalPath = "";
    }
    const herePath = path === "/" ? "/" : path.replace(/\/$/, "");
    const there = canonicalPath === "/" ? "/" : canonicalPath.replace(/\/$/, "");
    check(`${label} canonical path matches the route`, there === herePath, `${there} vs ${herePath}`);
  }

  const h1s = body.match(/<h1[\s>]/g) || [];
  check(`${label} has exactly one <h1>`, h1s.length === 1, `found ${h1s.length}`);

  check(`${label} emits JSON-LD`, body.includes('type="application/ld+json"'));
}

/* ---- 2. Crawler files ------------------------------------------------ */
console.log("");

const robots = await get("/robots.txt", "text/plain");
check("robots.txt responds", robots.status === 200, `HTTP ${robots.status}`);
check("robots.txt references the sitemap", /sitemap/i.test(robots.body));
check("robots.txt disallows /api/", /disallow:\s*\/api\//i.test(robots.body));

const sitemap = await get("/sitemap.xml", "application/xml");
check("sitemap.xml responds", sitemap.status === 200, `HTTP ${sitemap.status}`);
check(
  "sitemap.xml is a sitemap index",
  sitemap.body.includes("<sitemapindex"),
  sitemap.body.includes("<urlset") ? "is a urlset (no index)" : undefined,
);

// Every child the index advertises must itself respond — a dead child is what
// Search Console reports as "Sitemap could not be read".
const children = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
check("sitemap index lists children", children.length > 0, `${children.length} listed`);
for (const child of children) {
  const url = new URL(child);
  const res = await get(url.pathname, "application/xml");
  const ok = res.status === 200 && res.body.includes("<urlset");
  check(`  child ${url.pathname}`, ok, `HTTP ${res.status}`);
}

const llms = await get("/llms.txt", "text/plain");
check("llms.txt responds", llms.status === 200, `HTTP ${llms.status}`);
check("llms.txt starts with an H1 heading", llms.body.startsWith("#"));
check("llms.txt has a summary line", llms.body.includes("\n> "));
check("llms.txt links the canonical post form", llms.body.includes("/@author/permlink"));

/* ---- 3. Robots must not fight the sitemap ---------------------------- */
console.log("");
check(
  "robots.txt does not disallow what the sitemap lists",
  !/disallow:\s*\/@\//i.test(robots.body),
  "profiles/posts are sitemap-listed",
);

console.log(failures === 0 ? "\nAll SEO checks passed ✔" : `\n${failures} check(s) FAILED ✘`);
process.exit(failures === 0 ? 0 : 1);
