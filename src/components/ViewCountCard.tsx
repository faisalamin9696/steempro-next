import React from "react";
import { FaEye } from "react-icons/fa";
import useSWR from "swr";
import { abbreviateNumber } from "@/utils/helper";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/libs/supabase/supabase";

type Props = {
  author?: string;
  permlink?: string;
  className?: string;
  compact?: boolean;
  views?: number;
};

const fetchViewCount = async (
  author: string,
  permlink: string
): Promise<number> => {
  console.log("Fetching views for:", author, permlink);

  const { data, error } = await supabase.rpc("get_views", {
    author,
    permlink,
  });
  if (error) {
    return 0;
  }
  return data ?? 0;
};

export default function ViewCountCard(props: Props) {
  const { data } = useSWR(
    props?.author && props.permlink
      ? `views-${props.author}-${props.permlink}`
      : null,
    () => fetchViewCount(props.author!, props.permlink!),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const viewCount = data !== undefined ? data : props.views;

  if (viewCount === undefined || viewCount === null || viewCount <= 0) {
    return null;
  }

  return (
    <div
      className={twMerge(props.className)}
      title={`${viewCount} Unique views`}
    >
      <div className="flex flex-row gap-2 items-center">
        <FaEye className={props.compact ? "text-md" : "text-lg opacity-90"} />
        <p
          className={
            props.compact ? "text-tiny font-light" : "text-sm font-semibold"
          }
        >
          {abbreviateNumber(viewCount)}
        </p>
      </div>
    </div>
  );
}
