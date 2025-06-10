import MainWrapper from "@/components/wrappers/MainWrapper";
import React from "react";
import SchedulesPage from "./page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scheduled posts",
  description:
    "Manage your scheduled posts easily with SteemPro. View, edit, and delete scheduled posts in one place. Stay organized and keep your content strategy on track.",
  keywords: "SteemPro, schedule posts, scheduling",
};

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainWrapper>{children}</MainWrapper>;
}
