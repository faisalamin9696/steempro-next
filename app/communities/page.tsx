import { auth } from "@/auth";
import { sdsApi } from "@/libs/sds";
import React from "react";
import CommunitiesPage from "./(site)/CommunitiesPage";

async function page() {
  const session = await auth();
  const data = await sdsApi.getCommunities(session?.user?.name, 500);

  return <CommunitiesPage data={data} account={undefined} />;
}

export default page;
