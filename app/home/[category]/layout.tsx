import HomeCarousal from "@/components/HomeCarousal";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { supabase } from "@/libs/supabase/supabase";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";

async function getData() {
  "use cache";
  const data = await supabase.rpc("get_promoted_posts");
  return data;
}

async function layout({ children }: { children: React.ReactNode }) {
  const data = (await getData())?.data as PromotedPost[];

  return (
    <MainWrapper
      rootClassName="overflow-auto"
      className="mt-2"
      top={<HomeCarousal data={data} />}
    >
      {children}
    </MainWrapper>
  );
}

export default layout;

export async function generateMetadata({ params }): Promise<Metadata> {
  let { category } = await params;
  const { title, description } = getMetadata.home(category);

  return {
    title,
    description,
  };
}
