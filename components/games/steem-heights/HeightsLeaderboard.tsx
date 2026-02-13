"use client";

import { Card } from "@heroui/card";
import { Trophy, Target, History, Award } from "lucide-react";
import { Tabs, Tab } from "@heroui/tabs";
import { HighScore, GameStats } from "./Config";
import { GlobalSummitTab } from "./GlobalSummitTab";
import { MyResultsTab } from "./MyResultsTab";
import { SeasonalHallTab } from "./SeasonalHallTab";

interface Props {
  highScores: HighScore[];
  userHistory: HighScore[];
  seasonalWinners: any[];
  seasonalHistory: any[];
  currentSeason: number;
  isSeasonActive: boolean;
  seasonPost: any | null;
  globalStats: GameStats;
  username: string;
}

export const HeightsLeaderboard = ({
  highScores,
  userHistory,
  seasonalWinners,
  seasonalHistory,
  currentSeason,
  isSeasonActive,
  seasonPost,
  globalStats,
  username,
}: Props) => {
  return (
    <Card className="w-full max-w-4xl mx-auto bg-zinc-50 dark:bg-zinc-900/50 border-zinc-800  overflow-hidden relative min-h-[400px]">
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
              userHistory={userHistory}
              username={username}
              highScores={highScores}
              seasonPost={seasonPost}
              currentSeason={currentSeason}
              seasonalHistory={seasonalHistory}
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
        </Tabs>
      </div>
    </Card>
  );
};
