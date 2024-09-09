"use client";

import React, { memo, useEffect, useState } from "react";
import { Avatar, AvatarGroup } from "@nextui-org/avatar";
import {
  fetchSds,
  useAppDispatch,
  useAppSelector,
} from "@/libs/constants/AppFunctions";
import LoadingCard from "@/components/LoadingCard";
import useSWR from "swr";
import { SlUserFollowing } from "react-icons/sl";
import clsx from "clsx";
import SAvatar from "@/components/SAvatar";
import STooltip from "@/components/STooltip";
import { abbreviateNumber } from "@/libs/utils/helper";
import { getResizedAvatar } from "@/libs/utils/image";
import TimeAgoWrapper from "@/components/wrappers/TimeAgoWrapper";
import { getClubStatus, getVoteData } from "@/libs/steem/sds";
import FollowButton from "./FollowButton";
import { useRouter } from "next13-progressbar";
import { addProfileHandler } from "@/libs/redux/reducers/ProfileReducer";
import Link from "next/link";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/modal";
import FollowersCard from "./FollowersCard";
import { twMerge } from "tailwind-merge";
import { useSession } from "next-auth/react";

const getClubString = (clubData?: Club) => {
  if (!clubData) return "";
  const str =
    clubData.powered_up >= 100
      ? "100"
      : clubData.powered_up >= 75
      ? "75"
      : clubData.powered_up >= 50
      ? "5050"
      : "None";
  return str;
};

type Props = {
  username?: string;
  data?: AccountExt;
  profile?: boolean;
  community?: Community;
  className?: string;
  hideAvatar?: boolean;
} & ({ username: string } | { data: AccountExt } | { community: Community });

