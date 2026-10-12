import { extractBodySummary } from "./extractContent";
import { getResizedAvatar, getThumbnail } from "./image";
import { extractVideoUrl } from "./shorts";

/**
 * schema.org structured data builders.
 *
 * Server-side only — these are rendered straight into the HTML of the post,
 * profile, community and shorts routes so crawlers get rich results without
 * having to execute any client JavaScript.
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.steempro.com";

/**
 * Upper bound for a plausible content date — 2100-01-01 UTC, in ms since epoch.
 *
 * This used to be `Date.now() + 365 days`, i.e. "reject dates more than a year
 * in the future". That reads the wall clock while `generateMetadata` renders,
 * and with `cacheComponents` enabled Next.js aborts the prerender the instant
 * it does — `blocking-prerender-current-time` (E1432) — because this value
 * feeds *output* (JSON-LD written into the HTML) and a prerender must be
 * reproducible.
 *
 * A fixed cutoff keeps the protection that actually matters — nonsense years
 * such as 2999, or a seconds/millis unit mix-up — while returning the same
 * answer on every render. Nothing real sits within decades of the boundary, so
 * the looser bound costs nothing.
 */
const MAX_PLAUSIBLE_DATE_MS = Date.UTC(2100, 0, 1);

export const SITE_NAME = "SteemPro";

export type JsonLdNode = Record<string, unknown>;

function iso(value?: number | string | null): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;

  let ms: number;
  if (typeof value === "number") {
    ms = value > 1e12 ? value : value * 1000;
  } else {
    const parsed = Date.parse(value);
    if (!Number.isFinite(parsed)) return undefined;
    ms = parsed;
  }

  if (!Number.isFinite(ms) || ms <= 0) return undefined;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return undefined;
  if (date.getTime() > MAX_PLAUSIBLE_DATE_MS) return undefined;
  return date.toISOString();
}

function dropUndefined<T extends JsonLdNode>(node: T): T {
  return Object.fromEntries(
    Object.entries(node).filter(([, value]) => value !== undefined),
  ) as T;
}

function tagsOf(post: { json_metadata?: string | null; category?: string }) {
  const tags = new Set<string>();
  if (post.category) tags.add(post.category);
  if (post.json_metadata) {
    try {
      const meta = JSON.parse(post.json_metadata);
      for (const tag of meta?.tags ?? []) {
        if (typeof tag === "string" && tag) tags.add(tag);
      }
    } catch {
      // Malformed metadata must never break rendering.
    }
  }
  return [...tags];
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return dropUndefined({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
}

export function blogPostingJsonLd(post: Post, canonical: string): JsonLdNode {
  const tags = tagsOf(post);
  const image = getThumbnail(post.json_images, "640x0") || undefined;
  const description = extractBodySummary(post.body, 300) || undefined;

  return dropUndefined({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    headline: post.title,
    description,
    image: image ? [image] : undefined,
    datePublished: iso(post.created),
    dateModified: iso(post.last_update || post.created),
    author: {
      "@type": "Person",
      name: post.author,
      url: `${BASE_URL}/@${post.author}`,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/opengraph-image.jpg`,
      },
    },
    keywords: tags.length ? tags.join(", ") : undefined,
    inLanguage: "en",
  });
}

export function profileJsonLd(username: string, account?: AccountExt | null) {
  let display: { name?: string; about?: string; website?: string } = {};
  try {
    display =
      JSON.parse(account?.posting_json_metadata || "{}")?.profile ?? {};
  } catch {
    display = {};
  }

  return dropUndefined({
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${BASE_URL}/@${username}`,
    mainEntity: dropUndefined({
      "@type": "Person",
      name: display.name || username,
      alternateName: `@${username}`,
      url: `${BASE_URL}/@${username}`,
      description: display.about,
      image: getResizedAvatar(username, "large"),
      sameAs: display.website,
    }),
  });
}

export function communityJsonLd(
  accountName: string,
  community?: Community | null,
) {
  const title = community?.title || community?.account || accountName;
  const description =
    community?.about || community?.description || undefined;

  return dropUndefined({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: `${BASE_URL}/trending/${accountName}`,
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: BASE_URL,
    },
  });
}

export function videoObjectJsonLd(post: Feed, canonical: string): JsonLdNode {
  const image = getThumbnail(post.json_images, "640x0") || undefined;
  const videoUrl = extractVideoUrl(post);
  const description =
    extractBodySummary(post.body, 200) || post.title || undefined;

  return dropUndefined({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: post.title || undefined,
    description,
    thumbnailUrl: image ? [image] : undefined,
    contentUrl: videoUrl,
    embedUrl: canonical,
    url: canonical,
    uploadDate: iso(post.created),
    datePublished: iso(post.created),
    dateModified: iso(post.last_update || post.created),
    inLanguage: "en",
    author: {
      "@type": "Person",
      name: post.author,
      url: `${BASE_URL}/@${post.author}`,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: BASE_URL,
    },
  });
}
