import { connection } from "next/server";
import { renderPostsXml, serveSitemap } from "@/utils/sitemap";

/**
 * `/posts.xml` — recent posts.
 *
 * `connection()` must run before any I/O: with `cacheComponents` enabled it is
 * what tells Next the SDS reads below can only happen per request, so none of
 * them execute during `next build`.
 */
export async function GET(): Promise<Response> {
  await connection();

  return serveSitemap("posts", renderPostsXml);
}
