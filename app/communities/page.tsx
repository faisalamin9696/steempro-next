import { auth } from "@/auth";
import { sds } from "@/libs/sds-client";
import { mapSds } from "@steempro/sds-api";
import React from "react";
import CommunitiesPage from "./(site)/CommunitiesPage";

async function page() {
  const session = await auth();
  const data = mapSds<Community[]>(
    await sds.communities.getCommunitiesByRank({
      observer: session?.user?.name ?? "steem",
      limit: 500,
      offset: 0,
    }),
  );

  return <CommunitiesPage data={data} account={undefined} />;
}

export default page;
