import MainWrapper from "@/components/wrappers/MainWrapper";
import React from "react";
import HomeCarousel from "@/components/carousal/HomeCarousal";
import { Metadata } from "next";
import { getMetadata } from "@/utils/metadata";
import { supabase } from "@/libs/supabase/supabase";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const data = (await supabase.rpc("get_promoted_posts"))
    ?.data as PromotedPost[];

  return (
    <MainWrapper topContent={<HomeCarousel data={data || []} />}>
      {children}
    </MainWrapper>
  );
}

export async function generateMetadata({ params }): Promise<Metadata> {
  let { category } = await params;
  const { title, description } = getMetadata.home(category);

  return {
    title,
    description,
  };
}
