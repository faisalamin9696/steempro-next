// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import AppLayout from "./AppLayout";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import LoadingCard from "@/components/ui/LoadingCard";

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
  alternates: {
    canonical: "/",
  },
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


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          <Suspense fallback={<LoadingCard />}>
            <AppLayout>{children}</AppLayout>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
