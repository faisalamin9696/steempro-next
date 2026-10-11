"use client";

import CommunitiesPage from "@/app/communities/(site)/CommunitiesPage";
import LoadingStatus from "@/components/LoadingStatus";
import { sds } from "@/libs/sds-client";
import { mapSds } from "@steempro/sds-api";
import useSWR from "swr";

function CommunitiesTab({ account }: { account: AccountExt }) {
  const { data, isLoading, error } = useSWR(
    account.name ? `communities-${account.name}` : null,
    async () =>
      mapSds<Community[]>(
        await sds.communities.getCommunitiesBySubscriber({
          subscriber: account.name,
          observer: account.name,
          limit: 1000,
          offset: 0,
        }),
      )
  );

  if (isLoading) return <LoadingStatus />;

  if (error) throw new Error(error);

  return <CommunitiesPage data={data || []} account={account.name} />;
}

export default CommunitiesTab;
