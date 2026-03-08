"use client";

import { useEffect, useRef } from "react";
import { HeightsCanvas } from "@/components/games/steem-heights/HeightsCanvas";
import { HeightsInfo } from "@/components/games/steem-heights/HeightsInfo";
import { HeightsLeaderboard } from "@/components/games/steem-heights/HeightsLeaderboard";
import { useHeights } from "@/hooks/games/useHeights";
import { Button } from "@heroui/button";
import { ChevronDown } from "lucide-react";
import disableDevtool from "disable-devtool";
import { usePathname } from "next/navigation";

const SteemHeightsPage = () => {
  const heights = useHeights();
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    disableDevtool({
      detectors: [5, 6, 7],
      url: "not_found",
      clearIntervalWhenDevOpenTrigger: true,
      disableMenu: false,
      clearLog: true,
      ignore: () => {
        return pathname !== "/games/steem-heights"; // Disable is ignored when you are an administrator
      },
    });
  }, [pathname]);

  const scrollToLeaderboard = () => {
    leaderboardRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen pb-20">
      <div className="max-w-6xl ">
        <div className="px-2 mx-auto sm:px-6 lg:px-8">
          {/* Top Section: Info & Game */}
          <div className="relative flex flex-col justify-center min-h-[calc(100vh-64px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
              {/* Game Canvas - Order 1 on mobile, 2 on desktop */}
              <div className="flex flex-col items-center order-1 lg:order-2 h-svh sm:h-screen">
                <div className="w-full max-w-[450px] relative">
                  <div className="absolute -inset-8 bg-amber-500/5 blur-[100px] rounded-full opacity-50 pointer-events-none" />
                  <HeightsCanvas
                    {...heights}
                    scrollToLeaderboard={scrollToLeaderboard}
                    highScores={heights.highScores}
                    username={heights.username}
                    isGeneratingSession={heights.isGeneratingSession}
                  />
                </div>
              </div>

              {/* Game Info - Order 2 on mobile, 1 on desktop */}
              <div className="flex flex-col items-center lg:items-start order-2 lg:order-1 space-y-8">
                <HeightsInfo
                  season={heights.currentSeason}
                  seasonPost={heights.seasonPost}
                />
                <Button
                  variant="bordered"
                  size="sm"
                  onPress={scrollToLeaderboard}
                  startContent={<ChevronDown size={16} />}
                  className="hidden lg:flex rounded-full border-zinc-800 text-zinc-500 hover:text-amber-500 hover:border-amber-500/50 font-bold uppercase text-[10px] tracking-widest transition-all"
                >
                  View Leaderboard
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Leaderboard */}
        <div ref={leaderboardRef} className="pt-20 scroll-mt-10">
          <HeightsLeaderboard
            highScores={heights.highScores}
            userStats={heights.userStats}
            userHistory={heights.userHistory}
            fetchUserHistory={heights.fetchUserHistory}
            seasonalWinners={heights.seasonalWinners}
            currentSeason={heights.currentSeason}
            isSeasonActive={heights.isSeasonActive}
            seasonPost={heights.seasonPost}
            globalStats={heights.globalStats}
            username={heights.username}
            seasonalHistory={heights.seasonalHistory}
            selectedSkin={heights.selectedSkin}
            setSelectedSkinId={heights.setSelectedSkinId}
            energy={heights.energy}
            dailyProgress={heights.dailyProgress}
            activePowerUp={heights.activePowerUp}
            claimChallenge={heights.claimChallenge}
            purchasePowerUp={heights.purchasePowerUp}
            purchasedSkins={heights.purchasedSkins}
            purchaseSkin={heights.purchaseSkin}
            equipSkin={heights.equipSkin}
            gameState={heights.gameState}
            fetchHeightsUserData={heights.fetchHeightsUserData}
            syncingChallengeId={heights.syncingChallengeId}
            syncingPowerUpId={heights.syncingPowerUpId}
            syncingSkinId={heights.syncingSkinId}
          />
        </div>
      </div>
    </main>
  );
};

export default SteemHeightsPage;
