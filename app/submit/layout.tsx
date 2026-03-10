import MainWrapper from "@/components/wrappers/MainWrapper";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";

export const metadata: Metadata = getMetadata.submit();

async function layout({ children }: { children: React.ReactNode }) {
  return <MainWrapper>{children}</MainWrapper>;
}

export default layout;
