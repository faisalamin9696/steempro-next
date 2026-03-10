import HomeCarousal from "@/components/carousal/HomeCarousal";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { supabase } from "@/libs/supabase/supabase";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import { proxifyImageUrl } from "@/utils/proxifyUrl";

async function getData() {
  "use cache";
  const data = await supabase.rpc("get_promoted_posts");
  return data;
}

async function layout({ children }: { children: React.ReactNode }) {
  const data = (await getData())?.data as PromotedPost[];
  const firstImage = data?.[0]?.thumbnail
    ? proxifyImageUrl(data[0].thumbnail, "640x0")
    : null;

  return (
    <MainWrapper
      rootClassName="overflow-auto"
      className="mt-2"
      top={<HomeCarousal data={data} />}
    >
      {firstImage && (
        <link rel="preload" href={firstImage} as="image" fetchPriority="high" />
      )}
      {children}
    </MainWrapper>
  );
}

export default layout;

export async function generateMetadata({ params }: any): Promise<Metadata> {
  let { category } = await params;
  return getMetadata.home(category);
}
