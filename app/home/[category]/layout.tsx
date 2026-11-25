import HomeCarousal from "@/components/carousal/HomeCarousal";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { supabasePublic } from "@/libs/supabase/public";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import { proxifyImageUrl } from "@/utils/proxifyUrl";

/**
 * Promoted posts, read on the server for every request.
 *
 * The previous version read `data` and threw the error half away. A blocked
 * network, a renamed RPC or an RLS change therefore all ended the same way: an
 * empty carousel with nothing in the log to say which one happened — which is
 * exactly what a deployment looks like when the host cannot reach Supabase.
 */
async function getPromotedPosts(): Promise<PromotedPost[]> {
  const supabase = supabasePublic();
  if (!supabase) {
    console.error(
      "[home] promoted posts unavailable: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set",
    );
    return [];
  }

  const { data, error } = await supabase.rpc("get_promoted_posts");
  if (error) {
    console.error(
      `[home] get_promoted_posts failed (${error.code ?? "no-code"}): ${error.message}`,
    );
    return [];
  }

  return Array.isArray(data) ? (data as PromotedPost[]) : [];
}

async function layout({ children }: { children: React.ReactNode }) {
  const data = await getPromotedPosts();
  const firstImage = data[0]?.thumbnail
    ? proxifyImageUrl(data[0].thumbnail, "640x0")
    : null;

  return (
    <MainWrapper
      rootClassName="overflow-auto"
      className="mt-2"
      top={data.length > 0 ? <HomeCarousal data={data} /> : undefined}
    >
      {firstImage && (
        <link rel="preload" href={firstImage} as="image" fetchPriority="high" />
      )}
      {children}
    </MainWrapper>
  );
}

export default layout;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  return getMetadata.home(category);
}
