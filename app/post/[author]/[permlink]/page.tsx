import { auth } from "@/auth";
import { JsonLd } from "@/components/seo/JsonLd";
import ProfileCard from "@/components/profile/ProfileCard";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { sdsApi } from "@/libs/sds";
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
  const [account, post] = await Promise.all([
    sdsApi.getAccountExt(author, session?.user?.name),
    sdsApi.getPost(author, permlink, session?.user?.name),
  ]);

  // A missing post must be a real 404. Rendering the not-found UI inside a 200
  // response makes Google index an error page and waste crawl budget on it.
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
