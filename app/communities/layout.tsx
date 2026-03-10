import MainWrapper from "@/components/wrappers/MainWrapper";
import PageHeader from "@/components/ui/PageHeader";
import { Users } from "lucide-react";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import { Suspense } from "react";
import LoadingStatus from "@/components/LoadingStatus";

export const metadata: Metadata = getMetadata.communities();

async function layout({ children }: { children: React.ReactNode }) {
  return (
    <MainWrapper className="flex flex-col gap-6">
      <PageHeader
        icon={Users}
        title="Communities"
        description="Explore and join vibrant communities on Steem. Manage your subscriptions and keep up with what matters most to you."
      />
      <Suspense fallback={<LoadingStatus />}>{children}</Suspense>
    </MainWrapper>
  );
}

export default layout;
