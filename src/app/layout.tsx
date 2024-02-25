import type { Metadata } from "next";
import "./globals.css";
import './markdown.scss';
import { Providers } from "./providers";
import { Toaster } from "sonner";
import clsx from "clsx";
import { getAuthorExt } from "@/libs/steem/sds";
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
  description: "Powered by Steem Blockchain",
  icons: {
    icon: '/logo192.png'
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  const session = await getServerSession();
  let data;
  
  if (session?.user?.name)
    data = await getAuthorExt(session?.user?.name)

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <link rel="dns-prefetch" href="https://identitytoolkit.googleapis.com" />
      <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
      <link rel="preconnect " href={AppStrings.sds_base_url} />

      <body className={clsx()}>
        <Providers data={data}>
          {children}
          <Toaster richColors />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
