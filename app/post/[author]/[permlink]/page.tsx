import { auth } from "@/auth";
import { JsonLd } from "@/components/seo/JsonLd";
import ProfileCard from "@/components/profile/ProfileCard";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { sds, isChainMiss } from "@/libs/sds-client";
import { mapSds } from "@steempro/sds-api";
import { blogPostingJsonLd, breadcrumbJsonLd } from "@/utils/jsonld";
import PostPage from "../../(site)/PostPage";
import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.steempro.com";

async function page({
  params,
}: {
  params: Promise<{ author: string; permlink: string }>;
}) {
  const { author, permlink } = await params;
  const session = await auth();

  // getPost/getAccountExt raise an SDSApiError for an unknown post or author
  // rather than resolving null, so the sentinel check below never got the
  // chance to run and the error escaped as a 500. A chain-level miss is
  // rendered through the not-found boundary instead. (The HTTP status stays
  // 200 -- this route is Partial Prerendered, so the shell's status is
  // already committed -- which is why generateMetadata also marks the page
  // noindex; see utils/metadata.ts.)
  let lookups: [AccountExt, Post];
  try {
    lookups = await Promise.all([
      mapSds<AccountExt>(
        await sds.accounts.getAccountExt({
          account: author,
          observer: session?.user?.name ?? "steem",
        }),
      ),
      mapSds<Post>(
        await sds.posts.getPost({
          author,
          permlink,
          withVotes: true,
          observer: session?.user?.name ?? "steem",
        }),
      ),
    ]);
  } catch (error) {
    if (isChainMiss(error)) notFound();
    throw error;
  }
  const [account, post] = lookups;

  // Unreachable for a missing post (SDS raises instead of returning a
  // sentinel), but kept as a belt-and-braces guard for a null or empty result.
  if (!post || post.link_id === -1) notFound();

  const canonical = `${BASE_URL}/@${author}/${permlink}`;

  return (
    <>
      <JsonLd
        data={[
          blogPostingJsonLd(post, canonical),
          breadcrumbJsonLd([
            { name: "Home", url: BASE_URL },
            { name: `@${author}`, url: `${BASE_URL}/@${author}` },
            { name: post.title || "Post", url: canonical },
          ]),
        ]}
      />
      <MainWrapper
        endClass="w-[320px] min-w-[320px] hidden lg:block"
        end={<ProfileCard account={account} className="card" />}
      >
        <PostPage key={`${author}-${permlink}`} data={post} />
      </MainWrapper>
    </>
  );
}

export default page;
