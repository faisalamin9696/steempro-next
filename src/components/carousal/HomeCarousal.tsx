"use client";

import { Button } from "@nextui-org/button";
import clsx from "clsx";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import useSWR from "swr";
import "./style.scss";
import Carousel from "@itseasy21/react-elastic-carousel";
import axios from "axios";
import PromotionCard from "../PromotionCard";

const breakPoints = [
  { width: 1, itemsToShow: 1 },
  { width: 550, itemsToShow: 2, itemsToScroll: 2 },
  { width: 850, itemsToShow: 3 },
  { width: 1280, itemsToShow: 4, itemsToScroll: 2 },
];

const fetcher = (url) =>
  axios
    .post(url, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((res) => res.data);

const HomeCarousel = () => {
  const { data, error } = useSWR<
    { id: number; authPerm: string; views: number }[]
  >("/api/steem/promoted", fetcher);

  if (!data || data?.length <= 0 || error) {
    return null;
  }

  return (
    <div className="w-full home-carousel">
      <Carousel
        isRTL={false}
        breakPoints={breakPoints}
        showArrows
        // enableAutoPlay
        // autoPlaySpeed={5000}
        className="w-full mb-2 relative flex flex-row items-center"
        pagination={false}
        focusOnSelect={true}
        itemPadding={[4]}
        enableMouseSwipe={true}
        renderArrow={({ type, onClick, isEdge }) => {
          return (
            <Button
              size="sm"
              isDisabled={isEdge}
              onClick={onClick}
              isIconOnly
              radius="full"
              variant="shadow"
              className={clsx(
                "absolute z-10",
                type === "PREV" ? "left-4" : "right-4"
              )}
            >
              {type === "NEXT" ? (
                <IoIosArrowForward className="text-xl" />
              ) : (
                <IoIosArrowBack className="text-xl" />
              )}
            </Button>
          );
        }}
      >
        {data?.map?.((item, index) => (
          <div className="w-full" key={`${index}`}>
            <PromotionCard authPerm={item.authPerm} views={item.views} />
          </div>
        ))}
      </Carousel>
    </div>
  );
};
export default HomeCarousel;
