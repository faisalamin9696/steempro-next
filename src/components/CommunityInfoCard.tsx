"use client";

import React, { memo, useState } from "react";
import { mapSds, useAppSelector } from "@/libs/constants/AppFunctions";
import { twMerge } from "tailwind-merge";
import moment from "moment";
import { abbreviateNumber } from "@/libs/utils/helper";
import MarkdownViewer from "./body/MarkdownViewer";
import { Role as RoleLevel } from "@/libs/utils/community";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { Avatar, AvatarGroup } from "@heroui/avatar";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { getResizedAvatar } from "@/libs/utils/image";
import { SlCalender } from "react-icons/sl";
import { TbHeartDollar } from "react-icons/tb";
import CommunityMembers from "./community/CommunityMembers";
import { CommunityActivities } from "./community/CommunityActivities";
import SLink from "./SLink";

type Props = {
  community: Community;
  className?: string;
};

export default memo(function CommunityInfoCard(props: Props) {
  const { community } = props;

  const communityInfo: Community =
    useAppSelector((state) => state.communityReducer.values)[
      community.account
    ] ?? community;

  const members: Role[] = mapSds(communityInfo?.roles) ?? [];

  const leaderShip = members.filter((item) =>
    RoleLevel.atLeast(item.role, "mod")
  );
  const [membersModal, setMembersModal] = useState(false);

  return (
    <div
      className={twMerge(
        `relative flex flex-col border-none rounded-lg
        bg-transparent items-start gap-4 w-full bg-white dark:bg-white/5 p-4 text-default-900/90`,
        props.className
      )}
    >
      <div className=" flex flex-col">
        <div className="flex flex-col items-start font-bold text-lg sm:text-2xl mb-0">
          <p className="text-left">{communityInfo.title}</p>
          <SLink
            href={`/@${communityInfo.account}`}
            className=" font-normal text-sm hover:underline"
          >
            @{communityInfo.account}
          </SLink>
        </div>
        <MarkdownViewer
          className="!text-sm !text-default-900/70 !text-left prose-p:!my-2"
          text={communityInfo.description}
        />
      </div>

      <div className="flex flex-col gap-4 w-full  max-w-[65ch]">
        <div className=" flex flex-row gap-1 items-center text-tiny">
          <SlCalender size={16} className=" me-1" />
          <p>Created</p>
          <p>{moment(communityInfo.created * 1000).format("MMM DD, YYYY")}</p>
        </div>

        <div className=" flex flex-row gap-1 items-center text-tiny">
          <TbHeartDollar size={16} className=" me-1" />
          <p>Pending Reward</p>
          <p>{abbreviateNumber(communityInfo.sum_pending)}</p>
        </div>

        <div className="flex justify-between text-left mt-[0.5rem] gap-[0.25rem] mb-[0.5rem] w-full">
          <div
            className="flex flex-col items-start flex-1 hover:underline cursor-pointer"
            onClick={() => {
              setMembersModal(!membersModal);
            }}
          >
            <p className=" font-bold text-sm">
              {abbreviateNumber(communityInfo.count_subs)}
            </p>
            <p className="text-default-900/80 text-[12px]">Members</p>
          </div>

          <div className="flex flex-col items-start flex-1">
            <p className=" font-bold text-sm">
              {abbreviateNumber(communityInfo.count_authors)}
            </p>
            <div className="flex flex-row items-center gap-1">
              <span className="inline-flex bg-green-500 rounded-full w-[0.5rem] h-[0.5rem]"></span>
              <span className="text-default-900/80 text-[12px]">Active</span>
            </div>
          </div>

          {/* <div className="flex flex-col items-start flex-1">
          <p className=" font-bold">
            {abbreviateNumber(communityInfo.sum_pending)}
          </p>
          <p className="text-default-900/80 text-[12px]">Reward</p>
        </div> */}

          <div className="flex flex-col items-start flex-1">
            <p className=" font-bold text-sm">{communityInfo.rank}</p>
            <p className="text-default-900/80 text-[12px]">Rank by reward</p>
          </div>
        </div>

        <Accordion isCompact className="w-full text-sm !px-0">
          <AccordionItem
            classNames={{ base: "rounded-md", title: "font-bold text-left" }}
            key="activities"
            aria-label="Activities"
            title="Activities"
          >
            <CommunityActivities community={communityInfo} />
          </AccordionItem>
        </Accordion>

        <div className=" flex flex-col items-start gap-2">
          <p className=" font-bold text-left">Leadership</p>
          <div className=" flex flex-row items-center gap-4 px-3">
            <AvatarGroup isBordered size="md" max={5}>
              {leaderShip?.map((leader) => (
                <SLink href={`/@${leader.account}`}>
                  <Avatar
                    key={leader.account}
                    src={getResizedAvatar(leader.account)}
                  />
                </SLink>
              ))}
            </AvatarGroup>
            <p
              onClick={() => {
                setMembersModal(!membersModal);
              }}
              className=" text-tiny hover:underline cursor-pointer"
            >
              Show all
            </p>
          </div>
        </div>
      </div>

      {communityInfo.flag_text && (
        <div className=" flex flex-col items-start gap-2">
          <p className=" font-bold text-left">Rules</p>

          <MarkdownViewer
            className="!max-w-[65ch] !text-sm text-left !text-default-900/70"
            text={`- ${communityInfo.flag_text
              .replace("\n\n", "\n")
              .replaceAll("\n", "\n - ")}`}
          />
        </div>
      )}

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
});
