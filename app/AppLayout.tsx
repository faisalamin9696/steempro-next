// app/AppLayout.tsx  (alternative version)
import { auth } from "@/auth";
import { sdsApi } from "@/libs/sds";
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
  const globals = await sdsApi.getGlobalProps();
  const session = await auth();

  return (
    <Providers globals={globals} session={session}>
      {children}
    </Providers>
  );
}
