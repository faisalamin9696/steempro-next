"use client";

export const dynamic = "force-dynamic";
import AccountHeader from "@/components/AccountHeader";
import ProfileInfoCard from "@/components/ProfileInfoCard";
import MainWrapper from "@/components/wrappers/MainWrapper";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import { useSession } from "next-auth/react";
import LoadingCard from "@/components/LoadingCard";
import ErrorCard from "@/components/ErrorCard";
import ProfilePage from "./ProfilePage";
import useSWR from "swr";
import { fetchSds } from "@/libs/constants/AppFunctions";

export default function page() {
  const { username } = usePathnameClient();
  const { data: session } = useSession();
  const URL = `/accounts_api/getAccountExt/${username}/${
    session?.user?.name || "null"
  }`;

  const { data, isLoading, error } = useSWR(URL, fetchSds<AccountExt>, {
    suspense: true,
  });

  if (error) return <ErrorCard message={error?.message} />;
  if (isLoading) return <LoadingCard />;

  return (
    <MainWrapper
      endClassName="max-h-screen w-[320px] min-w-[320px] 1md:!hidden lg:!block"
      endContent={<ProfileInfoCard account={data} />}
    >
      <AccountHeader account={data} />

      <ProfilePage data={data} />
    </MainWrapper>
  );
}
