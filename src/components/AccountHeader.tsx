"use client";
import React, { Suspense, useEffect, useRef, useState } from "react";
import {
  mapSds,
  useAppDispatch,
  useAppSelector,
  validateSds,
} from "@/libs/constants/AppFunctions";
import UserCoverCard from "@/components/UserCoverCard";
import { abbreviateNumber } from "@/libs/utils/helper";
import Reputation from "@/components/Reputation";
import ProfileInfoCard from "@/components/ProfileInfoCard";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import { Button } from "@nextui-org/button";
import { BsInfoCircleFill } from "react-icons/bs";
import VanillaTilt from "vanilla-tilt";
import { useDeviceInfo } from "@/libs/utils/useDeviceInfo";
import SAvatar from "@/components/SAvatar";
import { FaDollarSign } from "react-icons/fa";
import { proxifyImageUrl } from "@/libs/utils/ProxifyUrl";
import { addProfileHandler } from "@/libs/redux/reducers/ProfileReducer";
import { addCommunityHandler } from "@/libs/redux/reducers/CommunityReducer";
import { twMerge } from "tailwind-merge";
import { FaRegHeart } from "react-icons/fa";
import { IoFlashOutline } from "react-icons/io5";
import { FaRankingStar } from "react-icons/fa6";
import { PiUserListBold } from "react-icons/pi";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/modal";
import FollowersCard from "./FollowersCard";
import { usePathname } from "next/navigation";
import { useRouter } from "next13-progressbar";
import CommunityMembers from "./community/CommunityMembers";
import MarkdownViewer from "./body/MarkdownViewer";

type Props =
  | {
      community?: Community;
      account: AccountExt;
    }
  | {
      community: Community;
      account?: AccountExt;
    };
