import {
  fetchSds,
  getFeedScrollItems,
  updateFeedScroll,
  useAppSelector,
} from "@/constants/AppFunctions";
import { notFound } from "next/navigation";
import React, { memo, useMemo, useState, useCallback, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@heroui/button";
import InfiniteScroll from "react-infinite-scroll-component";
import CommentCard from "./comment/CommentCard";
import CommentSkeleton from "./comment/components/CommentSkeleton";
import { getSettings } from "@/utils/user";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { twMerge } from "tailwind-merge";
import EmptyList from "./EmptyList";
import { AsyncUtils } from "@/utils/async.utils";
import { ScrollToTopButton } from "./ScrollToTopButton";

interface Props {
  endPoint: string;
  className?: string;
}

// Scroll to Top Button Component

export default function FeedList_Old(props: Props) {
  const { endPoint, className } = props;
  const { data, error, isLoading } = useSWR<Feed[]>(endPoint, fetchSds);
  const [rows, setRows] = useState<Feed[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const settings =
    useAppSelector((state) => state.settingsReducer.value) ?? getSettings();
  const { isMobile } = useDeviceInfo();
  const isGridStyle = settings.feedStyle === "grid" && !isMobile;

  // Memoize the initial rows to avoid unnecessary updates
  useMemo(() => {
    if (data) {
      setRows(data.slice(0, getFeedScrollItems(endPoint)));
    }
  }, [data]);

  // Memoize the function to load more rows
  const loadMoreRows = useCallback((mainData: Feed[], rowsData: Feed[]) => {
    const newStart = mainData?.slice(rowsData?.length ?? 0);
    return newStart?.slice(0, 16) ?? [];
  }, []);

  // Handle reaching the end of the list
  const handleEndReached = useCallback(async () => {
    if (data && rows.length < data.length) {
      setLoadingMore(true);
      await AsyncUtils.sleep(2.5); // Simulate network delay
      const newRows = loadMoreRows(data, rows);
      updateFeedScroll(endPoint, [...rows, ...newRows].length);
      setRows((prevRows) => [...prevRows, ...newRows]);
      setLoadingMore(false);
    }
  }, [data, rows, loadMoreRows]);

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

  // List loader component
  const ListLoader = memo(() => (
    <div className="flex justify-center items-center">
      <Button
        color="default"
        variant="light"
        className="self-center"
        isIconOnly
        isLoading={loadingMore}
        isDisabled
        onPress={handleEndReached}
      />
    </div>
  ));

  return (
    <>
      <InfiniteScroll
        className="gap-2 !overflow-visible"
        dataLength={rows.length}
        next={handleEndReached}
        hasMore={rows.length < (data?.length ?? 0)}
        loader={<ListLoader />}
        endMessage={<EmptyList />}
      >
        <div
          className={twMerge(
            isGridStyle
              ? className
                ? className
                : "grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4"
              : "flex flex-col gap-2"
          )}
        >
          {rows.map((comment, index) =>
            comment.link_id ? (
              <CommentCard key={comment.link_id} comment={comment} />
            ) : null
          )}
        </div>
      </InfiniteScroll>

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </>
  );
}
