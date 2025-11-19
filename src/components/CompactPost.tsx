"use client";

import CommentCover from "@/components/comment/components/CommentCover";
import { Card } from "@heroui/card";
import React, { memo } from "react";
import BodyShort from "@/components/body/BodyShort";
import { useAppSelector } from "@/constants/AppFunctions";
import TimeAgoWrapper from "./wrappers/TimeAgoWrapper";
import { MdAccessTime } from "react-icons/md";
import { getThumbnail } from "@/utils/parseImage";
import { hasNsfwTag } from "@/utils/stateFunctions";
import { getSettings } from "@/utils/user";
import SLink from "./ui/SLink";

interface Props {
  comment: Feed;
  onPress?: () => void;
}

export default memo(function CompactPost(props: Props) {
  const { comment, onPress } = props;
  const commentInfo =
    useAppSelector((state) => state.commentReducer.values)[
      `${comment.author}/${comment.permlink}`
    ] ?? comment;

  const settings =
    useAppSelector((state) => state.settingsReducer.value) ?? getSettings();
  // const URL = `/posts_api/getPost/${authPerm}`
  // const { data, isLoading, error, isValidating } = useSWR(URL, fetchSds<Post>)
  const thumbnail = getThumbnail(commentInfo.json_images, "640x0");
  const isNsfw = hasNsfwTag(commentInfo) && settings?.nsfw !== "Always show";

  return (
    <Card
      as={SLink}
      onPress={onPress}
      radius="none"
      href={`/${commentInfo.category}/@${commentInfo.author}/${commentInfo.permlink}`}
      className="overflow-hidden rounded-lg shadow-sm flex flex-col bg-white dark:bg-white/5 p-2"
      shadow="none"
      // className=" text-start p-0 bg-transparent px-0 py-2 mb-auto"
    >
      {/* <div className=" rounded-2xl overflow-hidden shadow-lg flex flex-col bg-white dark:bg-white/5 p-2"> */}
      {isNsfw ? null : (
        <div className="relative">
          <CommentCover
            className="max-h-40"
            thumbnail
            src={thumbnail}
            isNsfw={isNsfw}
          />
          {/* <div className="rounded-lg hover:bg-transparent transition duration-300 absolute bottom-0 top-0 right-0 left-0 bg-gray-900 opacity-25"></div> */}
        </div>
      )}
      <div className=" text-start p-0 py-2 mb-auto">
        <p className="font-medium text-md mb-2 text-default-600 line-clamp-2">
          {commentInfo?.title}
        </p>
        <div className="text-default-900/50 text-tiny line-clamp-2">
          <BodyShort body={commentInfo?.body} />
        </div>
      </div>
      <div className="px-0 py-0 flex flex-row items-center justify-between">
        <span className="py-1 text-xs font-regular  mr-1 flex flex-row items-center">
          {
            <div className="flex items-center gap-2 ml-1 text-default-900/80">
              <MdAccessTime className="text-medium" />
              <TimeAgoWrapper created={comment.created * 1000} />
            </div>
          }
        </span>

        <div className=" flex items-center gap-2">
          <span className="py-1 text-xs font-regular gap-1 text-default-900/80 mr-1 flex flex-row items-center">
            <svg
              className="h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              ></path>
            </svg>
            {commentInfo?.children && (
              <div className="flex text-default-900/80 gap-1">
                {commentInfo?.children}
              </div>
            )}
          </span>
        </div>
      </div>
    </Card>
  );
});
