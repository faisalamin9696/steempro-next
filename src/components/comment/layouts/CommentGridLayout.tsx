"use client";

import React from "react";
import BodyShort from "../../body/BodyShort";
import Image from "next/image";
import { getResizedAvatar, getThumbnail } from "@/utils/parseImage";
import TimeAgoWrapper from "../../wrappers/TimeAgoWrapper";
import { Card, CardBody } from "@heroui/card";
import { User } from "@heroui/user";
import Reputation from "@/components/Reputation";
import CommentFooter from "../components/CommentFooter";
import STag from "@/components/ui/STag";
import "./style.scss";
import { CommentProps } from "../CommentCard";
import { abbreviateNumber, validateCommunity } from "@/utils/helper";
import { useAppSelector } from "@/constants/AppFunctions";
import { hasNsfwTag } from "@/utils/stateFunctions";
import NsfwOverlay from "@/components/NsfwOverlay";
import { getSettings } from "@/utils/user";
import RoleTitleCard from "@/components/RoleTitleCard";
import { twMerge } from "tailwind-merge";
import { MdDisabledVisible } from "react-icons/md";
import { useSession } from "next-auth/react";
import SLink from "@/components/ui/SLink";
import SAvatar from "@/components/ui/SAvatar";
import { FaRegComment } from "react-icons/fa";

export default function CommentGridLayout(props: CommentProps) {
  const { comment, isCommunity } = props;
  const commentInfo: Feed | Post =
    useAppSelector((state) => state.commentReducer.values)[
      `${comment.author}/${comment.permlink}`
    ] ?? comment;
  const settings =
    useAppSelector((state) => state.settingsReducer.value) ?? getSettings();
  const { data: session } = useSession();
  const thumbnail = getThumbnail(comment.json_images);
  const isSelf = session?.user?.name === commentInfo.author;
  // const json_metadata = JSON.parse(comment?.json_metadata ?? '{}') as { tags?: string[], image?: string[], app?: string, format?: string }
  const targetUrl = `/${comment.category}/@${comment.author}/${comment.permlink}`;

  const imageWidth = 200;
  const imageHeight = 176;
  const isNsfw = hasNsfwTag(comment) && settings.nsfw !== "Always show";

  return (
    <Card
      className={`grid-footer w-full h-full bg-white/60
         dark:bg-white/10 pb-2 flex flex-col rounded-2xl shadow-lg overflow-visible`}
    >
      <CardBody className="flex flex-col p-0" as={SLink} href={targetUrl}>
        <>
          <div
            className={twMerge(
              !!commentInfo.is_muted && " opacity-80",
              "flex-shrink-0 relative ",
              commentInfo.is_muted ? " blur-[2px]" : ""
            )}
          >
            {thumbnail ? (
              isNsfw ? (
                <div
                  className={`h-44 bg-foreground/20 dark:bg-foreground/5  w-full justify-center items-center flex flex-col`}
                >
                  <MdDisabledVisible className={twMerge("text-xl")} />
                </div>
              ) : (
                <picture
                  style={{
                    width: "100%",
                    height: imageHeight,
                    minHeight: imageHeight,
                    maxHeight: imageHeight,
                  }}
                  className="flex flex-col overflow-hidden items-center justify-center relative"
                >
                  <Image
                    src={thumbnail}
                    width={imageWidth}
                    height={imageHeight}
                    className={twMerge(
                      isNsfw ? "blur-[2px]" : "",
                      "overflow-hidden",
                      "rounded-t-lg"
                    )}
                    alt={""}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />

                  {isNsfw && <NsfwOverlay />}
                </picture>
              )
            ) : (
              <div
                className={`h-44 bg-foreground/20 dark:bg-foreground/5  w-full rounded-t-lg`}
              />
            )}

            {!isCommunity && (
              <STag
                className={`absolute m-2 top-0 right-0 font-semibold `}
                content={
                  commentInfo.community ||
                  (validateCommunity(commentInfo.category)
                    ? commentInfo.category
                    : `#${commentInfo.category}`)
                }
                tag={commentInfo.category}
              />
            )}
          </div>

          <div className="flex flex-1 flex-col justify-between p-4">
            <div
              className={twMerge(
                !!commentInfo.is_muted && " opacity-80",
                "flex-1"
              )}
            >
              <Card
                radius="none"
                shadow="none"
                className={twMerge("bg-transparent  w-full text-start")}
              >
                <p
                  className={twMerge(
                    "text-md font-semibold text-default-900",
                    commentInfo.is_muted ? " blur-[2px]" : ""
                  )}
                >
                  {commentInfo.title}
                </p>
                <div
                  className={twMerge(
                    "mt-3 text-sm text-default-900/60",
                    commentInfo.is_muted ? " blur-[2px]" : ""
                  )}
                >
                  <BodyShort
                    body={commentInfo.body}
                    className=" line-clamp-2"
                  />
                </div>
              </Card>
            </div>
          </div>
        </>
      </CardBody>

      <div className="flex flex-col gap-2 px-4">
        <div className="mt-2 flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-1">
            <SAvatar size="sm" username={comment.author} />

            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center space-x-2">
                <SLink href={`/@${commentInfo.author}`}>{comment.author}</SLink>

                <Reputation
                  {...props}
                  reputation={commentInfo.author_reputation}
                />
              </div>

              <div className="flex flex-wrap gap-x-2 items-center">
                <RoleTitleCard comment={comment} />

                <TimeAgoWrapper
                  lang={"en"}
                  created={commentInfo.created * 1000}
                  lastUpdate={commentInfo.last_update * 1000}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-row items-center justify-end">
          {/* <div>
            {!!commentInfo.resteem_count && (
              <span
                title={commentInfo.resteem_count + " Resteems"}
                className="py-1 text-xs font-regular text-default-600 mr-1 flex flex-row items-center"
              >
                {abbreviateNumber(commentInfo.resteem_count)} Resteems
              </span>
            )}
          </div> */}

          {!!commentInfo.children && (
            <SLink
              href={`/${commentInfo.category}/@${commentInfo.author}/${commentInfo.permlink}#comments`}
              title={`${commentInfo.children} Comments`}
              className="flex flex-row items-center gap-2"
            >
              <FaRegComment />
              <p className="text-sm">{commentInfo.children}</p>
            </SLink>
          )}
        </div>
      </div>
      <CommentFooter
        compact
        className="w-full px-2 py-2"
        comment={commentInfo}
      />
    </Card>
  );
}
