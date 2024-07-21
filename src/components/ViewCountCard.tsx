import React, { memo } from "react";
import { FaEye } from "react-icons/fa";
import useSWR from "swr";
import { abbreviateNumber } from "@/libs/utils/helper";
import clsx from "clsx";
import axios from "axios";

type Props = {
  author?: string;
  permlink?: string;
  authPerm?: string;
  comment?: Post | Feed;
  className?: string;
  compact?: boolean;
  views?: number;
} & (
  | { author: string; permlink: string }
  | { authPerm: string }
  | { comment: Post | Feed }
);

export default function ViewCountCard(props: Props) {
  let authPerm;
  if (!props.authPerm)
    authPerm = `${props.author || props.comment?.author}/${
      props.permlink || props.comment?.permlink
    }`;
  else authPerm = props.authPerm;

  const fetcher = (url) =>
    axios
      .post(
        url,
        {
          authPerm,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => res.data);

  const { data, error } = useSWR(
    props?.views ? undefined : "/api/steem/views",
    fetcher
  );
  if ((!data || data <= 0 || error) && !props?.views) return null;

  return (
    <div
      className={clsx(data && props.className)}
      title={`${data || props.views} Unique views`}
    >
      <div className="flex flex-row gap-2 items-center">
        <FaEye className={props.compact ? "text-md" : "text-lg opacity-90"} />
        <p
          className={
            props.compact ? "text-tiny font-light" : "text-sm font-semibold"
          }
        >
          {abbreviateNumber(data || props.views)}
        </p>
      </div>
    </div>
  );
}
