// app/AppLayout.tsx  (alternative version)
import { auth } from "@/auth";
import { sdsCached } from "@/libs/sds-client";
import { mapSds } from "@steempro/sds-api";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import Providers from "./providers";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <DynamicProviders>{children}</DynamicProviders>
    </NextIntlClientProvider>
  );
}

async function DynamicProviders({ children }: { children: React.ReactNode }) {
  const globals = mapSds<GlobalProps>(
    await sdsCached.steemRequests.getSteemProps(),
  );
  const session = await auth();

  return (
    <Providers globals={globals} session={session}>
      {children}
    </Providers>
  );
}
