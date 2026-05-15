import MaintenanceCard from "@/components/ui/MaintenanceCard";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = getMetadata.steemHeights();

function layout({ children }: { children: React.ReactNode }) {
  return <MaintenanceCard estimatedBackTime="2026-05-15T20:00:00" />;
  // return children;
}

export default layout;
