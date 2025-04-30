"use client";
import React, { useState } from "react";
import { useAppSelector } from "@/libs/constants/AppFunctions";
import SAvatar from "./SAvatar";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { Button } from "@heroui/button";
import { BiPlus } from "react-icons/bi";
import { abbreviateNumber } from "@/libs/utils/helper";
import { proxifyImageUrl } from "@/libs/utils/proxifyUrl";
import CommunityMembers from "./community/CommunityMembers";
import SubscribeButton from "./SubscribeButton";
import { twMerge } from "tailwind-merge";
import { useDeviceInfo } from "@/libs/hooks/useDeviceInfo";
import SLink from "./SLink";
import ChatButton from "./ChatButton";

type Props = {
  community: Community;
  account: AccountExt;
  className?: string;
  onChatPress: () => void;
};
export default function CommunityHeader(props: Props) {
  const { community, account, onChatPress } = props;
  const { isTablet } = useDeviceInfo();

  const communityInfo: Community =
    useAppSelector((state) => state.communityReducer.values)[
      community?.account ?? ""
    ] ?? community;

  const [membersModal, setMembersModal] = useState(false);

  const posting_json_metadata = JSON.parse(
    account?.posting_json_metadata || "{}"
  );

  const cover_picture = proxifyImageUrl(
    posting_json_metadata?.profile?.cover_image ?? "",
    "1280x200"
  );

  return (
    <div
      className={twMerge(
        "main relative max-w-[1280px] self-center w-full",
        props.className
      )}
    >
      <div
        className={`bg-center bg-cover bg-no-repeat bg-[#3e4146]/50 rounded-md sm:h-32 h-24 opacity-90 z-0`}
        style={{ backgroundImage: `url(${cover_picture})` }}
      />

      <div className=" flex flex-row max-sm:flex-col ">
        <div className="sm:ps-4 pe-2 md:-mt-8 z-10 hidden md:block">
          <SAvatar
            size="lg"
            loadSize="medium"
            username={communityInfo.account}
            className="hidden md:block bg-background shadow-none border-4 border-background"
          />
        </div>

        <div className=" flex flex-row items-center max-sm:items-start justify-between w-full mt-1 max-sm:gap-2 max-md:py-2">
          <div className="flex flex-row gap-2 w-full">
            <SAvatar
              username={communityInfo.account}
              size="md"
              className="hidden max-md:block border-2 shadow-none border-background"
            />

            <div className="flex flex-col items-start w-full">
              <div className="flex flex-col items-start mb-0 w-full">
                <div className=" flex flex-row justify-between w-full items-start">
                  <div className=" flex flex-col font-bold text-lg sm:text-2xl">
                    <p>{communityInfo.title}</p>
                    <SLink
                      href={`/@${communityInfo.account}`}
                      className=" font-normal text-sm hover:underline"
                    >
                      @{communityInfo.account}
                    </SLink>
                  </div>

                  <div className=" flex md:flex-row-reverse flex-col items-end relative gap-2">
                    <div className=" flex flex-row items-center gap-2">
                      <Button
                        title="Create Post"
                        radius="full"
                        size={!isTablet ? "sm" : "md"}
                        className=" bg-foreground/10"
                        variant="flat"
                        startContent={<BiPlus size={24} />}
                        as={SLink}
                        isDisabled={communityInfo.observer_role === "muted"}
                        href={
                          {
                            pathname: `/submit`,
                            query: {
                              account: communityInfo?.account,
                              title: communityInfo?.title,
                            },
                          } as any
                        }
                      >
                        Create Post
                      </Button>
                      <SubscribeButton
                        size={!isTablet ? "sm" : "md"}
                        community={communityInfo}
                      />
                    </div>
                    <div className="max-md:absolute top-10 md:top-12 1md:hidden">
                      <ChatButton
                        skipMemo
                        size={!isTablet ? "sm" : "md"}
                        onPress={onChatPress}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-[8px] md:hidden sm:flex">
                <span
                  className="lowercase text-default-900/80 text-[12px] cursor-pointer hover:underline"
                  onClick={() => {
                    setMembersModal(!membersModal);
                  }}
                >
                  {abbreviateNumber(communityInfo.count_subs)} members
                </span>
                <div className="flex flex-row items-center justify-center gap-[4px]">
                  <span className="inline-flex bg-green-500 rounded-full w-[0.5rem] h-[0.5rem]"></span>
                  <span className="lowercase text-default-900/80 text-[12px]">
                    {abbreviateNumber(communityInfo.count_authors)} active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {membersModal && (
        <Modal
          isOpen={membersModal}
          onOpenChange={setMembersModal}
          placement="top-center"
          scrollBehavior="inside"
          closeButton
        >
          <ModalContent>
            {() => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {"Members"}
                </ModalHeader>
                <ModalBody>
                  <CommunityMembers community={communityInfo} />
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
