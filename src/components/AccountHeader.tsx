"use client";
import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/constants/AppFunctions";
import SAvatar from "./ui/SAvatar";
import { Button } from "@heroui/button";
import FollowButton from "./FollowButton";
import { proxifyImageUrl } from "@/utils/proxifyUrl";
import FollowersCard from "./FollowersCard";
import { twMerge } from "tailwind-merge";
import { IoMdShareAlt } from "react-icons/io";
import { AppLink } from "@/constants/AppConstants";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { Accordion, AccordionItem } from "@heroui/accordion";
import ProfileInfoCard from "./ProfileInfoCard";
import { useSession } from "next-auth/react";
import SLink from "./ui/SLink";
import { usePathname, useRouter } from "next/navigation";
import Reputation from "./Reputation";
import ChatButton from "./ui/ChatButton";
import SModal from "./ui/SModal";

type Props = {
  account: AccountExt;
  className?: string;
  onChatPress: () => void;
};
export default function AccountHeader(props: Props) {
  const { account, onChatPress } = props;
  const { isTablet } = useDeviceInfo();
  const { data: session } = useSession();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    router.refresh();
  }, [pathname]);

  const profileInfo: AccountExt =
    useAppSelector((state) => state.profileReducer.value)[
      account?.name ?? ""
    ] ?? account;

  const isSelf = session?.user?.name === profileInfo.name;

  const [followerModal, setFollowerModal] = useState<{
    isOpen: boolean;
    isFollowing?: boolean;
  }>({
    isOpen: false,
  });

  const posting_json_metadata = JSON.parse(
    account?.posting_json_metadata || "{}"
  );

  const cover_picture = proxifyImageUrl(
    posting_json_metadata?.profile?.cover_image ?? "",
    "1024x720"
  );

  return (
    <div
      className={twMerge("pb-4 relative self-center w-full", props.className)}
    >
      <div
        className={`transition-all block lg:hidden bg-center bg-cover bg-no-repeat bg-[#3e4146]/50 rounded-md sm:h-32 h-24 opacity-90 z-0`}
        style={{ backgroundImage: `url(${cover_picture})` }}
      />

      <div className=" flex flex-row max-sm:flex-col">
        <div className="ps-0 max-lg:ps-4 pe-2 -mt-8 lg:mt-0 z-10">
          <SAvatar
            size="lg"
            loadSize="medium"
            username={profileInfo.name}
            className="hidden sm:block bg-background shadow-none border-4 border-background"
          />
          <SAvatar
            username={profileInfo.name}
            size="md"
            loadSize="medium"
            className="hidden max-sm:block bg-background border-4 shadow-none border-background"
          />
        </div>

        <div className="flex flex-row items-center max-sm:items-start justify-between w-full mt-1 max-sm:gap-2 max-md:py-2">
          <div className=" flex flex-row gap-2 max-sm:ms-2">
            <div>
              <div className="flex flex-col items-start font-bold text-lg sm:text-2xl mb-0">
                <p>
                  {posting_json_metadata?.profile?.name ?? profileInfo.name}
                </p>

                <div className=" flex flex-row items-center gap-2">
                  <SLink
                    href={`/@${profileInfo.name}`}
                    className=" font-normal text-sm hover:underline"
                  >
                    @{profileInfo.name}
                  </SLink>

                  <Reputation
                    reputation={profileInfo.reputation}
                    className=" font-semibold"
                  />
                </div>
              </div>

              {/* <div className="flex items-center gap-[8px] md:hidden sm:flex">
                <span
                  className="lowercase text-default-900/80 text-[12px] cursor-pointer hover:underline"
                  onClick={() => {
                    setFollowerModal({ isOpen: true, isFollowing: true });
                  }}
                >
                  {abbreviateNumber(profileInfo.count_followers)} followers
                </span>
                <div className="flex flex-row items-center justify-center gap-[4px]">
                  <span className="inline-flex bg-green-500 rounded-full w-[0.5rem] h-[0.5rem]"></span>
                  <span className="lowercase text-default-900/80 text-[12px]">
                    {abbreviateNumber(profileInfo.count_following)} following
                  </span>
                </div>
              </div> */}
            </div>
          </div>

          <div className="hidden max-lg:block">
            <div className="flex flex-row items-center gap-2">
              <FollowButton
                account={profileInfo}
                size={!isTablet ? "sm" : "md"}
              />

              {isSelf ? (
                <Button
                  radius="full"
                  size={!isTablet ? "sm" : "md"}
                  className=" bg-foreground/10"
                  variant="flat"
                  startContent={<IoMdShareAlt size={18} />}
                  onPress={async () => {
                    await navigator.share({
                      url: `${AppLink}/@${profileInfo.name}`,
                    });
                  }}
                >
                  Share
                </Button>
              ) : (
                <ChatButton
                  size={!isTablet ? "sm" : "md"}
                  onPress={onChatPress}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <Accordion
        variant="splitted"
        isCompact
        className="w-full text-sm !px-0 lg:hidden mt-2"
      >
        <AccordionItem
          key="about"
          aria-label="About"
          title="About"
          classNames={{ title: "text-sm", base: "py-2", content:'p-0' }}
        >
          <ProfileInfoCard className="!bg-transparent" compact account={profileInfo} />
        </AccordionItem>
      </Accordion>

      <SModal
        isOpen={followerModal.isOpen}
        onOpenChange={(isOpen) => setFollowerModal({ isOpen: isOpen })}
        modalProps={{ scrollBehavior: "inside" }}
        bodyClassName="mt-0 p-0"
        body={() => (
          <FollowersCard
            title={followerModal.isFollowing ? "Following" : "Followers"}
            username={profileInfo.name}
            isFollowing={followerModal.isFollowing}
          />
        )}
        footer={(onClose) => (
          <Button color="danger" variant="flat" onPress={onClose}>
            Close
          </Button>
        )}
      />
    </div>
  );
}
