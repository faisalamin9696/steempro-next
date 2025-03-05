"use client";

import { getAccountExt, getCommunity } from "@/libs/steem/sds";
import MainWrapper from "@/components/wrappers/MainWrapper";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import LoadingCard from "@/components/LoadingCard";
import ErrorCard from "@/components/ErrorCard";
import CommunityCarousel from "@/components/carousal/CommunityCarousal";
import CommunityHeader from "@/components/CommunityHeader";
import CommunityInfoCard from "@/components/CommunityInfoCard";
import CommunityPage from "./(site)/CommunityPage";
import useSWR from "swr";

export default function Template() {
  const { community } = usePathnameClient();
  const { data: session } = useSession();

  const { data, isLoading, error } = useSWR(
    community ? [`community-${community}`, session?.user?.name] : null,
    () =>
      Promise.all([
        getCommunity(community, session?.user?.name || "null"),
        getAccountExt(community, session?.user?.name || "null"),
      ])
  );

  if (isLoading) return <LoadingCard />;
  if (error || !data) return <ErrorCard message={error?.message} />;

  return (
    <MainWrapper
      endClassName="overflow-y-scroll max-h-screen min-w-[320px] w-[320px] pb-10"
      endContent={<CommunityInfoCard key={Math.random()} community={data[0]} />}
    >
      <CommunityHeader community={data[0]} account={data[1]} />
      <CommunityCarousel className=" mt-2" />
      <CommunityPage data={data[0]} />
    </MainWrapper>
  );
}
