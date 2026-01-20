import HomeCarousal from "@/components/carousal/HomeCarousal";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { supabase } from "@/libs/supabase/supabase";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";

import StructuredData from "@/components/seo/StructuredData";

import { proxifyImageUrl } from "@/utils/proxifyUrl";

async function getData() {
  "use cache";
  const data = await supabase.rpc("get_promoted_posts");
  return data;
}

async function layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const data = (await getData())?.data as PromotedPost[];
  const firstImage = data?.[0]?.thumbnail
    ? proxifyImageUrl(data[0].thumbnail, "640x0")
    : null;

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SteemPro",
    url: "https://www.steempro.com",
    logo: "https://www.steempro.com/favicon.ico",
    sameAs: [
      "https://github.com/faisalamin9696/steempro-next",
      "https://discord.gg/SXpWY8FGCB",
    ],
  };

  return (
    <MainWrapper
      rootClassName="overflow-auto"
      className="mt-2"
      top={<HomeCarousal data={data} />}
    >
      {firstImage && (
        <link rel="preload" href={firstImage} as="image" fetchPriority="high" />
      )}
      {category === "trending" && <StructuredData data={organizationLd} />}
      {children}
    </MainWrapper>
  );
}

export default layout;

export async function generateMetadata({ params }: any): Promise<Metadata> {
  let { category } = await params;
  const { title, description, alternates } = getMetadata.home(category);

  return {
    title,
    description,
    alternates,
  };
}
