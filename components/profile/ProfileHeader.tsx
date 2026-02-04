"use client";

import { proxifyImageUrl } from "@/utils/proxifyUrl";
import BackgroundImage from "../BackgroundImage";
import SAvatar from "../ui/SAvatar";
import FollowButton from "./FollowButton";
import ChatButton from "../chat/ChatButton";
import { useSession } from "next-auth/react";
import { useDeviceInfo } from "@/hooks/redux/useDeviceInfo";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { useEffect } from "react";
import { addLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { Constants } from "@/constants";
import ShareButton from "../ui/ShareButton";
import EditButton from "../ui/EditButton";
import { useState } from "react";
import { getUnreadChatCount } from "@/libs/supabase/chat";
import ChatModal from "../chat/ChatModal";
import MemoKeyModal from "../chat/MemoKeyModal";
import secureLocalStorage from "react-secure-storage";
import { getChatMemoKey } from "@/utils/user";
import Reputation from "../post/Reputation";

function ProfileHeader({ account }: { account: AccountExt }) {
  const { data: session } = useSession();
  const isMe = session?.user?.name === account.name;
  const otherProfileData =
    useAppSelector((s) => s.profileReducer.values[account.name]) ?? account;
  const loginData = useAppSelector((s) => s.loginReducer.value);
  const profileData = isMe ? loginData : otherProfileData;
  const { name, posting_json_metadata } = profileData || {};
  const { profile = {} } = JSON.parse(posting_json_metadata || "{}");
  const { isMobile } = useDeviceInfo();
  const dispatch = useAppDispatch();
  const { cover_image = null, name: fullName = "" }: PostingJsonMetadata =
    profile;
  const displayName = (fullName || profileData.name).replace("@", "");
  const shareUrl = `${Constants.site_url}/@${name}`;

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMemoModalOpen, setIsMemoModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleOpenChat = () => {
    const memoKey = getChatMemoKey(session?.user?.name || "");
    if (memoKey) {
      setIsChatOpen(true);
    } else {
      setIsMemoModalOpen(true);
    }
  };

  useEffect(() => {
    if (isMe) dispatch(addLoginHandler(account));
    if (session?.user?.name) {
      getUnreadChatCount(session.user.name).then(setUnreadCount);
    }
  }, [isMe, session]);

  return (
    <>
      <div className="flex flex-col w-full h-auto">
        <div className="relative block lg:hidden">
          <BackgroundImage
            className="rounded-md sm:h-30 h-24"
            src={proxifyImageUrl(cover_image)}
            height={isMobile ? 80 : 120}
            width="100%"
            overlay={!cover_image}
            overlayClass="bg-foreground/10"
          />

          <div className="mt-2 pb-2 sm:mt-0 flex flex-col  1xs:flex-row items-center gap-2 w-full">
            <div className="flex flex-row items-center gap-2 w-full">
              <div className="mt-0 sm:-mt-8 ps-0 sm:ps-6 md:-mt-12">
                <SAvatar
                  username={name}
                  size={isMobile ? "md" : "lg"}
                  quality="medium"
                  isBordered
                  className="ring-background bg-background! "
                  radius="full"
                />
              </div>

              <div className="flex flex-col md:-mt-2">
                <p className="text-lg sm:text-xl font-bold">{displayName}</p>
                <div className="flex flex-row gap-1">
                  <p className="text-sm text-muted">@{name}</p>
                  <Reputation value={profileData.reputation} />
                </div>
              </div>
            </div>

            <div className="flex flex-row w-full flex-wrap justify-end gap-2">
              {!isMe && (
                <>
                  <FollowButton
                    size={isMobile ? "sm" : "md"}
                    radius="md"
                    account={profileData}
                  />

                  <ChatButton
                    size={isMobile ? "sm" : "md"}
                    unreadCount={unreadCount}
                    onPress={handleOpenChat}
                  />
                </>
              )}

              {isMe && (
                <EditButton
                  size={isMobile ? "sm" : "md"}
                  variant="flat"
                  color="primary"
                  title={"Edit Profile"}
                />
              )}

              <ShareButton
                url={shareUrl}
                size={isMobile ? "sm" : "md"}
                variant="flat"
                title={displayName}
              />
            </div>
          </div>
        </div>

        <div className="hidden flex-row items-center gap-4 lg:flex">
          <SAvatar size={"lg"} username={profileData.name} quality="medium" />
          <div className="flex flex-col min-w-0">
            <p className="text-lg sm:text-xl font-bold truncate">
              {displayName}
            </p>
            <div className="flex flex-row gap-1">
              <p className="text-sm text-muted">@{name}</p>
              <Reputation value={profileData.reputation} />
            </div>
          </div>
        </div>
      </div>
      {isChatOpen && (
        <ChatModal
          isOpen={isChatOpen}
          onOpenChange={setIsChatOpen}
          recipient={account.name}
        />
      )}
      {isMemoModalOpen && (
        <MemoKeyModal
          isOpen={isMemoModalOpen}
          onOpenChange={setIsMemoModalOpen}
          username={session?.user?.name || ""}
          onSuccess={() => setIsChatOpen(true)}
        />
      )}
    </>
  );
}

export default ProfileHeader;
