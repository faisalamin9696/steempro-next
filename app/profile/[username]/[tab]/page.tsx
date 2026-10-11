import { auth } from "@/auth";
import { sds } from "@/libs/sds-client";
import { mapSds } from "@steempro/sds-api";
import ProfilePage from "../../(site)/ProfilePage";

async function page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth();
  const account = mapSds<AccountExt>(
    await sds.accounts.getAccountExt({
      account: username,
      observer: session?.user?.name ?? "steem",
    }),
  );

  return <ProfilePage key={"profile"} account={account} />;
}

export default page;
