import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppLayout from "./AppLayout";
import { Suspense } from "react";
import LoadingCard from "@/components/ui/LoadingCard";
import { ThemeProvider } from "next-themes";
import { BotIdClient } from "botid/client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.steempro.com"),
  title: {
    default: "SteemPro",
    template: "%s | SteemPro",
    absolute: "",
  },
  keywords:
    "SteemPro, steem, blockchain, steempro, web3, decentralized social media, social",
  description:
    "Experience a social network empowered by the Steem blockchain. Explore trending discussions and share your unique perspective.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    siteName: "SteemPro",
    title: "SteemPro - Decentralized Social Media",
    description:
      "Experience a social network empowered by the Steem blockchain.",
    url: "/",
    images: ["opengraph-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "SteemPro - Decentralized Social Media",
    description:
      "Experience a social network empowered by the Steem blockchain.",
    site: "@steemproblogs",
    images: ["opengraph-image.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <BotIdClient
          protect={[
            {
              path: "/api/boost/request-permission",
              method: "POST",
            },
            {
              path: "/api/boost",
              method: "POST",
            },
            {
              path: "/api/translate",
              method: "POST",
            },
            {
              path: "/api/price",
              method: "POST",
            },
            {
              path: "/api/chat",
              method: "POST",
            },
            {
              path: "/api/track",
              method: "POST",
            },
            {
              path: "/api/auth/*",
              method: "POST",
            },
            {
              path: "/schedules",
              method: "POST",
            },
            {
              path: "/submit",
              method: "POST",
            },
          ]}
        />
      </head>

      <body
        className={`*:${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider
          attribute="class"
          disableTransitionOnChange
          defaultTheme="dark"
        >
          <Suspense fallback={<LoadingCard />}>
            <AppLayout>{children}</AppLayout>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
