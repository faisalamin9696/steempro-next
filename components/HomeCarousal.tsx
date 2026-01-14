"use client";

import "swiper/css";
import "swiper/css/navigation";
import "./style.css";
import { Swiper, SwiperSlide } from "swiper/react";
import BodyImage from "./post/body/BodyImage";
import { proxifyImageUrl } from "@/utils/proxifyUrl";
import SAvatar from "./ui/SAvatar";
import moment from "moment";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import SUsername from "./ui/SUsername";
import PostLink from "./post/PostLink";

function HomeCarousel({
  data,
  showPagination = false,
  size = "md",
}: {
  data: PromotedPost[];
  showPagination?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <div className="w-full grow  max-w-screen xl:max-w-[calc(100vw-305px)]">
      <Swiper
        spaceBetween={20}
        navigation
        cssMode
        onPaginationUpdate={() => {}}
        pagination={{
          clickable: true,
          renderBullet: function (index, className) {
            return '<span class="' + className + '">' + (index + 1) + "</span>";
          },
          bulletClass:
            "bg-background/10 h-6 w-6 bg-foreground/10 rounded-full cursor-pointer",
          el: ".swiper-pagination", // CSS selector for your pagination container
        }}
        lazyPreloadPrevNext={1}
        modules={[Autoplay, Navigation, Pagination]}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          320: { slidesPerView: 1 },
          720: { slidesPerView: 2 },
          1080: { slidesPerView: 3 },
        }}
      >
        {data?.map((item) => (
          <SwiperSlide
            key={item.id}
            className={size === "sm" ? "h-30" : "h-40"}
          >
            <div className="relative flex flex-col group">
              <BodyImage
                height={size === "sm" ? 120 : 160}
                width="100%"
                src={proxifyImageUrl(item.thumbnail, "640x0")}
                imageClass="rounded-2xl object-cover transition-transform duration-500 group-hover:scale-105"
                fetchPriority="high"
              />

              {/* Caption overlay */}
              <div className="flex flex-col text-white p-2 w-full absolute bottom-0 gap-2 bg-black/50 rounded-b-2xl backdrop-blur-sm z-10">
                <PostLink
                  title={item.title}
                  href={`/@${item.author}/${item.permlink}`}
                  className="text-sm truncate"
                />

                <div className="flex flex-row items-center gap-1 text-tiny">
                  <SAvatar size="xs" username={item.author} />
                  <SUsername username={`@${item.author}`} />
                  <span>●</span>
                  <p>{moment(item.created_at).fromNow()}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {showPagination && (
        <div className="mt-2 flex flex-wrap gap-0.5 justify-center swiper-pagination text-center text-xs/6"></div>
      )}
    </div>
  );
}

export default HomeCarousel;
