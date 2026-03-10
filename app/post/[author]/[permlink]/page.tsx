import { auth } from "@/auth";
import ProfileCard from "@/components/profile/ProfileCard";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { sdsApi } from "@/libs/sds";
import PostPage from "../../(site)/PostPage";

async function page({
  params,
}: {
  params: Promise<{ author: string; permlink: string }>;
}) {
  const { author, permlink } = await params;
  const session = await auth();
  const [account, post] = await Promise.all([
    sdsApi.getAccountExt(author, session?.user?.name),
    sdsApi.getPost(author, permlink, session?.user?.name),
  ]);
  return (
    <MainWrapper
      endClass="w-[320px] min-w-[320px] hidden lg:block"
      end={<ProfileCard account={account} className="card" />}
    >
      {<PostPage key={`${author}-${permlink}`} data={post} />}
    </MainWrapper>
  );
}

export default page;
