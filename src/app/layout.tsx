import type { Metadata } from "next";
import "./globals.css";
import "./markdown.scss";
import "./main.scss";
import { Toaster } from "sonner";
import { AppStrings } from "@/constants/AppStrings";
import { SessionProvider } from "next-auth/react";
import { Providers } from "./providers";
import { auth } from "@/auth";
import { cookies } from 'next/headers';
import { getSettings } from "@/utils/user";
import { languages, defaultLanguage } from "@/contexts/LanguageContext";
// export const runtime = 'edge' // 'nodejs' (default) | 'edge'
// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.steemcn.blog"),
  title: {
    default: "SteemCN",
    template: "%s | SteemCN",
    absolute: "",
  },
  keywords:
    "SteemCN, steem, blockchain, steemcn, web3, decentralized social media, social",
  description:
    "Experience a social network empowered by the Steem blockchain. Explore trending discussions and share your unique perspective.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    siteName: "SteemCN",
    url: "https://www.steemcn.blog",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ericet369",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  
  // Get language from cookies or use default
  // In Next.js 15, cookies() is asynchronous and must be awaited
  const cookieStore = await cookies();
  const langCookie = cookieStore.get('lang');
  const langCode = langCookie?.value || defaultLanguage.code;
  
  return (
    <html lang={langCode} suppressHydrationWarning={true}>
      <link
        rel="dns-prefetch"
        href="https://agaf0ijry8z9fi9i.public.blob.vercel-storage.com/og.jpg"
      />
      <link
        rel="preconnect"
        href="https://agaf0ijry8z9fi9i.public.blob.vercel-storage.com/og.jpg"
      />
      <link rel="preconnect " href={AppStrings.sds_base_url} />

      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4510618528305465"
        crossOrigin="anonymous"></script>

      <script async src="https://embed.redditmedia.com/widgets/platform.js" />

      <body>
        <SessionProvider session={session}>
          <Providers>
            {children}
            <Toaster richColors closeButton />
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
