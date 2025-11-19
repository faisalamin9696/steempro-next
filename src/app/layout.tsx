import type { Metadata } from "next";
import "./globals.css";
import "./main.scss";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { Providers } from "./providers";
import { auth } from "@/auth";
// export const runtime = 'edge' // 'nodejs' (default) | 'edge'
// const inter = Inter({ subsets: ["latin"] });

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
    url: "https://www.steempro.com",
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
    site: "@steemproblogs",
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

  return (
    <html lang="en" suppressHydrationWarning={true}>

      {/* <script async src="https://embed.redditmedia.com/widgets/platform.js" /> */}
      {/* steempro-chest  */}
      {/* <Script
        strategy="afterInteractive"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4510618528305465`}
        crossOrigin="anonymous"
      /> */}
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