export default function AccountHeader(props: Props) {
  const { community, account } = props;
  const cardRef = useRef<HTMLElement | undefined | any>();
  const { isDesktop } = useDeviceInfo();
  const isCommunity = !!community;
  const dispatch = useAppDispatch();
  const router = useRouter();
  const communityInfo: Community =
    useAppSelector((state) => state.communityReducer.values)[
      community?.account ?? ""
    ] ?? community;
  const profileInfo: AccountExt =
    useAppSelector((state) => state.profileReducer.value)[
      account?.name ?? ""
    ] ?? account;

  const [followerModal, setFollowerModal] = useState<{
    isOpen: boolean;
    isFollowing?: boolean;
  }>({
    isOpen: false,
  });

  const [membersModal, setMembersModal] = useState<{
    isOpen: boolean;
    isFollowing?: boolean;
  }>({
    isOpen: false,
  });

  const posting_json_metadata = JSON.parse(
    profileInfo?.posting_json_metadata || "{}"
  );
  const cover_picture = isCommunity
    ? "/steempro-cover.png"
    : proxifyImageUrl(
        posting_json_metadata?.profile?.cover_image ?? "",
        "2048x512"
      );

  useEffect(() => {
    if (isCommunity) {
      dispatch(addCommunityHandler({ ...community }));
    } else {
      dispatch(addProfileHandler(account));
    }

    if (isDesktop && cardRef && cardRef.current)
      VanillaTilt.init(cardRef.current);
  }, []);

  const pathname = usePathname();

  useEffect(() => {
    router.refresh();
  }, [pathname]);

  return (
    <div className="w-full p-1 relative">
      <div className="flex justify-center items-center w-full  shadow-none">
        <UserCoverCard large={isCommunity} src={cover_picture} />

        <div
          ref={cardRef}
          data-tilt-speed="600"
          data-tilt
          data-tilt-max="5"
          data-tilt-perspective="600"
          data-tilt-glare
          data-tilt-max-glare={0.5}
          className={`account-header self-center backdrop-blur-sm shadow-md m-auto absolute mx-2  
            bg-black/20  rounded-xl  max-w-1md `}
        >
          <div
            className={twMerge(
              " flex shadow-md px-0 text-white dark:text-white/90 ",
              isCommunity
                ? "max-1md:flex max-1md:flex-col"
                : "max-[720px]:flex max-[720px]:flex-col"
            )}
          >
            <div className="flex ">
              <div className="stat">
                <div className="stat-figure text-2xl max-md:text-xl">
                  {isCommunity ? <FaRankingStar /> : <FaRegHeart />}
                </div>
                <div className="stat-title text-white/60">
                  {isCommunity ? "Rank" : "Followers"}
                </div>
                <button
                  onClick={() => {
                    if (!isCommunity) setFollowerModal({ isOpen: true });
                  }}
                  className={twMerge(
                    "stat-value",
                    "text-3xl max-md:text-lg max-1md:text-start",
                    isCommunity && "pointer-events-none"
                  )}
                  title={
                    isCommunity
                      ? communityInfo.rank?.toString()
                      : profileInfo.count_followers?.toString()
                  }
                >
                  {abbreviateNumber(
                    isCommunity
                      ? communityInfo.rank
                      : profileInfo.count_followers
                  )}
                </button>
                <div className="stat-desc"></div>
              </div>

              <div className="stat">
                <div className="stat-figure text-secondary text-2xl">
                  {isCommunity ? <PiUserListBold /> : <IoFlashOutline />}
                </div>
                <div className="stat-title text-white/60">
                  {isCommunity ? "Members" : "Followings"}
                </div>
                <button
                  onClick={() => {
                    if (isCommunity)
                      setMembersModal({ isOpen: true, isFollowing: true });
                    else setFollowerModal({ isOpen: true, isFollowing: true });
                  }}
                  className={twMerge(
                    "stat-value text-secondary text-3xl max-md:text-lg max-1md:text-start"
                  )}
                  title={
                    isCommunity
                      ? communityInfo.count_subs?.toString()
                      : profileInfo.count_following?.toString()
                  }
                >
                  {abbreviateNumber(
                    isCommunity
                      ? communityInfo.count_subs
                      : profileInfo.count_following
                  )}
                </button>
                <div className="stat-desc"></div>
              </div>

              {isCommunity && (
                <div className="stat">
                  <div className="stat-figure text-info text-xl">
                    <FaDollarSign />
                  </div>
                  <div className="stat-title text-white/60">{"Reward"}</div>
                  <div
                    className="stat-value text-info text-3xl max-md:text-lg max-1md:text-start"
                    title={communityInfo.sum_pending?.toString()}
                  >
                    {abbreviateNumber(communityInfo.sum_pending)}
                  </div>
                  <div className="stat-desc"></div>
                </div>
              )}
            </div>

            <div className="profile-card stat">
              <div className="stat-figure text-secondary relative">
                <SAvatar
                  username={
                    isCommunity ? communityInfo.account : profileInfo.name
                  }
                  size="lg"
                  quality="medium"
                />
              </div>
              <div
                title={
                  isCommunity
                    ? communityInfo.title
                    : posting_json_metadata?.profile?.name
                }
                className="stat-value text-white dark:text-white/90 text-xl max-sm:text-xl max-w-fit overflow-clip text-wrap flex-nowrap line-clamp-1"
              >
                {isCommunity
                  ? communityInfo.title
                  : posting_json_metadata?.profile?.name}
              </div>
              <div className="stat-title flex space-x-2 items-center">
                <div className="stat-title flex flex-row items-center text-white/90 gap-2">
                  <p>
                    @{isCommunity ? communityInfo.account : profileInfo.name}
                  </p>
                  <Reputation
                    reputation={
                      isCommunity
                        ? communityInfo.account_reputation
                        : profileInfo.reputation
                    }
                  />
                </div>

                <div className="">
                  <Popover
                    placement={"bottom"}
                    color="default"
                    style={{ zIndex: 50 }}
                  >
                    <PopoverTrigger>
                      <Button
                        isIconOnly
                        radius="full"
                        size="sm"
                        variant="light"
                        className="hidden max-1md:block text-white/80"
                      >
                        <BsInfoCircleFill className="text-xl" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <ProfileInfoCard
                        hideAvatar
                        key={`info-profile-card-${
                          communityInfo?.account || profileInfo.name
                        }`}
                        className="!bg-transparent"
                        community={communityInfo}
                        username={
                          isCommunity ? communityInfo.account : profileInfo.name
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div
                title={
                  isCommunity
                    ? communityInfo.about
                    : posting_json_metadata?.profile?.about
                }
              >
                <MarkdownViewer
                  className="!stat-desc !text-default-900 !overflow-clip !text-white/80 !text-wrap !flex-nowrap"
                  text={
                    isCommunity
                      ? communityInfo.about
                      : posting_json_metadata?.profile?.about
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {followerModal.isOpen && (
        <Modal
          isOpen={followerModal.isOpen}
          onOpenChange={(isOpen) => setFollowerModal({ isOpen: isOpen })}
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
                    username={
                      isCommunity ? communityInfo.account : profileInfo.name
                    }
                  />
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      )}

      {membersModal.isOpen && (
        <Modal
          isOpen={membersModal.isOpen}
          onOpenChange={(isOpen) => setMembersModal({ isOpen: isOpen })}
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
