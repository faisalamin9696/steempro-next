import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import AppLayout from "./AppLayout";
import { Suspense } from "react";
import LoadingCard from "@/components/ui/LoadingCard";
import { ThemeProvider } from "next-themes";

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
    title: {
      default: "SteemPro - Decentralized Social Media",
      template: "%s | SteemPro",
    },
    description:
      "Experience a social network empowered by the Steem blockchain.",
    images: ["/opengraph-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: "SteemPro - Decentralized Social Media",
      template: "%s | SteemPro",
    },
    description:
      "Experience a social network empowered by the Steem blockchain.",
    site: "@steemproblogs",
    images: ["/opengraph-image.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`*:${geistSans.variable} ${geistMono.variable} ${notoNastaliqUrdu.variable}`}
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
