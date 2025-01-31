"use client";

import useSWR from "swr";
import PromotionCard from "../PromotionCard";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import { fetchSds, useAppSelector } from "@/libs/constants/AppFunctions";
import CarousalMain from "./CarousalMain";
import { AiFillPushpin } from "react-icons/ai";
import { Button } from "@heroui/button";
import { twMerge } from "tailwind-merge";
import { useDeviceInfo } from "@/libs/utils/useDeviceInfo";

interface Props {
  className?: string;
}
const CommunityCarousel = (props: Props) => {
  const { className } = props;
  const { community } = usePathnameClient();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const { isMobile } = useDeviceInfo();

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
    !isMobile && (
      <CarousalMain enableAutoPlay enabllePagination className={className}>
        {data?.map?.((item, index) => (
          <div className="w-full" key={`${index}`}>
            <PromotionCard
              sm
              authPerm={`${item.author}/${item.permlink}`}
              topChildren={
                !!item.is_pinned && (
                  <Button
                    title="Pinned"
                    isIconOnly
                    className={twMerge("min-w-0 h-4 pointer-events-none")}
                    color="primary"
                    size="sm"
                    variant="light"
                    radius="full"
                  >
                    <AiFillPushpin size={16} color="white" />
                  </Button>
                )
              }
            />
          </div>
        ))}
      </CarousalMain>
    )
  );
};
export default CommunityCarousel;