export default memo(function ProfileInfoCard(props: Props) {
  const session = useSession();
  const { username, profile, community, data: accountExt, hideAvatar } = props;
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const URL = `/accounts_api/getAccountExt/${username}/${
    loginInfo.name || "null"
  }`;
  let { data, isLoading } = useSWR(
    accountExt ? undefined : URL,
    fetchSds<AccountExt>
  );

  if (accountExt) data = accountExt;

  const profileInfo: AccountExt =
    useAppSelector((state) => state.profileReducer.value)[
      username ?? data?.name ?? ""
    ] ?? data;


  const communityInfo =
    useAppSelector((state) => state.communityReducer.values)[
      community?.account ?? ""
    ] ?? community;

  const { data: clubData } = useSWR(
    username || profileInfo?.name,
    getClubStatus
  );

  const posting_json_metadata = JSON.parse(
    profileInfo?.posting_json_metadata || "{}"
  );

  const URL_2 = `/followers_api/getKnownFollowers/${
    username || profileInfo?.name
  }/${loginInfo.name || "null"}`;
  const { data: knownPeople, isLoading: isKnownLoading } = useSWR(
    !!loginInfo.name ? URL_2 : undefined,
    fetchSds<string[]>
  );
  const steemProps = useAppSelector((state) => state.steemGlobalsReducer).value;
  const voteData = profileInfo && getVoteData(profileInfo, steemProps);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [followerModal, setFollowerModal] = useState<{
    isOpen: boolean;
    isFollowing?: boolean;
  }>({
    isOpen: false,
  });

  useEffect(() => {
    if (data) {
      dispatch(addProfileHandler(data));
    }
  }, []);

  if (isLoading) {
    return <LoadingCard />;
  }

  const detailItems = [
    { title: "Vote Value", desc: `$${voteData?.full_vote?.toFixed(3)}` },
    { title: "VP", desc: `${profileInfo?.upvote_mana_percent}%` },
    { title: "Self Voting", desc: `${profileInfo?.selfvote_rate}%` },
    { title: "CSI", desc: `${profileInfo?.voting_csi}` },
    { title: "RC", desc: `${profileInfo?.rc_mana_percent}%` },
    { title: "Club", desc: getClubString(clubData) },
  ];

  return (
    <div
      className={twMerge(
        `relative flex flex-col card-content border-none rounded-lg
        bg-transparent items-start gap-4 w-full bg-white dark:bg-white/5 p-4`,
        props.className
      )}
    >
      <div className="flex flex-row gap-2 w-full items-start">
        {!hideAvatar && (
          <SAvatar
            className="cursor-pointer"
            size="sm"
            username={username || profileInfo?.name || ""}
          />
        )}

        <div className="flex flex-col items-start w-full">
          <div className=" flex items-start gap-1 justify-between w-full">
            <div className="flex gap-2">
              <div className="flex flex-col items-start justify-center">
                <h4 className="text-sm font-semibold leading-none text-default-600">
                  {community
                    ? communityInfo.title
                    : posting_json_metadata?.profile?.name}
                </h4>
                {/* <Link prefetch={false} href={authorLink}>{comment.author}</Link> */}

                <h5
                  className={clsx("text-small tracking-tight text-default-500")}
                >
                  @{username || profileInfo?.name}
                </h5>
              </div>
            </div>

            {profileInfo && (
              <FollowButton account={profileInfo} community={communityInfo} />
            )}
          </div>

          <div className="flex text-sm gap-1 text-default-600 items-center ">
            <p className="text-default-500 text-tiny">Joined</p>
            <TimeAgoWrapper
              className="text-tiny"
              created={(profileInfo?.created || 0) * 1000}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-2">
        <div className="flex gap-1">
          <p
            title={
              profile
                ? profileInfo?.count_followers?.toString()
                : profileInfo?.count_root_posts?.toString()
            }
            className="font-semibold text-default-600 text-small"
          >
            {abbreviateNumber(
              profile
                ? profileInfo?.count_followers
                : profileInfo?.count_root_posts
            )}
          </p>
          <button
            onClick={() => {
              if (profile) {
                setFollowerModal({ isOpen: true });
              } else {
                router.push(`/@${username}/${"posts"}`);
              }
            }}
            className=" text-default-500 text-small"
          >
            {profile ? "Followers" : "Posts"}
          </button>
        </div>
        <div className="flex gap-1">
          <p
            title={
              profile
                ? profileInfo?.count_following?.toString()
                : profileInfo?.count_comments?.toString()
            }
            className="font-semibold text-default-600 text-small"
          >
            {abbreviateNumber(
              profile
                ? profileInfo?.count_following
                : profileInfo?.count_comments
            )}
          </p>
          <button
            onClick={() => {
              if (profile) {
                setFollowerModal({ isOpen: true, isFollowing: true });
              } else {
                router.push(`/@${username}/${"comments"}`);
              }
            }}
            className="text-default-500 text-small"
          >
            {profile ? "Following" : "Comments"}
          </button>
        </div>
      </div>

      <div className=" w-full">
        <div
          className="flex gap-2 items-center text-gray-800 
          dark:text-gray-300 mb-4 "
        >
          <SlUserFollowing
            className={clsx("h-4 w-4", " text-gray-600 dark:text-gray-400")}
          />
          <span className="text-sm text-default-600">
            <strong className={clsx("text-sm")}>{knownPeople?.length}</strong>{" "}
            Followers you know
          </span>
        </div>
        <div className="flex px-2">
          <AvatarGroup isBordered size="sm">
            {knownPeople?.map((people) => {
              return (
                <div key={people}>
                  <STooltip content={people}>
                    <Link href={`/@${people}/posts`}>
                      <Avatar src={getResizedAvatar(people)} />
                    </Link>
                  </STooltip>
                </div>
              );
            })}
          </AvatarGroup>
        </div>

        <div className="grid grid-cols-2 mt-4 gap-4">
          {detailItems.map((item) => {
            return (
              <div
                className="flex flex-col gap-1 text-sm flex-1"
                key={item.title}
              >
                <p className="text-default-500 text-tiny font-light">
                  {item.title}
                </p>
                <p className="text-bold">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* {voteData &&
                    <div className='text-default-600 flex flex-row  mt-4'>

                        <div className='flex flex-col gap-1 text-sm flex-1'>
                            <p className='text-default-500'>VP</p>
                            <p>{data?.upvote_mana_percent}</p>
                        </div>

                        <div className='flex flex-col gap-1 text-sm  flex-1'>
                            <p className='text-default-500'>Vote Value</p>
                            <p>{voteData.full_vote.toFixed(2)}</p>
                        </div>

                    </div>}

                <div className='text-default-600 flex flex-row mt-4'>
                    {voteData && <div className='flex flex-col gap-1 text-sm flex-1'>
                        <p className='text-default-500'>RC</p>
                        <p>{data?.rc_mana_percent}</p>
                    </div>}

                    <div className='flex flex-col gap-1 text-sm flex-1'>
                        <p className='text-default-500'>CLUB Status</p>
                        <p>{'5050'}</p>
                    </div>

                </div> */}
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
