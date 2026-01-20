# Task: SEO Enhancement for SteemPro

Enhance SEO across all pages by implementing standardized metadata, dynamic sitemaps, structured data (JSON-LD), and canonical URLs.

## 1. Analysis

- **Current State**:
  - Centralized metadata helper in `utils/metadata.ts`.
  - `robots.ts` configured with disallowed bots.
  - `sitemap.ts` is static and missing dynamic content.
  - Basic Open Graph and Twitter tags in `layout.tsx`.
- **Gaps**:
  - Missing Canonical URLs.
  - Missing JSON-LD Structured Data (Article for posts, Person for profiles).
  - Sitemap doesn't include posts, communities, or profiles.
  - Some pages use client-side metadata updates which aren't as effective for all crawlers (though Next.js handles server-side metadata well).

## 2. Planning

- **Goal**: Standardize and maximize SEO potential for dynamic and static pages.
- **Affected Files**:
  - `utils/metadata.ts`: Add canonical URL support and structured data generators.
  - `app/layout.tsx`: Add global canonical link and verify base metadata.
  - `app/sitemap.ts`: Convert to dynamic (if possible) or ensure key landing pages are included.
  - `app/post/[author]/[permlink]/layout.tsx`: Enhance with structured data.
  - `app/profile/[username]/layout.tsx`: Enhance with structured data.
  - `components/seo/LocalizedMetadata.tsx` (New): Component for structured data.

## 3. Solutioning

- **Canonical URLs**: Use `metadataBase` in `layout.tsx` and ensure each page generates its own `alternates.canonical`.
- **Sitemap**: Since Steem is huge, we can't list ALL posts, but we can list trending ones or recent ones.
- **Structured Data**:
  - **Article**: For post pages.
  - **Person**: For profile pages.
  - **Organization**: For the home page.
- **Improved Keywords**: Refine keyword generation logic in `metadata.ts`.

## 4. Implementation Steps

- [ ] Step 1: Update `utils/metadata.ts` with canonical URL logic and Structured Data schemas.
- [ ] Step 2: Update `app/layout.tsx` for global SEO consistency.
- [ ] Step 3: Implement Structured Data in Post layout.
- [ ] Step 4: Implement Structured Data in Profile layout.
- [ ] Step 5: Expand `app/sitemap.ts` to include more relevant routes.
- [ ] Step 6: Verify with SEO checklist script.

## 5. Verification Criteria

- [ ] Meta tags (title, description, keywords) are present on all key pages.
- [ ] Canonical URLs point to the correct routes.
- [ ] JSON-LD structured data is present and valid (using rich result test principles).
- [ ] Sitemap contains valid entries.
