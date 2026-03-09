import { auth } from "@/auth";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { sdsApi } from "@/libs/sds";
import { CheckCircle, Landmark, XCircle } from "lucide-react";
import React, { Suspense } from "react";
import WitnessesPage from "./page";
import LoadingStatus from "@/components/LoadingStatus";
import PageHeader from "@/components/ui/PageHeader";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";

export const metadata: Metadata = getMetadata.witnesses();

async function layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const data = await sdsApi.getWitnessesByRank(session?.user?.name, 200);

  return (
    <MainWrapper className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-4">
        <PageHeader
          icon={Landmark}
          title="Witnesses"
          description="Vote for witnesses who maintain Steem nodes and secure the blockchain. You can vote for up to 30 witnesses."
        />

        <div className="flex items-center gap-2 text-sm text-muted self-end">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Active</span>
          <XCircle className="h-4 w-4 text-warning ml-2" />
          <span>Disabled</span>
        </div>
      </div>

      <Suspense fallback={<LoadingStatus />}>
        <WitnessesPage data={data} />
      </Suspense>
    </MainWrapper>
  );
}

export default layout;
