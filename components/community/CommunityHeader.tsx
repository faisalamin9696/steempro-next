"use client";

import { proxifyImageUrl } from "@/utils/proxifyUrl";
import BackgroundImage from "../BackgroundImage";
import SAvatar from "../ui/SAvatar";
import { useSession } from "next-auth/react";
import { useDeviceInfo } from "@/hooks/redux/useDeviceInfo";
import SubscribeButton from "./SubscribeButton";
import { Constants } from "@/constants";
import { useAppSelector } from "@/hooks/redux/store";
import ChatButton from "../chat/ChatButton";
import ShareButton from "../ui/ShareButton";
import EditButton from "../ui/EditButton";
import { useState, useEffect } from "react";
import { getUnreadChatCount } from "@/libs/supabase/chat";
import ChatModal from "../chat/ChatModal";
import MemoKeyModal from "../chat/MemoKeyModal";
import { getChatMemoKey } from "@/utils/user";

function CommunityHeader({
  account,
  community,
}: {
  account: AccountExt;
  community: Community;
}) {
  const profileData =
    useAppSelector((s) => s.profileReducer.values[account.name]) ?? account;

  const { posting_json_metadata } = profileData || {};
  const { account: name, title, description } = community || {};
  const { profile = {} } = JSON.parse(posting_json_metadata || "{}");
  const { data: session } = useSession();
  const isMe = session?.user?.name === name;
  const { isMobile } = useDeviceInfo();
  const { cover_image = "" }: PostingJsonMetadata = profile;
  const displayName = (title || name).replace("@", "");
  const shareUrl = `${Constants.site_url}/trending/${name}`;

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
    if (session?.user?.name) {
      getUnreadChatCount(session.user.name).then(setUnreadCount);
    }
  }, [session]);

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

          <div className="mt-4 pb-2 sm:mt-0 flex flex-col 1xs:flex-row  items-center gap-2 w-full ">
            <div className="flex flex-row items-center gap-2 w-full">
              <div className="mt-0 sm:-mt-8 ps-0 sm:ps-6 md:-mt-12">
                <SAvatar
                  username={profileData.name}
                  size={isMobile ? "md" : "lg"}
                  quality="medium"
                  isBordered
                  className="ring-background bg-background! "
                  radius="full"
                />
              </div>

              <div className="flex flex-col">
                <p className="text-lg sm:text-xl font-bold">{displayName}</p>
                <p className="text-sm text-muted">@{name}</p>
              </div>
            </div>

            <div className="flex flex-row w-full flex-wrap justify-end gap-2">
              {!isMe && (
                <>
                  <SubscribeButton
                    size={isMobile ? "sm" : "md"}
                    radius="md"
                    community={community}
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
          <SAvatar size={"lg"} username={profileData.name} />
          <div className="flex flex-col min-w-0">
            <p className="text-lg sm:text-xl font-bold truncate">
              {displayName}
            </p>
            <p className="text-sm text-muted truncate">@{name}</p>
          </div>
        </div>
      </div>
      {isChatOpen && (
        <ChatModal
          isOpen={isChatOpen}
          onOpenChange={setIsChatOpen}
          community={name}
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

export default CommunityHeader;
