"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/libs/constants/AppFunctions";
import { useRouter } from "next13-progressbar";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import SAvatar from "./SAvatar";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { Button } from "@heroui/button";
import { BiPlus } from "react-icons/bi";
import Link from "next/link";
import { abbreviateNumber } from "@/libs/utils/helper";
import { proxifyImageUrl } from "@/libs/utils/ProxifyUrl";
import CommunityMembers from "./community/CommunityMembers";
import SubscribeButton from "./SubscribeButton";
import { twMerge } from "tailwind-merge";
import { useDeviceInfo } from "@/libs/utils/useDeviceInfo";

type Props = {
  community: Community;
  account: AccountExt;
  className?: string;
};
export default function CommunityHeader(props: Props) {
  const { community, account } = props;
  const { username, community: communityName } = usePathnameClient();
  const { isTablet } = useDeviceInfo();

  const dispatch = useAppDispatch();
  const router = useRouter();
  const communityInfo: Community =
    useAppSelector((state) => state.communityReducer.values)[
      community?.account ?? ""
    ] ?? community;

  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  const [membersModal, setMembersModal] = useState(false);

  const posting_json_metadata = JSON.parse(
    account?.posting_json_metadata || "{}"
  );

  const cover_picture = proxifyImageUrl(
    posting_json_metadata?.profile?.cover_image ?? "",
    "1280x128"
  );

  useEffect(() => {
    router.refresh();
  }, [username, communityName]);

  return (
    <div
      className={twMerge(
        "main relative max-w-[1280px] self-center w-full",
        props.className
      )}
    >
      <div
        className={`bg-center bg-cover bg-no-repeat bg-[#3e4146]/50 rounded-md lg:h-32 h-24 opacity-90 z-0`}
        style={{ backgroundImage: `url(${cover_picture})` }}
      />

      <div className=" flex flex-row max-sm:flex-col ">
        <div className="sm:ps-4 pe-2 md:-mt-8 z-10 hidden md:block">
          <SAvatar
            size="lg"
            quality="medium"
            username={communityInfo.account}
            className="hidden md:block bg-background shadow-none  border-4 border-background"
          />
        </div>

        <div className=" flex flex-row items-center max-sm:items-start justify-between w-full mt-1 max-sm:gap-2 max-md:py-2">
          <div className="flex flex-row gap-2 w-full">
            <SAvatar
              username={communityInfo.account}
              size="md"
              className="hidden max-md:block border-2 border-background"
            />

            <div className="flex flex-col items-start w-full">
              <div className="flex flex-col items-start mb-0 w-full">
                <div className=" flex flex-row justify-between w-full items-start">
                  <div className=" flex flex-col font-bold text-lg sm:text-2xl">
                    <p>{communityInfo.title}</p>
                    <Link
                      prefetch={false}
                      href={`/@${communityInfo.account}`}
                      className=" font-normal text-sm hover:underline"
                    >
                      @{communityInfo.account}
                    </Link>
                  </div>

                  <div className=" flex flex-row items-center gap-2">
                    <Button
                      title="Create Post"
                      radius="full"
                      size={!isTablet ? "sm" : "md"}
                      className=" bg-foreground/10"
                      variant="flat"
                      startContent={<BiPlus size={24} />}
                      as={Link}
                      prefetch={false}
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
            {(onClose) => (
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
