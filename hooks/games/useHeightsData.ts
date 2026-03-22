"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import * as heightsDb from "@/libs/supabase/steem-heights";
import {
  HighScore,
  GameStats,
  DAILY_CHALLENGES,
  POWER_UPS,
  PowerUp,
} from "@/components/games/steem-heights/Config";
import { useSession } from "next-auth/react";
import { sdsApi } from "@/libs/sds";
import { condenserApi } from "@/libs/consenser";
import { useAppSelector } from "../redux/store";

interface useHeightsDataProps {
  currentSeason: number;
  setEnergy: (energy: number) => void;
  setPurchasedSkins: (skins: string[]) => void;
  setActivePowerUp: (powerUp: PowerUp | null) => void;
  setSelectedSkinId: (skinId: string) => void;
  setDailyProgress: (progress: any) => void;
}

export const useHeightsData = ({
  currentSeason,
  setEnergy,
  setPurchasedSkins,
  setActivePowerUp,
  setSelectedSkinId,
  setDailyProgress,
}: useHeightsDataProps) => {
  const { data: session } = useSession();
  const [highScores, setHighScores] = useState<HighScore[]>([]);
  const [seasonalWinners, setSeasonalWinners] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [userHistory, setUserHistory] = useState<HighScore[]>([]);
  const [globalStats, setGlobalStats] = useState<GameStats>({
    totalParticipants: 0,
    activePlayers24h: 0,
    totalPlays: 0,
    totalAltitude: 0,
  });
  const [eligibilityMap, setEligibilityMap] = useState<{
    [key: string]: { sp: number; rep: number; eligible: boolean };
  }>({});
  const globalData = useAppSelector((s) => s.globalPropsReducer.value);

  const personalBest = useMemo(() => {
    return userStats?.highest_score || 0;
  }, [userStats]);

  const topScore = useMemo(() => {
    if (highScores.length === 0) return 0;
    return highScores[0].score;
  }, [highScores]);

  const fetchHighScores = useCallback(async (season: number) => {
    if (!season) return;
    const topScores = await heightsDb.getHeightsHighScores(season);
    setHighScores(topScores);

    if (topScores.length > 0) {
      try {
        const players = topScores.slice(0, 100).map((s) => s.player);
        const [accounts] = await Promise.all([
          sdsApi.getAccountsExt(players, null, [
            "name",
            "reputation",
            "vests_own",
          ]),
        ]);

        const resultMap: {
          [key: string]: { sp: number; rep: number; eligible: boolean };
        } = {};
        accounts.forEach((acc) => {
          const sp = condenserApi.vestsToSteem(
            acc.vests_own,  
            globalData.total_vesting_shares,
            globalData.total_vesting_fund_steem,
          );
          const rep = acc.reputation;
          resultMap[acc.name] = {
            sp,
            rep,
            eligible: rep > 40 && sp >= 50,
          };
        });
        setEligibilityMap(resultMap);
      } catch (error) {
        console.error("Failed to fetch eligibility data:", error);
      }
    }
  }, [globalData]);

  const fetchSeasonalWinners = useCallback(async () => {
    const winners = await heightsDb.getHeightsSeasonalWinners(
      session?.user?.name || undefined,
    );
    setSeasonalWinners(winners);
  }, [session?.user?.name]);

  const fetchGameStats = useCallback(async () => {
    if (!currentSeason) return;
    const stats = await heightsDb.getHeightsGameStats(currentSeason);
    setGlobalStats(stats);
  }, [currentSeason]);

  const fetchShopData = useCallback(
    async (season?: number) => {
      const s = season ?? currentSeason;
      if (!session?.user?.name || !s) return null;
      try {
        const shopStats = await heightsDb.getHeightsShopStats(
          session.user.name,
          s,
        );
        if (shopStats) {
          if (!season || season === currentSeason) {
            setUserStats((prev: any) => ({ ...prev, ...shopStats }));
            setEnergy(shopStats.latest_energy || 0);

            const powerupName = shopStats.powerup?.name || "";
            if (powerupName) {
              const powerUp = POWER_UPS.find((p) => p.name === powerupName);
              setActivePowerUp(powerUp || null);
            } else {
              setActivePowerUp(null);
            }

            setPurchasedSkins(shopStats.skins || []);
            setSelectedSkinId(shopStats.equiped || "default");

            const claimedIds = DAILY_CHALLENGES.filter((c) =>
              (shopStats.current_day_actions || []).includes(
                `Claimed challenge: ${c.title}`,
              ),
            ).map((c) => c.id);

            setDailyProgress((prev: any) => ({
              ...prev,
              claimed: claimedIds,
            }));
          }
          return shopStats;
        }
        return null;
      } catch (error) {
        console.error("Failed to fetch shop data:", error);
        return null;
      }
    },
    [
      session?.user?.name,
      currentSeason,
      setEnergy,
      setPurchasedSkins,
      setActivePowerUp,
      setSelectedSkinId,
      setDailyProgress,
    ],
  );

  const fetchDailyData = useCallback(
    async (season?: number) => {
      const s = season ?? currentSeason;
      if (!session?.user?.name || !s) return null;
      try {
        const dailyStats = await heightsDb.getHeightsDailyStats(
          session.user.name,
          s,
        );
        if (dailyStats) {
          if (!season || season === currentSeason) {
            setUserStats((prev: any) => ({ ...prev, ...dailyStats }));
            setDailyProgress((prev: any) => ({
              ...prev,
              plays: dailyStats.daily_plays || 0,
              combos: dailyStats.daily_combos || 0,
              ascent: dailyStats.daily_climb || 0,
            }));
          }
          return dailyStats;
        }
        return null;
      } catch (error) {
        console.error("Failed to fetch daily stats:", error);
        return null;
      }
    },
    [session?.user?.name, currentSeason, setDailyProgress],
  );

  const fetchPlayerStats = useCallback(
    async (season?: number) => {
      const s = season ?? currentSeason;
      if (!session?.user?.name || !s) return null;
      try {
        const playerStats = await heightsDb.getHeightsPlayerStats(
          session.user.name,
          s,
        );
        if (playerStats) {
          if (!season || season === currentSeason) {
            setUserStats((prev: any) => ({ ...prev, ...playerStats }));
          }
          return playerStats;
        }
        return null;
      } catch (error) {
        console.error("Failed to fetch player stats:", error);
        return null;
      }
    },
    [session?.user?.name, currentSeason],
  );

  const fetchHeightsUserData = useCallback(
    async (season?: number) => {
      const [shop, daily, player] = await Promise.all([
        fetchShopData(season),
        fetchDailyData(season),
        fetchPlayerStats(season),
      ]);
      return { ...shop, ...daily, ...player };
    },
    [fetchShopData, fetchDailyData, fetchPlayerStats],
  );

  const fetchUserHistory = useCallback(
    async (season?: number) => {
      const s = season ?? currentSeason;
      if (!session?.user?.name || !s) return [];
      const history = await heightsDb.getHeightsUserHistory(
        session.user.name,
        s,
      );
      if (!season || season === currentSeason) {
        setUserHistory(history);
      }
      return history;
    },
    [session?.user?.name, currentSeason],
  );

  useEffect(() => {
    if (currentSeason) {
      fetchHighScores(currentSeason);
      fetchGameStats();
      fetchHeightsUserData();
      fetchUserHistory();
    }
    fetchSeasonalWinners();
  }, [
    currentSeason,
    fetchHighScores,
    fetchGameStats,
    fetchHeightsUserData,
    fetchUserHistory,
    fetchSeasonalWinners,
  ]);

  return {
    highScores,
    seasonalWinners,
    userStats,
    userHistory,
    globalStats,
    personalBest,
    topScore,
    fetchHighScores,
    fetchGameStats,
    fetchHeightsUserData,
    fetchShopData,
    fetchDailyData,
    fetchPlayerStats,
    fetchUserHistory,
    fetchSeasonalWinners,
    eligibilityMap,
  };
};
