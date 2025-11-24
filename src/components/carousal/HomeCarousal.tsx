"use client";

import PromotionCard from "../PromotionCard";
import CarousalMain from "./CarousalMain";

const HomeCarousel = ({ data }: { data: PromotedPost[] }) => {
  return (
    <CarousalMain>
      {data?.map?.((item, index) => (
        <div className="w-full" key={`${index}`}>
          <PromotionCard item={item} />
        </div>
      ))}
    </CarousalMain>
  );
};
export default HomeCarousel;
