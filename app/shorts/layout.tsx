import { Metadata } from "next";
import { getMetadata } from "@/utils/metadata";
import MaintenanceCard from "@/components/ui/MaintenanceCard";

export const metadata: Metadata = getMetadata.shorts();

export default function Layout({ children }: { children: React.ReactNode }) {
  return <MaintenanceCard />;
  // return children;
}
