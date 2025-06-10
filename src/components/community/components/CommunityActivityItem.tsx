import { getResizedAvatar } from "@/utils/parseImage";
import { User } from "@heroui/user";
import React from "react";
import { twMerge } from "tailwind-merge";
import TimeAgoWrapper from "../../wrappers/TimeAgoWrapper";
import SAvatar from "@/components/SAvatar";
import SLink from "@/components/SLink";

function CommunityActivityItem({
  communityLog,
}: {
  communityLog: CommunityLog;
}) {
  const targetUrl = `/@${communityLog.account}/posts`;
  const data = JSON.parse(communityLog.data);

  function getDescription() {
    let description;

    switch (communityLog.type) {
      case "flagPost":
      case "pinPost":
      case "unpinPost":
      case "unmutePost":
      case "mutePost":
        description = (
          <div className=" flex flex-col gap-2">
            <SLink
              className=" text-sm text-blue-500"
              href={`/@${data.author}/${data.permlink}`}
            >
              <p className=" line-clamp-2">{`/@${data.author}/${data.permlink}`}</p>
            </SLink>

            {data?.notes && <p className="text-tiny">Reason: {data.notes}</p>}
          </div>
        );

        break;

      case "setRole":
        description = (
          <div className=" flex flex-col gap-2">
            <SLink
              className=" text-sm text-blue-500"
              href={`/@${data.target}`}
            >{`/@${data.target}`}</SLink>

            {data?.role && <p className="text-tiny">{data.role}</p>}
          </div>
        );
        break;

      case "setUserTitle":
        description = (
          <div className=" flex flex-col gap-2">
            <SLink
              className=" text-sm text-blue-500"
              href={`/@${data.target}`}
            >{`/@${data.target}`}</SLink>

            {data?.title && <p className="text-tiny">{data.title}</p>}
          </div>
        );
        break;

      default:
        break;
    }

    return description;
  }

  return (
    <div className=" flex flex-row gap-2 items-center">
      <SAvatar size="sm" username={communityLog.account} />

      <div className=" flex flex-col gap-1">
        <p
          className={twMerge(
            communityLog.type === "subscribe" || communityLog.type === "pinPost"
              ? "text-green-500"
              : communityLog.type === "mutePost" ||
                communityLog.type === "flagPost" ||
                communityLog.type === "unpinPost" ||
                communityLog.type === "unsubscribe"
              ? "text-red-400"
              : "text-blue-400"
          )}
        >
          {communityLog.type}
        </p>

        <div className=" flew flex-col gap-1">
          <p>{getDescription()}</p>

          <TimeAgoWrapper
            className=" text-tiny"
            created={communityLog.created * 1000}
          />
        </div>
      </div>
    </div>
  );

  return (
    <User
      classNames={{
        description: "mt-1 text-default-900/60 dark:text-gray-200 text-sm",
        name: "text-default-800",
      }}
      name={
        <div className="flex flex-row items-start gap-2">
          <div className="flex gap-2 items-center">
            <SLink className=" text-default-900 text-sm" href={targetUrl}>
              {communityLog.account}
            </SLink>

            <p
              className={twMerge(
                communityLog.type === "subscribe" ||
                  communityLog.type === "pinPost"
                  ? "text-green-500"
                  : communityLog.type === "mutePost" ||
                    communityLog.type === "flagPost" ||
                    communityLog.type === "unpinPost" ||
                    communityLog.type === "unsubscribe"
                  ? "text-red-400"
                  : "text-blue-400"
              )}
            >
              {communityLog.type}
            </p>
          </div>
        </div>
      }
      description={
        <div className=" flew flex-col gap-1">
          <p>{getDescription()}</p>

          <TimeAgoWrapper
            className=" text-tiny"
            created={communityLog.created * 1000}
          />
        </div>
      }
      avatarProps={
        {
          className: " cursor-pointer",
          src: getResizedAvatar(communityLog.account),
          as: SLink,
          href: targetUrl,
        } as any
      }
    />
  );
}

export default CommunityActivityItem;
