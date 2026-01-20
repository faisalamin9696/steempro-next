import LoadingCard from "@/components/ui/LoadingCard";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import { Suspense } from "react";

const { title, description, keywords, alternates } = getMetadata.submit();
export const metadata: Metadata = {
  title,
  description,
  keywords: keywords.join(", "),
  alternates,
};

async function layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingCard />}>
      <MainWrapper>{children}</MainWrapper>
    </Suspense>
  );
}

export default layout;
