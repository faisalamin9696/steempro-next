import type { Metadata } from "next";
import "./globals.css";
import './markdown.scss';
import { Providers } from "./providers";
import { Toaster } from "sonner";
import clsx from "clsx";
import { getAuthorExt, getSteemGlobal } from "@/libs/steem/sds";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react"
import { getServerSession } from "next-auth/next";
import { AppStrings } from "@/libs/constants/AppStrings";

// export const runtime = 'edge' // 'nodejs' (default) | 'edge'

// const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "SteemPro",
    template: '%s | SteemPro',
    absolute: '',
  },
  description: "Experience a social network empowered by the Steem blockchain. Explore trending discussions and share your unique perspective.",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    shortcut: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    siteName: 'SteemPro',
    url: 'https://www.steempro.com',
    images: ['https://agaf0ijry8z9fi9i.public.blob.vercel-storage.com/og.jpg']
  },
  twitter: {
    card: 'summary_large_image',
    site: '@steemproblogs',
    images: ['https://agaf0ijry8z9fi9i.public.blob.vercel-storage.com/og.jpg']
  }

};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  const session = await getServerSession();
  let data;

  let globalData: SteemProps;
  globalData = await getSteemGlobal();

  if (session?.user?.name)
    data = await getAuthorExt(session?.user?.name)



  return (
    <html lang="en" suppressHydrationWarning={true}>

      <link rel="dns-prefetch" href="https://agaf0ijry8z9fi9i.public.blob.vercel-storage.com/og.jpg" />
      <link rel="preconnect" href="https://agaf0ijry8z9fi9i.public.blob.vercel-storage.com/og.jpg" />
      <link rel="preconnect " href={AppStrings.sds_base_url} />

      <body className={clsx()}>

        <Providers data={data} globalData={globalData}>
          {children}
          <Toaster richColors closeButton />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
