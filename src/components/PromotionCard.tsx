"use client";

import React from "react";
import { Card } from "@heroui/card";
import Image from "next/image";
import SAvatar from "./ui/SAvatar";
import TimeAgoWrapper from "./wrappers/TimeAgoWrapper";
import { getThumbnail } from "@/utils/parseImage";
import { twMerge } from "tailwind-merge";
import SLink from "./ui/SLink";

interface Props {
  item: PromotedPost;
  topChildren?: React.ReactNode;
  sm?: boolean;
}

export default function PromotionCard(props: Props) {
  const { sm, topChildren, item } = props;
  const thumbnail = getThumbnail(JSON.stringify([item.thumbnail]), "512x512");

  const targetLink = `/@${item?.author}/${item?.permlink}`;
  return (
    <Card
      as={SLink}
      href={targetLink}
      className={twMerge(
        "text-white p-0 rounded-2xl overflow-hidden shadow-lg flex flex-col h-[170px]",
        sm && "h-[120px]"
      )}
    >
      {thumbnail && (
        <Image
          className="bg-blue-800 "
          alt={"image"}
          src={thumbnail}
          height={150}
          width={200}
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
          }}
        />
      )}
      {sm && (
        <div className="rounded-lg hover:bg-transparent transition duration-300 absolute bottom-0 top-0 right-0 left-0 bg-gray-900 opacity-50"></div>
      )}
      <Card
        shadow="none"
        radius="none"
        className="text-white text-start  p-2 w-full
                mb-auto absolute bottom-0 self-end left-0 gap-1 bg-black/50 rounded-b-lg
                backdrop-blur-sm"
      >
        <p className="text-start font-bold  text-sm line-clamp-1">
          {item?.title}
        </p>
        <div className="flex flex-row items-center gap-2 text-tiny">
          <SAvatar size="xs" username={item.author} />
          <p>@{item.author} ● </p>

          <TimeAgoWrapper created={item.created_at} />
        </div>
      </Card>
      {/* {!sm && (
        <div className="shadow-sm shadow-foreground/10   absolute right-0 m-2 rounded-lg backdrop-blur-xl dark:bg-default/30 bg-foreground/20 px-1">
          <ViewCountCard comment={data} compact views={views} />
        </div>
      )} */}
      <div className="absolute right-0 m-1">{topChildren}</div>
    </Card>
  );
}
