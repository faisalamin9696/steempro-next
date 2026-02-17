import LoadingCard from "@/components/ui/LoadingCard";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import React, { Suspense } from "react";

export const metadata: Metadata = getMetadata.about();

function layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingCard />}>
      <MainWrapper>{children}</MainWrapper>
    </Suspense>
  );
}

export default layout;
