import type { Metadata } from "next";
import "./globals.css";
import "./markdown.scss";
import { Toaster } from "sonner";
import clsx from "clsx";
import { AppStrings } from "@/libs/constants/AppStrings";
import { SessionProvider } from "next-auth/react";
import { auth, BASE_PATH } from "@/auth";
import { Providers } from "./providers";
import AdSense from "@/components/AdSense";
// export const runtime = 'edge' // 'nodejs' (default) | 'edge'

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
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
    images: ["https://i.ibb.co/THNsSf4/og.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@steemproblogs",
    images: ["https://i.ibb.co/THNsSf4/og.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (session && session.user) {
    session.user = {
      name: session.user.name,
      email: session.user.email,
    };
  }
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <script
          async
          src="https://fundingchoicesmessages.google.com/i/pub-4510618528305465?ers=1"
          nonce="V5q4IVTc0xC-fb0IjVrw6g"
        ></script>

        <script
          nonce="V5q4IVTc0xC-fb0IjVrw6g"
          type="text/javascript"
          src="/static/script_1.js"
        ></script>

        <script type="text/javascript" src="/static/script_2.js"></script>

        <AdSense pId="ca-pub-4510618528305465" />
      </head>

      <link
        rel="dns-prefetch"
        href="https://agaf0ijry8z9fi9i.public.blob.vercel-storage.com/og.jpg"
      />
      <link
        rel="preconnect"
        href="https://agaf0ijry8z9fi9i.public.blob.vercel-storage.com/og.jpg"
      />
      <link rel="preconnect " href={AppStrings.sds_base_url} />

      <body className={clsx()}>
        <SessionProvider session={session} basePath={BASE_PATH}>
          <Providers>
            {children}
            <Toaster richColors closeButton />
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
