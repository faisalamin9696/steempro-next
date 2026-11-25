// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import AppLayout from "./AppLayout";
import { ThemeProvider } from "next-themes";
import { auth } from "@/auth";
import { sdsApi } from "@/libs/sds";
import { getLocale, getMessages } from "next-intl/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-noto-nastaliq-urdu",
  subsets: ["arabic"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
};

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.steempro.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "SteemPro - Decentralized Blogging & Social Platform",
    template: "%s | SteemPro",
  },
  description:
    "Discover, share, and earn rewards on SteemPro. A modern, decentralized blogging platform built on the Steem blockchain.",
  keywords: [
    "SteemPro",
    "Steem",
    "Web3",
    "Blockchain Blogging",
    "Crypto Rewards",
    "Decentralized Social Media",
    "STEEM Token",
  ],
  authors: [{ name: "SteemPro Team", url: baseUrl }],
  creator: "SteemPro",
  publisher: "SteemPro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // NOTE: no site-wide `alternates.canonical` here. Metadata from this root
  // layout is inherited by every route, so a global canonical of "/" made all
  // routes that didn't set their own (communities, explorer, proposals, tools…)
  // declare the homepage as their canonical — Google then dropped them as
  // duplicates of the homepage. Every route must declare its own canonical.
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "SteemPro",
    title: "SteemPro - Decentralized Blogging & Social Platform",
    description:
      "Discover, share, and earn rewards on SteemPro. A modern, decentralized blogging platform built on the Steem blockchain.",
    images: [
      {
        url: `${baseUrl}/logo192.png`,
        width: 192,
        height: 192,
        alt: "SteemPro Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SteemPro - Decentralized Blogging & Social Platform",
    description:
      "Discover, share, and earn rewards on SteemPro. A modern, decentralized blogging platform built on the Steem blockchain.",
    creator: "@steempro",
    images: [`${baseUrl}/logo192.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Awaited here, not inside a Suspense boundary: the status line is written
  // when the first byte flushes, so anything that can decide "this page does
  // not exist" has to resolve before that. `getGlobalProps` is cached for 60s
  // (see libs/sds.ts), and the rest is cookie/JWT work, so this is cheap.
  const [locale, messages, globals, session] = await Promise.all([
    getLocale(),
    getMessages(),
    sdsApi.getGlobalProps(),
    auth(),
  ]);

  return (
    <html lang="en" suppressHydrationWarning>
      <script
        async
        defer
        src="https://analytics.steempro.com/script.js"
        data-website-id="71e9bdb4-ddf2-4ca8-8db0-75f527e55a4d"
      ></script>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoNastaliqUrdu.variable}`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "SteemPro",
              url: baseUrl,
              potentialAction: {
                "@type": "SearchAction",
                target: `${baseUrl}/explorer?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SteemPro",
              url: baseUrl,
              logo: `${baseUrl}/logo192.png`,
              sameAs: [
                "https://twitter.com/steempro",
              ],
            }),
          }}
        />
        <ThemeProvider
          attribute="class"
          disableTransitionOnChange
          defaultTheme="dark"
          enableSystem={false}
        >
          <AppLayout
            locale={locale}
            messages={messages}
            globals={globals}
            session={session}
          >
            {children}
          </AppLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
