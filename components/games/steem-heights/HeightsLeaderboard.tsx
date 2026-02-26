"use client";

import { Card } from "@heroui/card";
import { Trophy, Target, History, Award, ShoppingBag, Zap } from "lucide-react";
import { Tabs, Tab } from "@heroui/tabs";
import { HighScore, GameStats, Skin, PowerUp } from "./Config";
import { GlobalSummitTab } from "./GlobalSummitTab";
import { MyResultsTab } from "./MyResultsTab";
import { DailyChallengesTab } from "./DailyChallengesTab";
import { SeasonalHallTab } from "./SeasonalHallTab";
import { SkinShopTab } from "./SkinShopTab";

interface Props {
  highScores: HighScore[];
  userStats: any;
  userHistory: HighScore[];
  seasonalWinners: any[];
  seasonalHistory: any[];
  currentSeason: number;
  isSeasonActive: boolean;
  seasonPost: any | null;
  globalStats: GameStats;
  username: string;
  selectedSkin: Skin;
  setSelectedSkinId: (id: string) => void;
  // Energy & Daily System
  energy: number;
  dailyProgress: {
    ascent: number;
    combos: number;
    plays: number;
    lastReset: string;
    claimed: string[];
  };
  activePowerUp: PowerUp | null;
  claimChallenge: (id: string) => void;
  purchasePowerUp: (powerUp: PowerUp) => void;
  // Skin Management
  purchasedSkins: string[];
  purchaseSkin: (skin: Skin) => void;
  equipSkin: (id: string) => void;
  gameState: "idle" | "playing" | "gameover";
  syncingChallengeId: string | null;
  syncingPowerUpId: string | null;
  syncingSkinId: string | null;
  fetchHeightsUserData: (season?: number) => Promise<any>;
  fetchUserHistory: (season?: number) => Promise<HighScore[]>;
}

export const HeightsLeaderboard = ({
  highScores,
  userStats,
  userHistory,
  seasonalWinners,
  seasonalHistory,
  currentSeason,
  isSeasonActive,
  seasonPost,
  username,
  selectedSkin,
  setSelectedSkinId,
  energy,
  dailyProgress,
  activePowerUp,
  claimChallenge,
  purchasePowerUp,
  purchasedSkins,
  purchaseSkin,
  equipSkin,
  gameState,
  syncingChallengeId,
  syncingPowerUpId,
  syncingSkinId,
  globalStats,
  fetchHeightsUserData,
  fetchUserHistory,
}: Props) => {
  return (
    <Card className="w-full  mx-auto bg-zinc-50 dark:bg-zinc-900/50 border-zinc-800  overflow-hidden relative min-h-[400px]">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Target size={120} className="text-zinc-500" />
      </div>

      <div className="relative z-10 space-y-6 p-4">
        <Tabs
          aria-label="Leaderboard Tabs"
          variant="underlined"
          classNames={{
            base: "w-full",
            tabList: "gap-6 w-full relative rounded-none p-0",
            cursor: "w-full bg-amber-500",
            tab: "max-w-fit px-0 h-12",
            panel: "p-0",
            tabContent:
              "group-data-[selected=true]:text-amber-500 font-black uppercase text-[10px] tracking-widest",
          }}
        >
          <Tab
            key="global"
            title={
              <div className="flex items-center gap-2">
                <Trophy size={14} />
                <span>Global Summit</span>
              </div>
            }
          >
            <GlobalSummitTab
              currentSeason={currentSeason}
              isSeasonActive={isSeasonActive}
              highScores={highScores}
              seasonPost={seasonPost}
              globalStats={globalStats}
              username={username}
            />
          </Tab>

          <Tab
            key="daily"
            title={
              <div className="flex items-center gap-2">
                <Zap size={14} />
                <span>Daily Challenges</span>
              </div>
            }
          >
            <DailyChallengesTab
              energy={energy}
              dailyProgress={dailyProgress}
              claimChallenge={claimChallenge}
              syncingChallengeId={syncingChallengeId}
              isSeasonActive={isSeasonActive}
              currentSeason={currentSeason}
            />
          </Tab>

          <Tab
            key="history"
            title={
              <div className="flex items-center gap-2">
                <History size={14} />
                <span>My Results</span>
              </div>
            }
          >
            <MyResultsTab
              userStats={userStats}
              userHistory={userHistory}
              username={username}
              highScores={highScores}
              seasonPost={seasonPost}
              currentSeason={currentSeason}
              seasonalHistory={seasonalHistory}
              energy={energy}
              dailyProgress={dailyProgress}
              claimChallenge={claimChallenge}
              syncingChallengeId={syncingChallengeId}
              fetchHeightsUserData={fetchHeightsUserData}
              fetchUserHistory={fetchUserHistory}
            />
          </Tab>

          <Tab
            key="winners"
            title={
              <div className="flex items-center gap-2">
                <Award size={14} />
                <span>Seasonal Hall</span>
              </div>
            }
          >
            <SeasonalHallTab
              seasonalWinners={seasonalWinners}
              seasonalPosts={seasonalHistory}
            />
          </Tab>

          <Tab
            key="lab"
            title={
              <div className="flex items-center gap-2">
                <ShoppingBag size={14} />
                <span>Customization Lab</span>
              </div>
            }
          >
            <SkinShopTab
              selectedSkin={selectedSkin}
              onSelectSkin={equipSkin}
              username={username}
              energy={energy}
              activePowerUp={activePowerUp}
              onPurchasePowerUp={purchasePowerUp}
              purchasedSkins={purchasedSkins}
              onPurchaseSkin={purchaseSkin}
              gameState={gameState}
              syncingPowerUpId={syncingPowerUpId}
              syncingSkinId={syncingSkinId}
            />
          </Tab>
        </Tabs>
      </div>
    </Card>
  );
};
