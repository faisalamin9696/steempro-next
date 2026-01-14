import MainWrapper from "@/components/wrappers/MainWrapper";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";

async function layout({ children }: { children: React.ReactNode }) {
  return <MainWrapper>{children}</MainWrapper>;
}

export default layout;

export async function generateMetadata({ params }): Promise<Metadata> {
  let { category, tag } = await params;
  const { title, description, keywords } = getMetadata.category(category, tag);

  return {
    title,
    description,
    keywords: keywords.join(", "),
  };
}
