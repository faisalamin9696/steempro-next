import MainWrapper from "@/components/wrappers/MainWrapper";
import { getAuthorExt } from "@/libs/steem/sds";
import usePathnameServer from "@/libs/utils/usePathnameServer";
import { auth } from "@/auth";
import AccountHeader from "@/components/AccountHeader";
import ProfileEnd from "./@end/page";
import ProfilePage from "./page";

export default async function LayoutTemplate({
  children,
  start,
  end,
}: Readonly<{
  children: React.ReactNode;
  start: React.ReactNode;
  end: React.ReactNode;
}>) {
  const { username } = usePathnameServer();
  const session = await auth();
  const data = await getAuthorExt(username, session?.user?.name || "null");
  return (
    <main className="main">
      <AccountHeader account={data} />

      <MainWrapper
        endClassName="max-h-screen"
        endContent={<ProfileEnd data={data} />}
      >
        <ProfilePage data={data} />
      </MainWrapper>
    </main>
  );
}
