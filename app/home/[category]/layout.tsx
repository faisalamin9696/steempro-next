import HomeCarousal from "@/components/carousal/HomeCarousal";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { supabasePublic } from "@/libs/supabase/public";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import { proxifyImageUrl } from "@/utils/proxifyUrl";

/**
 * Host of the configured Supabase URL, for log lines that must be actionable.
 * The URL itself is public (`NEXT_PUBLIC_*`), so naming the host is safe.
 */
function supabaseHost(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").host || "(empty)";
  } catch {
    return "(invalid URL)";
  }
}

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
    const host = supabaseHost();
    const message = String(error.message ?? "").trim();

    if (message.startsWith("<")) {
      // The web app, a catch-all proxy or an interstitial answering instead of
      // PostgREST. Logging "<!DOCTYPE html>" alone left the operator guessing.
      console.error(
        `[home] get_promoted_posts: ${host} answered with HTML, not JSON. NEXT_PUBLIC_SUPABASE_URL is not the Supabase API endpoint (or the request was intercepted) — it is baked in at build time, so fix it in the build environment and rebuild.`,
      );
      return [];
    }

    console.error(
      `[home] get_promoted_posts failed (${error.code ?? "no-code"}) at ${host}: ${message.slice(0, 200)}`,
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
