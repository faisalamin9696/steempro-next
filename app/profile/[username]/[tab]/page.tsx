import { auth } from "@/auth";
import { accountOr404 } from "@/libs/sds-server";
import ProfilePage from "../../(site)/ProfilePage";

async function page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth();
  // Shares the layout's read: `accountOr404` is request-cached, so a profile
  // view is one SDS call no matter how many components ask for the account.
  const account = await accountOr404(username, session?.user?.name);

  return <ProfilePage key={"profile"} account={account} />;
}

export default page;
