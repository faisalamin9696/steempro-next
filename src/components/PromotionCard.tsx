"use client";

import { fetchSds, useAppSelector } from "@/libs/constants/AppFunctions";
import React from "react";
import useSWR from "swr";
import { Card } from "@nextui-org/card";
import ViewCountCard from "./ViewCountCard";
import Image from "next/image";
import SAvatar from "./SAvatar";
import TimeAgoWrapper from "./wrappers/TimeAgoWrapper";
import Link from "next/link";
import { extractImageLink } from "@/libs/utils/extractContent";
import { proxifyImageUrl } from "@/libs/utils/ProxifyUrl";

interface Props {
  authPerm: string;
  views?: number;
}

export default function PromotionCard(props: Props) {
  const { authPerm, views } = props;
  const [author, permlink] = authPerm.split("/");
  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  const URL = `/posts_api/getPost/${authPerm}/${false}/${
    loginInfo.name || "null"
  }`;
  const { data } = useSWR(URL, fetchSds<Post>);

  if (!data) return null;

  // const URL = `/posts_api/getPost/${authPerm}`
  // const { data, isLoading, error, isValidating } = useSWR(URL, fetchSds<Post>)

  const thumbnail = proxifyImageUrl(extractImageLink(data.json_metadata, data.body),'256x512');

  const targetLink = `/${data?.category}/@${data?.author}/${data?.permlink}`;
  return (
    <Card
      as={Link}
      href={targetLink}
      className="card card-compact text-white p-0 rounded-xl overflow-hidden shadow-lg flex flex-col h-[170px]"
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
      {/* <div
                className="rounded-lg hover:bg-transparent transition duration-300 absolute bottom-0 top-0 right-0 left-0 bg-gray-900 opacity-25">
            </div> */}
      <Card
        shadow="none"
        radius="none"
        className="text-white text-start  p-2 w-full
                mb-auto absolute bottom-0 self-end left-0 gap-1 bg-black/50 rounded-t-lg
                backdrop-blur-sm"
      >
        <p className="text-start font-bold  text-sm line-clamp-1">
          {data?.title}
        </p>
        <div className="flex flex-row items-center gap-2 text-tiny">
          <SAvatar size="xs" username={author} />
          <p>@{author} ● </p>

          <TimeAgoWrapper created={data.created * 1000} />
        </div>
      </Card>

      <div className="shadow-sm shadow-foreground/10   absolute right-0 m-2 rounded-lg backdrop-blur-xl dark:bg-default/30 bg-foreground/20 px-1">
        <ViewCountCard comment={data} compact views={views} />
      </div>
    </Card>
  );
}
