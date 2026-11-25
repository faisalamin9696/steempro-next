import { auth } from "@/auth";
import { JsonLd } from "@/components/seo/JsonLd";
import ProfileCard from "@/components/profile/ProfileCard";
import ProfileHeader from "@/components/profile/ProfileHeader";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { accountOr404 } from "@/libs/sds-server";
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
  const account = await accountOr404(username, session?.user?.name);

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
