import { auth } from "@/auth";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { sdsApi } from "@/libs/sds";
import CommunitiesPage from "./page";
import PageHeader from "@/components/ui/PageHeader";
import { Users } from "lucide-react";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";

const { title, description, keywords } = getMetadata.communities();
export const metadata: Metadata = {
  title,
  description,
  keywords: keywords.join(", "),
};

async function layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const data = await sdsApi.getCommunities(session?.user?.name, 500);

  return (
    <MainWrapper className="flex flex-col gap-6">
      <PageHeader
        icon={Users}
        title="Communities"
        description="Explore and join vibrant communities on Steem. Manage your subscriptions and keep up with what matters most to you."
      />

      <CommunitiesPage data={data} account={undefined} />
    </MainWrapper>
  );
}

export default layout;
