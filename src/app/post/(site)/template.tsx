import MainWrapper from "@/components/wrappers/MainWrapper";
import { getPost } from "@/libs/steem/sds";
import usePathnameServer from "@/libs/utils/usePathnameServer";
import PostPage from "./page";
import PostStart from "./@start/page";
import ProfileInfoCard from "@/components/ProfileInfoCard";
import { auth } from "@/auth";

export default async function LayoutTemplate({
  children,
  start,
  end,
}: Readonly<{
  children: React.ReactNode;
  start: React.ReactNode;
  end: React.ReactNode;
}>) {
  const { username, permlink } = usePathnameServer();
  const session = await auth();

  const data = await getPost(username, permlink, session?.user?.name || "null");
  // const tag = data.community ? JSON.parse(data.json_metadata)?.['tags'][0] : data.category

  return (
    <main className="main" key={permlink}>
      <MainWrapper
        endClassName={"1md:block"}
        startClassName=" max-h-screen lg:block lg:mr-4" // non-sticky classes !relative !top-0
        startContent={
          <ProfileInfoCard hideAvatar key={Math.random()} profile username={username} />
        }
        endContent={<PostStart />}
      >
        <PostPage data={data} />
      </MainWrapper>
    </main>
  );
}
