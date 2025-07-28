import React, { memo } from "react";
import { Card } from "@heroui/card";
import { User } from "@heroui/user";
import { abbreviateNumber } from "@/utils/helper";
import TimeAgoWrapper from "../../wrappers/TimeAgoWrapper";
import { getResizedAvatar } from "@/utils/parseImage";
import { twMerge } from "tailwind-merge";
import SLink from "@/components/ui/SLink";
import { FaRankingStar } from "react-icons/fa6";
import MarkdownViewer from "@/components/body/MarkdownViewer";

interface Props {
  community: Community;
  compact?: boolean;
  className?: string;
  endContent?: React.ReactNode;
}

export const CommunityCard = memo((props: Props) => {
  const { community, compact, endContent } = props;

  return (
    <Card
      shadow="sm"
      radius="md"
      className={twMerge(
        `relative flex flex-col items-start gap-2 w-full bg-white justify-between
             dark:bg-white/5`,
        compact ? "p-2" : "p-4",
        props.className
      )}
    >
      <div className="flex flex-col items-start gap-2">
        <div className="top-2 right-3 absolute">{endContent}</div>
        <User
          classNames={{
            description: "text-default-900/60 dark:text-gray-200 text-sm mt-1",
            name: "text-default-800",
          }}
          name={
            <div className="flex flex-col items-start gap-1">
              <SLink
                className="hover:text-blue-500 font-semibold"
                href={`/trending/${community.account}`}
              >
                {community.title}
              </SLink>

              <div className="flex gap-2 items-center text-xs">
                {<p>{community.account} </p>}
                •
                <TimeAgoWrapper
                  lang={"en"}
                  created={community.created * 1000}
                />
                {/* <Reputation {...props} reputation={community.account_reputation} /> */}
              </div>

              {/* {!compact && <RoleTitleCard comment={{ ...empty_comment('',''), author_role: community.observer_role, author_title: community.observer_title }} />} */}
            </div>
          }
          // description={
          //   <div className="flex flex-col">
          //     {
          //       <RoleTitleCard
          //         comment={{
          //           ...empty_comment("", ""),
          //           author_role: community.observer_role,
          //           author_title: community.observer_title,
          //         }}
          //       />
          //     }
          //   </div>
          // }
          avatarProps={
            {
              className: compact ? "h-8 w-8" : "",
              src: getResizedAvatar(community.account),
              as: SLink,
              href: `/trending/${community.account}`,
            } as any
          }
        />
        {!compact && (
          <MarkdownViewer
            text={community.about}
            className={twMerge(
              "text-default-500 !text-sm prose-p:!my-2",
              compact ? "text-xs line-clamp-2 " : ""
            )}
          />
        )}
      </div>
      <div className={twMerge("flex flex-row gap-4", compact ? "text-sm" : "")}>
        <div className="flex gap-2 items-center " title="Rank">
          <p className=" text-default-500">
            <FaRankingStar size={18} />
          </p>
          <p className="font-semibold text-default-600 ">{community.rank}</p>
        </div>
        <div className="flex gap-1 items-center">
          <p className="font-semibold text-default-600 ">
            {abbreviateNumber(community.count_subs)}
          </p>
          <p className=" text-default-500">
            {compact ? "Subs" : "Subscribers"}
          </p>
        </div>
        <div className="flex gap-1 items-center">
          <p className="font-semibold text-default-600 ">
            ${abbreviateNumber(community.count_pending)}
          </p>
          <p className="text-default-500">
            {compact ? "Reward" : "Pending Reward"}
          </p>
        </div>
      </div>
    </Card>
  );
});

export default CommunityCard;
