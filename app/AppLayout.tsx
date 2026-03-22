import { auth } from "@/auth";
import { sdsApi } from "@/libs/sds";
import React, { Suspense } from "react";
import Providers from "./providers";
import LoadingCard from "@/components/ui/LoadingCard";
import { getLocale, getMessages } from "next-intl/server";

async function AppLayout({ children }: { children: React.ReactNode }) {
  const globals = await sdsApi.getGlobalProps();
  const session = await auth();
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <Providers
      globals={globals}
      session={session}
      locale={locale}
      messages={messages}
    >
      <Suspense fallback={<LoadingCard />}>{children}</Suspense>
    </Providers>
  );
}

export default AppLayout;
