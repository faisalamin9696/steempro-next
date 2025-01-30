"use client";

import React, { memo, useState } from "react";
import { fetchSds, useAppSelector } from "@/libs/constants/AppFunctions";
import { twMerge } from "tailwind-merge";
import moment from "moment";
import { abbreviateNumber } from "@/libs/utils/helper";
import MarkdownViewer from "./body/MarkdownViewer";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { Avatar, AvatarGroup } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { getResizedAvatar } from "@/libs/utils/image";
import Link from "next/link";
import useSWR from "swr";
import FollowersCard from "./FollowersCard";
import { proxifyImageUrl } from "@/libs/utils/ProxifyUrl";
import FollowButton from "./FollowButton";
import { IoMdShareAlt } from "react-icons/io";
import { FaRegHeart } from "react-icons/fa";
import { IoFlashOutline } from "react-icons/io5";
import { getVoteData } from "@/libs/steem/sds";
import { AppLink } from "@/libs/constants/AppConstants";

type Props = {
  account: AccountExt;
  className?: string;
  compact?: boolean;
};

export default memo(function ProfileInfoCard(props: Props) {
  const { account, compact } = props;

  const profileInfo: AccountExt =
    useAppSelector((state) => state.profileReducer.value)[account.name] ??
    account;
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const steemProps = useAppSelector((state) => state.steemGlobalsReducer).value;
  const voteData = profileInfo && getVoteData(profileInfo, steemProps);

  const [followerModal, setFollowerModal] = useState<{
    isOpen: boolean;
    isFollowing?: boolean;
  }>({
    isOpen: false,
  });
  const isSelf = !!loginInfo.name && loginInfo.name === profileInfo.name;

  const posting_json_metadata = JSON.parse(
    profileInfo?.posting_json_metadata || "{}"
  );

  const URL_2 = `/followers_api/getKnownFollowers/${profileInfo?.name}/${
    loginInfo.name || "null"
  }`;

  const { data: knownPeople, isLoading } = useSWR(
    !!loginInfo.name ? URL_2 : undefined,
    fetchSds<string[]>
  );

  const cover_picture = proxifyImageUrl(
    posting_json_metadata?.profile?.cover_image ?? "",
    "1280x128",
    true
  );

  return (
    <div
      className={twMerge(
        `relative flex flex-col card-content border-none rounded-lg
        bg-transparent items-start w-full bg-white dark:bg-white/5  text-default-900/90 pb-4`,
        props.className
      )}
    >
      {!compact && cover_picture && (
        <div className="relative overflow-hidden w-full rounded-t-md h-[97px]">
          <div
            style={{ backgroundImage: `url(${cover_picture})` }}
            className="h-full w-full bg-no-repeat bg-cover bg-center"
          ></div>
        </div>
      )}
      <div className=" flex flex-col px-4 py-2 gap-4 w-full">
        <div className=" flex flex-col gap-2">
          <div className=" flex flex-row justify-between">
            {!compact && (
              <div className="flex flex-col items-start font-bold text-lg sm:text-2xl mb-0">
                <p className="text-left">
                  {posting_json_metadata?.profile?.name ?? profileInfo.name}
                </p>
                <Link
                  prefetch={false}
                  href={`/@${profileInfo.name}`}
                  className=" font-normal text-sm hover:underline"
                >
                  @{profileInfo.name}
                </Link>
              </div>
            )}

            {/* <Button
              radius="full"
              size="sm"
              isIconOnly
              variant="flat"
              className=" bg-foreground/10"
            >
              <HiOutlineDotsHorizontal size={18} />
            </Button> */}
          </div>

          {!compact && (
            <div className="flex flex-row items-center gap-2">
              <FollowButton account={profileInfo} />

              {isSelf ? (
                <Button
                  radius="full"
                  size="md"
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
                <></>
                // <Button
                //   title="Create Post"
                //   radius="full"
                //   size="md"
                //   className=" bg-foreground/10"
                //   variant="flat"
                //   href="/"
                //   prefetch={false}
                //   startContent={<BsChatDots size={18} />}
                //   as={Link}
                // >
                //   Chat
                // </Button>
              )}
            </div>
          )}
          <MarkdownViewer
            className="!text-sm !text-default-900/70 !text-left prose-p:!my-2"
            text={posting_json_metadata?.profile?.about}
          />
        </div>

        <div className=" flex flex-col max-w-[300px] w-full gap-2">
          <div className="flex justify-between items-start">
            <div className=" flex flex-row gap-1 items-center text-tiny">
              <FaRegHeart size={16} className=" me-1" />
              <div
                className=" flex flex-row gap-1 hover:underline cursor-pointer"
                onClick={() => {
                  setFollowerModal({ isOpen: true, isFollowing: false });
                }}
              >
                <p>Followers</p>
                <p>{abbreviateNumber(profileInfo.count_followers)}</p>
              </div>
            </div>

            <div className=" flex flex-row gap-1 items-center text-tiny">
              <IoFlashOutline size={16} className=" me-1" />
              <div
                className=" flex flex-row gap-1 hover:underline cursor-pointer"
                onClick={() => {
                  setFollowerModal({ isOpen: true, isFollowing: true });
                }}
              >
                <p>Following</p>
                <p>{abbreviateNumber(profileInfo.count_following)}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between text-left mt-[0.5rem] gap-[0.25rem] mb-[0.5rem]">
            <div className="flex flex-col items-start flex-1">
              <p className=" font-bold text-sm">
                {abbreviateNumber(profileInfo.count_root_posts)}
              </p>
              <p className="text-default-900/80 text-[12px]">Posts</p>
            </div>

            <div className="flex flex-col items-start flex-1">
              <p className=" font-bold text-sm">
                {abbreviateNumber(profileInfo.count_comments)}
              </p>
              <div className="flex flex-row items-center gap-1">
                <span className="text-default-900/80 text-[12px]">
                  Comments
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start flex-1">
              <p className=" font-bold text-sm">
                {moment(profileInfo.created * 1000).format("MMM DD, YYYY")}
              </p>
              <p className="text-default-900/80 text-[12px]">Joined</p>
            </div>
          </div>

          <div className="flex justify-between text-left mt-[0.5rem] gap-[0.25rem] mb-[0.5rem]">
            <div className="flex flex-col items-start flex-1">
              <p className=" font-bold text-sm">
                {profileInfo.upvote_mana_percent}%
              </p>
              <p className="text-default-900/80 text-[12px]">VP</p>
            </div>

            <div className="flex flex-col items-start flex-1">
              <p className=" font-bold text-sm">
                {profileInfo.rc_mana_percent}%
              </p>
              <div className="flex flex-row items-center gap-1">
                <span className="text-default-900/80 text-[12px]">RC</span>
              </div>
            </div>

            <div className="flex flex-col items-start flex-1">
              <p className=" font-bold text-sm">
                {voteData.full_vote?.toFixed(3)}$
              </p>
              <p className="text-default-900/80 text-[12px]">Value</p>
            </div>
          </div>
        </div>

        <div className=" flex flex-col items-start gap-2">
          <p className=" font-bold text-left">Followers you know</p>
          <div className=" flex flex-row items-center gap-4 px-3">
            <AvatarGroup isBordered size="md" max={5}>
              {knownPeople?.map((people) => (
                <Link prefetch={false} className="!ms-1" href={`/@${people}`}>
                  <Avatar key={people} src={getResizedAvatar(people)} />
                </Link>
              ))}
            </AvatarGroup>
            {/* <p
              onClick={() => seFollowerModal(!followerModal)}
              className=" text-tiny hover:underline cursor-pointer"
            >
              Show all
            </p> */}
          </div>
        </div>
      </div>
      {/* {profileInfo.flag_text && (
        <div className=" flex flex-col items-start gap-2">
          <p className=" font-bold text-left">Rules</p>

          <MarkdownViewer
            className="!max-w-none !text-sm text-left !text-default-900/70"
            text={`- ${profileInfo.flag_text
              .replace("\n\n", "\n")
              .replaceAll("\n", "\n - ")}`}
          />
        </div>
      )} */}
      {followerModal.isOpen && (
        <Modal
          isOpen={followerModal.isOpen}
          onOpenChange={(isOpen) => {
            setFollowerModal({ isOpen: isOpen });
          }}
          placement="top-center"
          scrollBehavior="inside"
          closeButton
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {followerModal.isFollowing ? "Following" : "Followers"}
                </ModalHeader>
                <ModalBody>
                  <FollowersCard
                    isFollowing={followerModal.isFollowing}
                    username={profileInfo.name}
                  />
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </div>
  );
});
