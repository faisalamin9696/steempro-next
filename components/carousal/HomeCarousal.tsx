"use client";

import "swiper/css";
import "swiper/css/navigation";
import "./style.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { proxifyImageUrl } from "@/utils/proxifyUrl";
import moment from "moment";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import BodyImage from "../post/body/BodyImage";
import PostLink from "../post/PostLink";
import SAvatar from "../ui/SAvatar";
import SUsername from "../ui/SUsername";
import { Clock3 } from "lucide-react";

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
        {data?.map((item, index) => (
          <SwiperSlide
            key={item.id}
            className={size === "sm" ? "h-30" : "h-40"}
          >
            <div className="group/slide block">
              <article className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-zinc-950">
                <div className="absolute inset-0 z-10 bg-linear-to-t from-black via-black/30 to-transparent" />
                <div className="absolute inset-0 z-10 bg-linear-to-r from-black/40 via-transparent to-transparent" />

                <BodyImage
                  height={size === "sm" ? 120 : 160}
                  width="100%"
                  src={proxifyImageUrl(item.thumbnail, "640x0")}
                  imageClass="h-full w-full object-cover transition-transform duration-700 group-hover/slide:scale-[1.04]"
                  priority={index < 2}
                />

                <div className="flex flex-col absolute inset-x-0 bottom-0 z-20 px-2 gap-2">
                  <PostLink
                    title={item.title}
                    href={`/@${item.author}/${item.permlink}`}
                    className="block text-sm font-semibold leading-tight text-white line-clamp-1"
                  />

                  <div className="mb-3 flex items-center gap-3 text-[11px] font-semibold text-white/70">
                    <div className="flex items-center gap-2">
                      <SAvatar size="xs" username={item.author} />
                      <SUsername
                        username={`@${item.author}`}
                        className="text-[11px] font-semibold text-white/85 hover:text-white"
                      />
                    </div>
                    <span className="h-1 w-1 rounded-full bg-white/40" />
                    <div className="flex items-center gap-1.5">
                      <Clock3 size={12} />
                      <span>{moment(item.created_at).fromNow()}</span>
                    </div>
                  </div>
                </div>
              </article>
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
