import { auth } from "@/auth";
import { sdsApi } from "@/libs/sds";
import ProfilePage from "../../(site)/ProfilePage";

async function page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth();
  const account = await sdsApi.getAccountExt(username, session?.user?.name);

  return <ProfilePage key={"profile"} account={account} />;
}

export default page;
