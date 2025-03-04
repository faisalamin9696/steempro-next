"use client";

import { getPost, getAuthorExt } from "@/libs/steem/sds";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import React from "react";
import ErrorCard from "@/components/ErrorCard";
import LoadingCard from "@/components/LoadingCard";
import ProfileInfoCard from "@/components/ProfileInfoCard";
import MainWrapper from "@/components/wrappers/MainWrapper";
import PostPage from "./PostPage";

function page() {
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

export default page;
