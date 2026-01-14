"use client";

import CommunitiesPage from "@/app/communities/page";
import LoadingStatus from "@/components/LoadingStatus";
import { sdsApi } from "@/libs/sds";
import useSWR from "swr";

function CommunitiesTab({ account }: { account: AccountExt }) {
  const { data, isLoading, error } = useSWR(
    account.name ? `communities-${account.name}` : null,
    () => sdsApi.getCommunitiesBySubscriber(account.name, account.name)
  );

  if (isLoading) return <LoadingStatus />;

  if (error) throw new Error(error);

  return <CommunitiesPage data={data || []} account={account.name} />;
}

export default CommunitiesTab;
