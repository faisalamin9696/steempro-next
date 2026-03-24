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

export const metadata: Metadata = {
  /* your metadata remains the same */
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoNastaliqUrdu.variable}`}
        suppressHydrationWarning
      >
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
