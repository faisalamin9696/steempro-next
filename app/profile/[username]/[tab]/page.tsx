import { auth } from "@/auth";
import { sds } from "@/libs/sds-client";
import { mapSds } from "@steempro/sds-api";
import ProfilePage from "../../(site)/ProfilePage";

async function page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth();

  // The parent layout renders the not-found card and never reaches this
  // component when the account is missing, but generateMetadata on this route
  // runs independently — so a lookup failure here must not escape either.
  let account: AccountExt | null = null;
  try {
    account = mapSds<AccountExt>(
      await sds.accounts.getAccountExt({
        account: username,
        observer: session?.user?.name ?? "steem",
      }),
    );
  } catch {
    account = null;
  }

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <h2 className="text-lg font-semibold">Account not found</h2>
        <p className="text-sm text-default-500">
          @{username} is not available on the Steem blockchain yet.
        </p>
      </div>
    );
  }

  return <ProfilePage key={"profile"} account={account} />;
}

export default page;
