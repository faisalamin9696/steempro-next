import { auth } from "@/auth";
import { sds } from "@/libs/sds-client";
import { mapSds } from "@steempro/sds-api";
import ReloadErrorCard from "@/components/ui/ReloadErrorCard";
import ProfilePage from "../../(site)/ProfilePage";

/**
 * Only `ERR_SDS_API` means SDS answered and the account genuinely is not there
 * ("Account 'x' could not be found"). Every other code — network, timeout,
 * abort, 5xx, unparseable body — means we could not find out, and must never be
 * reported as a missing account.
 */
const isAccountMissing = (error: unknown): boolean =>
  (error as { code?: string } | null | undefined)?.code === "ERR_SDS_API";

async function page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth();

  // The parent layout renders the unavailable card and never reaches this
  // component when the account is missing, but it stays mounted across tab
  // changes — so each tab switch re-runs this lookup on its own. A transient
  // failure here is the common case, and it must not be dressed up as a
  // missing account.
  let account: AccountExt | null = null;
  let lookupFailed = false;
  try {
    account = mapSds<AccountExt>(
      await sds.accounts.getAccountExt({
        account: username,
        observer: session?.user?.name ?? "steem",
      }),
    );
  } catch (error) {
    lookupFailed = !isAccountMissing(error);
    account = null;
  }

  // The chain answered: no such account, or the name cannot be one.
  if (!account && !lookupFailed) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <h2 className="text-lg font-semibold">Account not found</h2>
        <p className="text-sm text-default-500">
          @{username} is not available on the Steem blockchain yet.
        </p>
      </div>
    );
  }

  // The lookup itself failed, so the account may well exist. Offer a retry
  // instead of asserting that it does not.
  if (!account) {
    return (
      <ReloadErrorCard
        title="Profile unavailable"
        message={`@${username} could not be loaded. The account may not exist yet, or the Steem data service is temporarily unavailable.`}
        errorMessage={`The lookup for @${username} failed. The account may not exist yet, or the data service is unavailable.`}
      />
    );
  }

  return <ProfilePage key={"profile"} account={account} />;
}

export default page;
