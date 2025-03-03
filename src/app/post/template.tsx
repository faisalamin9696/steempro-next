"use client";

import { getAuthorExt, getPost } from "@/libs/steem/sds";
import ProfileInfoCard from "@/components/ProfileInfoCard";
import MainWrapper from "@/components/wrappers/MainWrapper";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import LoadingCard from "@/components/LoadingCard";
import ErrorCard from "@/components/ErrorCard";
import PostPage from "./(site)/page";
import useSWR from "swr";

export default function Template() {
  const { username, permlink } = usePathnameClient();
  const { data: session } = useSession();

  const { data, isLoading, error } = useSWR(
    username && permlink
      ? [`post-${username}-${permlink}`, session?.user?.name]
      : null,
    () =>
      Promise.all([
        getPost(username, permlink, session?.user?.name || "null"),
        getAuthorExt(username, session?.user?.name || "null"),
      ])
  );

  if (error) return <ErrorCard message={error?.message} />;
  if (isLoading || !data) return <LoadingCard />;

  return (
    <MainWrapper
      endClassName={"1md:block min-w-[320px] w-[320px]"}
      endContent={<ProfileInfoCard account={data[1]} />}
    >
      <PostPage data={data[0]} />
    </MainWrapper>
  );
}
