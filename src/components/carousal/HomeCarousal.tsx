"use client";

import useSWR from "swr";
import axios from "axios";
import PromotionCard from "../PromotionCard";
import CarousalMain from "./CarousalMain";

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
    <CarousalMain enableAutoPlay={false}>
      {data?.map?.((item, index) => (
        <div className="w-full" key={`${index}`}>
          <PromotionCard authPerm={item.authPerm} views={item.views} />
        </div>
      ))}
    </CarousalMain>
  );
};
export default HomeCarousel;
