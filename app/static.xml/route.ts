import { renderStaticXml, xmlResponse } from "@/utils/sitemap";

/**
 * `/static.xml` — the constant pages, and the only child that needs no data.
 *
 * This is the file Search Console was always able to read while the others
 * timed out, so it stays exactly as it was: no fetch, no cache, no way to fail.
 * `/submit` and `/trending` are deliberately absent; see `STATIC_PAGES`.
 */
export async function GET(): Promise<Response> {
  return xmlResponse(await renderStaticXml());
}
