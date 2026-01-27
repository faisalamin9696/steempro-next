import { auth } from "@/auth";
import { sdsApi } from "@/libs/sds";
import React, { Suspense } from "react";
import Providers from "./providers";
import LoadingCard from "@/components/ui/LoadingCard";

async function AppLayout({ children }: { children: React.ReactNode }) {
  const globals = await sdsApi.getGlobalProps();
  const session = await auth();

  return (
    <Providers globals={globals} session={session}>
      <Suspense fallback={<LoadingCard />}>{children}</Suspense>
    </Providers>
  );
}

export default AppLayout;
