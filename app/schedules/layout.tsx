import MainWrapper from "@/components/wrappers/MainWrapper";
import PageHeader from "@/components/ui/PageHeader";
import { CalendarSearch } from "lucide-react";
import { Metadata } from "next";
import { getMetadata } from "@/utils/metadata";

const { title, description, keywords, alternates } = getMetadata.schedules();
export const metadata: Metadata = {
  title,
  description,
  keywords,
  alternates,
};

async function layout({ children }: { children: React.ReactNode }) {
  return (
    <MainWrapper className="flex flex-col gap-6">
      <PageHeader
        icon={CalendarSearch}
        title="Schedules"
        description="Manage your schedule posts"
      />

      {children}
    </MainWrapper>
  );
}

export default layout;
