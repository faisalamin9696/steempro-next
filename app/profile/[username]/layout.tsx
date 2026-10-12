import { auth } from "@/auth";
import ReloadErrorCard from "@/components/ui/ReloadErrorCard";
import { JsonLd } from "@/components/seo/JsonLd";
import ProfileCard from "@/components/profile/ProfileCard";
import ProfileHeader from "@/components/profile/ProfileHeader";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { sds } from "@/libs/sds-client";
import { mapSds } from "@steempro/sds-api";
import { profileJsonLd } from "@/utils/jsonld";
import { Suspense } from "react";
import ProfileHeaderSkeleton from "@/components/skeleton/ProfileHeaderSkeleton";

interface ProfileLayoutProps {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}

async function layout({ children, params }: ProfileLayoutProps) {
  const { username } = await params;
  const session = await auth();

  // A freshly created account is not in the SDS index yet, and any mirror can
  // be mid-sync or down — both raise (SDSApiError / SDSHttpError) rather than
  // returning null. Neither is a crash: fall through to the card below so the
  // rest of the app keeps rendering and metadata still resolves.
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
      <MainWrapper>
        <ReloadErrorCard
          title="Profile unavailable"
          message={`@${username} could not be loaded. The account may not exist yet, or the Steem data service is temporarily unavailable.`}
          errorMessage={`@${username} could not be loaded — the account may not exist yet, or the data service is unavailable.`}
        />
      </MainWrapper>
    );
  }

  return (
    <Suspense
      fallback={
        <MainWrapper>
          <ProfileHeaderSkeleton />
        </MainWrapper>
      }
    >
      <JsonLd data={profileJsonLd(username.toLowerCase(), account)} />
      <MainWrapper
        endClass="w-[320px] min-w-[320px] 1md:hidden! lg:block!"
        end={<ProfileCard account={account} className="card" />}
      >
        <ProfileHeader key={"profile-header"} account={account} />
        {children}
      </MainWrapper>
    </Suspense>
  );
}

export default layout;
