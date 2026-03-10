import ProfileHeaderSkeleton from "@/components/skeleton/ProfileHeaderSkeleton";
import MainWrapper from "@/components/wrappers/MainWrapper";
import React, { Suspense } from "react";

function layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <MainWrapper>
          <ProfileHeaderSkeleton />
        </MainWrapper>
      }
    >
      {children}
    </Suspense>
  );
}

export default layout;
