import { auth } from "@/auth";
import { JsonLd } from "@/components/seo/JsonLd";
import { sdsApi } from "@/libs/sds";
import { breadcrumbJsonLd, videoObjectJsonLd } from "@/utils/jsonld";
import { extractVideoUrl } from "@/utils/shorts";
import { notFound } from "next/navigation";
import SingleShort from "./SingleShort";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.steempro.com";

/**
 * Server component: the player itself is client-only, but fetching the short
 * here means the response already carries the title, description and
 * `VideoObject` JSON-LD — a crawler that does not run JavaScript still gets a
 * fully-described video page instead of an empty shell.
 */
export default async function SingleShortPage({
  params,
}: {
  params: Promise<{ author: string; permlink: string }>;
}) {
  const { author: rawAuthor, permlink } = await params;
  const author = decodeURIComponent(rawAuthor).replace("@", "");
  if (!author || !permlink) notFound();

  const session = await auth();

  let post: Post | null = null;
  try {
    post = await sdsApi.getPost(author, permlink, session?.user?.name || "steem");
  } catch (error) {
    console.error("[shorts] failed to load short", error);
  }

  // A missing short must be a real 404 rather than a spinner in a 200 response.
  if (!post || post.link_id === -1) notFound();

  const canonical = `${BASE_URL}/shorts/@${author}/${permlink}`;
  const videoUrl = extractVideoUrl(post);
  const heading = post.title || `Short by @${author}`;

  return (
    <>
      <JsonLd
        data={[
          videoObjectJsonLd(post, canonical),
          breadcrumbJsonLd([
            { name: "Home", url: BASE_URL },
            { name: "Shorts", url: `${BASE_URL}/shorts` },
            { name: heading, url: canonical },
          ]),
        ]}
      />
      {/* The player renders no text at all; crawlers need a heading to know what this page is. */}
      <h1 className="sr-only">{heading}</h1>
      <SingleShort
        author={author}
        permlink={permlink}
        initialPost={videoUrl ? { ...post, videoUrl } : post}
      />
    </>
  );
}
