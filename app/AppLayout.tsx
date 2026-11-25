// app/AppLayout.tsx
import { NextIntlClientProvider } from "next-intl";
import type { AbstractIntlMessages } from "next-intl";
import type { Session } from "next-auth";
import Providers from "./providers";

/**
 * The provider stack, now synchronous.
 *
 * It used to be an async component wrapped in a `<Suspense>` in the root
 * layout. That boundary let Next flush an HTML shell — and a `200 OK` status —
 * before the page resolved, so `notFound()` rendered the right UI under the
 * wrong status code. Crawlers then indexed empty profile shells. The data it
 * needs is now awaited in `app/layout.tsx`, above the point where the response
 * starts, so a missing page is a real 404.
 */
export default function AppLayout({
  locale,
  messages,
  globals,
  session,
  children,
}: {
  locale: string;
  messages: AbstractIntlMessages;
  globals: GlobalProps;
  session: Session | null;
  children: React.ReactNode;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers globals={globals} session={session}>
        {children}
      </Providers>
    </NextIntlClientProvider>
  );
}
