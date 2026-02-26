"use client";

import { useState, useCallback, useEffect } from "react";
import { sdsApi } from "@/libs/sds";

export interface Feed {
  title: string;
  cashout_time: number;
  [key: string]: any;
}

export const getSeasonFromTitle = (title: string) => {
  const match = title.match(/SEASON-(\d+)/i);
  return match ? parseInt(match[1]) : null;
};

export const useHeightsSeason = () => {
  const [currentSeason, setCurrentSeason] = useState<number>(0);
  const [activeSeasonPost, setActiveSeasonPost] = useState<Feed | null>(null);
  const [seasonalHistory, setSeasonalHistory] = useState<Feed[]>([]);

  const fetchCurrentSeason = useCallback(async () => {
    try {
      const feeds = await sdsApi.getGameSeasons("steem-heights");

      if (feeds && feeds.length > 0) {
        setSeasonalHistory(
          feeds.filter((item: Feed) => item.cashout_time === 0),
        );
        // An active season has a future cashout_time (> 0), while ended seasons have it as 0
        const activeFeed = feeds.find((item: Feed) => item.cashout_time > 0);

        if (activeFeed) {
          setActiveSeasonPost(activeFeed);
          const seasonNum = getSeasonFromTitle(activeFeed.title);
          if (seasonNum) {
            setCurrentSeason(seasonNum);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch current season:", error);
    }
  }, []);

  useEffect(() => {
    fetchCurrentSeason();
  }, [fetchCurrentSeason]);

  return {
    currentSeason,
    activeSeasonPost,
    seasonalHistory,
    isSeasonActive: !!activeSeasonPost,
    fetchCurrentSeason,
  };
};
