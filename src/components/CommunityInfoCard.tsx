"use client";

import React, { memo } from "react";
import { mapSds, useAppSelector } from "@/constants/AppFunctions";
import { twMerge } from "tailwind-merge";
import moment from "moment";
import { abbreviateNumber } from "@/utils/helper";
import MarkdownViewer from "./body/MarkdownViewer";
import { Role as RoleLevel } from "@/utils/community";
import { useDisclosure } from "@heroui/modal";
import { Avatar, AvatarGroup } from "@heroui/avatar";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { getResizedAvatar } from "@/utils/parseImage";
import { SlCalender } from "react-icons/sl";
import { TbHeartDollar } from "react-icons/tb";
import { CommunityActivities } from "./community/CommunityActivities";
import SLink from "./ui/SLink";
import CommunityChatModal from "./chat/community/CommunityChatModal";
import ChatButton from "./ui/ChatButton";
import { useTranslation } from "@/utils/i18n";

type Props = {
  community: Community;
  className?: string;
  onChatPress: () => void;
  onLeadershipPress: () => void;
};

export default memo(function CommunityInfoCard(props: Props) {
  const { community, onChatPress, onLeadershipPress } = props;
  const { t } = useTranslation();

  const communityInfo: Community =
    useAppSelector((state) => state.communityReducer.values)[
      community.account
    ] ?? community;

  const members: Role[] = mapSds(communityInfo?.roles) ?? [];

  const leaderShip = members.filter((item) =>
    RoleLevel.atLeast(item.role, "mod")
  );
  const chatDisclosure = useDisclosure();

  return (
    <div
      className={twMerge(
        `relative flex flex-col border-none rounded-lg
        bg-transparent items-start gap-4 w-full bg-white dark:bg-white/5 p-4 text-default-900/90`,
        props.className
      )}
    >
      <div className=" flex flex-col w-full">
        <div className="flex flex-col items-start gap-2">
          <div className="flex flex-col items-start font-bold text-lg sm:text-2xl mb-0">
            <p className="text-left">{communityInfo.title}</p>
            <SLink
              href={`/@${communityInfo.account}`}
              className=" font-normal text-sm hover:underline"
            >
              @{communityInfo.account}
            </SLink>
          </div>
          <div className="max-1md:hidden">
            <ChatButton skipMemo onPress={onChatPress} />
          </div>
        </div>
        <MarkdownViewer
          className="!text-sm !text-default-900/70 !text-left prose-p:!my-2"
          text={communityInfo.description}
        />
      </div>

      <div className="flex flex-col gap-4 w-full max-w-[65ch]">
        <div className=" flex flex-row gap-1 items-center text-tiny">
          <SlCalender size={16} className=" me-1" />
          <p>{t("community.created")}</p>
          <p>{moment(communityInfo.created * 1000).format("MMM DD, YYYY")}</p>
        </div>

        <div className=" flex flex-row gap-1 items-center text-tiny">
          <TbHeartDollar size={16} className=" me-1" />
          <p>{t("community.pending_reward")}</p>
          <p>{abbreviateNumber(communityInfo.sum_pending)}</p>
        </div>

        <div className="flex justify-between text-left mt-[0.5rem] gap-[0.25rem] mb-[0.5rem] w-full">
          <div
            className="flex flex-col items-start flex-1 hover:underline cursor-pointer"
            onClick={() => {
              onLeadershipPress();
            }}
          >
            <p className=" font-bold text-sm">
              {abbreviateNumber(communityInfo.count_subs)}
            </p>
            <p className="text-default-900/80 text-[12px]">{t("community.members")}</p>
          </div>

          <div className="flex flex-col items-start flex-1">
            <p className=" font-bold text-sm">
              {abbreviateNumber(communityInfo.count_authors)}
            </p>
            <div className="flex flex-row items-center gap-1">
              <span className="inline-flex bg-green-500 rounded-full w-[0.5rem] h-[0.5rem]"></span>
              <span className="text-default-900/80 text-[12px]">{t("community.active")}</span>
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
            <p className="text-default-900/80 text-[12px]">{t("community.rank_by_reward")}</p>
          </div>
        </div>

        <Accordion isCompact className="w-full text-sm !px-0">
          <AccordionItem
            classNames={{ base: "rounded-md", title: "font-bold text-left" }}
            key="activities"
            aria-label="Activities"
            title={t("community.activities")}
          >
            <CommunityActivities community={communityInfo} />
          </AccordionItem>
        </Accordion>

        <div className=" flex flex-col items-start gap-2">
          <p className=" font-bold text-left">{t("community.leadership")}</p>
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
            {leaderShip?.length > 5 && (
              <p
                onClick={onLeadershipPress}
                className=" text-tiny hover:underline cursor-pointer"
              >
                {t("community.show_all")}
              </p>
            )}
          </div>
        </div>
      </div>

      {communityInfo.flag_text && (
        <div className=" flex flex-col items-start gap-2">
          <p className=" font-bold text-left">{t("community.rules")}</p>

          <MarkdownViewer
            className="!max-w-[65ch] !text-sm text-left !text-default-900/70"
            text={`- ${communityInfo.flag_text
              .replace("\n\n", "\n")
              .replaceAll("\n", "\n - ")}`}
          />
        </div>
      )}

      {chatDisclosure.isOpen && (
        <CommunityChatModal
          isOpen={chatDisclosure.isOpen}
          onOpenChange={chatDisclosure.onOpenChange}
          community={communityInfo}
        />
      )}
    </div>
  );
});
