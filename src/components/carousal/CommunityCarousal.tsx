"use client";

import useSWR from "swr";
import PromotionCard from "../PromotionCard";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import { fetchSds, useAppSelector } from "@/libs/constants/AppFunctions";
import CarousalMain from "./CarousalMain";
import { MdPin } from "react-icons/md";
import { TbPinnedFilled } from "react-icons/tb";
import { AiFillPushpin } from "react-icons/ai";
import { Button } from "@nextui-org/react";
import { twMerge } from "tailwind-merge";

const CommunityCarousel = () => {
  const { community } = usePathnameClient();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  const { data, error } = useSWR<Feed[]>(
    `/communities_api/getCommunityPinnedPosts/${community}/${
      loginInfo.name || "null"
    }/500`,
    fetchSds<Feed[]>
  );

  if (!data || data?.length <= 0 || error) {
    return null;
  }

  return (
    <CarousalMain enableAutoPlay enabllePagination>
      {data?.map?.((item, index) => (
        <div className="w-full" key={`${index}`}>
          <PromotionCard
            authPerm={`${item.author}/${item.permlink}`}
            topChildren={
              !!item.is_pinned && (
                <Button
                  title="Pinned"
                  isIconOnly
                  className={twMerge("min-w-0 h-6 pointer-events-none")}
                  color="danger"
                  size="sm"
                  variant="solid"
                  radius="full"
                >
                  <AiFillPushpin size={18} />
                </Button>
              )
            }
          />
        </div>
      ))}
    </CarousalMain>
  );
};
export default CommunityCarousel;
