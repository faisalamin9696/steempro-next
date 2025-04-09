"use client";

import { fetchSds, useAppSelector } from "@/libs/constants/AppFunctions";
import React, { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { getSettings } from "@/libs/utils/user";
import { useDeviceInfo } from "@/libs/utils/useDeviceInfo";
import CommentCard from "./comment/CommentCard";
import { twMerge } from "tailwind-merge";
import { notFound } from "next/navigation";
import CommentSkeleton from "./comment/components/CommentSkeleton";
import { Spinner } from "@heroui/spinner";
import EmptyList from "./EmptyList";
import { ScrollToTopButton } from "./ScrollToTopButton";

interface Props {
  endPoint: string;
  className?: string;
}

// Scroll to Top Button Component

const itemsPerPage = 16;
export default function FeedList(props: Props) {
  const { endPoint, className } = props;
  const { data, error, isLoading } = useSWR<Feed[]>(endPoint, fetchSds);
  const sessionKey = `loadedCount-${endPoint}`;
  const settings =
    useAppSelector((state) => state.settingsReducer.value) ?? getSettings();
  const [allPosts, setAllPosts] = useState<Feed[]>([]);
  const [visiblePosts, setVisiblePosts] = useState<Feed[]>([]);
  const savedLoadedCount = Number(
    sessionStorage.getItem(sessionKey) ?? itemsPerPage
  );

  const [loadedCount, setLoadedCount] = useState(savedLoadedCount);
  const observerRef = useRef(null);
  const { isMobile } = useDeviceInfo();
  const isGridStyle = settings.feedStyle === "grid" && !isMobile;

  // populating data to state
  useEffect(() => {
    if (data) {
      setAllPosts(data);
      setVisiblePosts(data.slice(0, itemsPerPage)); // Render first 16 posts
    }
  }, [data]);

  // set visible items on screen
  useEffect(() => {
    if (!allPosts.length) return;
    setVisiblePosts(allPosts.slice(0, loadedCount));
  }, [loadedCount, allPosts]);

  // on end reached
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // loadin more with delay simlulation
          setTimeout(() => {
            if (loadedCount < allPosts.length) {
              setLoadedCount((prev) => prev + itemsPerPage);
              sessionStorage.setItem(
                sessionKey,
                (loadedCount + itemsPerPage).toString()
              );
            }
          }, 1500);
        }
      },
      { rootMargin: "40px" }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loadedCount, allPosts]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col space-y-2">
        <CommentSkeleton />
        <CommentSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return notFound();
  }

  return (
    <div>
      <div
        className={twMerge(
          isGridStyle
            ? className
              ? className
              : "grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4"
            : "flex flex-col gap-2"
        )}
      >
        {visiblePosts.map((comment, index) =>
          comment.link_id ? (
            <CommentCard key={comment.link_id} comment={comment} />
          ) : null
        )}
      </div>
      {loadedCount < allPosts.length && (
        <div ref={observerRef} className="flex w-full justify-center p-4">
          <Spinner variant="gradient" size="md" />
        </div>
      )}

      {(data && loadedCount >= allPosts.length) ||
        (allPosts.length <= 0 && <EmptyList />)}

      <ScrollToTopButton />
    </div>
  );
}
