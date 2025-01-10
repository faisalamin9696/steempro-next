import { Button } from "@nextui-org/button";
import clsx from "clsx";
import React, { useRef } from "react";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import Carousel from "@itseasy21/react-elastic-carousel";
import { twMerge } from "tailwind-merge";
import "./style.scss";

const breakPoints = [
  { width: 1, itemsToShow: 1 },
  { width: 550, itemsToShow: 2, itemsToScroll: 2 },
  { width: 850, itemsToShow: 3 },
  { width: 1280, itemsToShow: 4, itemsToScroll: 2 },
];

interface Props {
  children: React.ReactNode;
  enableAutoPlay?: boolean;
  autoPlaySpeed?: number;
  enabllePagination?: boolean;
  className?: string;
}
function CarousalMain(props: Props) {
  const carouselRef = useRef<any>(null);

  return (
    <div className="w-full home-carousel">
      <Carousel
        ref={carouselRef}
        isRTL={false}
        breakPoints={breakPoints}
        showArrows
        enableAutoPlay={props.enableAutoPlay ?? false}
        autoPlaySpeed={5000}
        className={twMerge(
          "w-full mb-2 relative flex flex-row items-center",
          props.className
        )}
        pagination={props.enabllePagination ?? false}
        focusOnSelect={true}
        itemPadding={[4]}
        renderPagination={({ pages, activePage, onClick }) => {
          return (
            <div
              className="flex flex-wrap justify-center mt-2 gap-2"
              style={{ maxWidth: "100%" }}
            >
              {pages.map((page) => (
                <button
                  key={page}
                  onClick={() => onClick(page as any)}
                  className={clsx(
                    "w-2 h-2 rounded-full",
                    page === activePage
                      ? " bg-pink-500/80"
                      : "bg-black/10 dark:bg-white/30 hover:bg-gray-400"
                  )}
                  aria-label={`Go to page ${page + 1}`}
                />
              ))}
            </div>
          );
        }}
        enableMouseSwipe={true}
        renderArrow={({ type, onClick, isEdge }) => {
          return isEdge ? (
            <></>
          ) : (
            <Button
              size="sm"
              isDisabled={isEdge}
              onPress={onClick}
              isIconOnly
              variant="flat"
              radius="full"
              className={clsx(
                "absolute z-10 hover:bg-blue-500",
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
        onChange={(nextItemObject, currentPageIndex) => {
          if (currentPageIndex === carouselRef?.current?.getNumOfPages() - 1) {
            setTimeout(() => {
              carouselRef?.current?.goTo(0);
            }, 5000);
          }
        }}
      >
        {props.children}
      </Carousel>
    </div>
  );
}

export default CarousalMain;
