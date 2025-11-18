"use client";

import PromotionCard from "../PromotionCard";
import CarousalMain from "./CarousalMain";
import { memo } from "react";
import { usePromotedPosts } from "@/hooks/usePromotedPosts";

const HomeCarousel = memo(() => {
  const { data, error } = usePromotedPosts();

  if (!data || data?.length <= 0 || error) {
    return null;
  }
  return (
    <CarousalMain>
      {data?.map?.((item, index) => (
        <div className="w-full" key={`${index}`}>
          <PromotionCard item={item} />
        </div>
      ))}
    </CarousalMain>
  );
});
export default HomeCarousel;
