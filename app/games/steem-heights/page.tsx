"use client";

import { useEffect, useRef, useState } from "react";
import { HeightsCanvas } from "@/components/games/steem-heights/HeightsCanvas";
import { HeightsInfo } from "@/components/games/steem-heights/HeightsInfo";
import { HeightsLeaderboard } from "@/components/games/steem-heights/HeightsLeaderboard";
import { useHeights } from "@/hooks/games/useHeights";
import { Button } from "@heroui/button";
import { ChevronDown, GripHorizontal } from "lucide-react";
import disableDevtool from "disable-devtool";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, useDragControls } from "framer-motion";

const SteemHeightsPage = () => {
  const heights = useHeights();
  const leaderboardRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const t = useTranslations("Games.steemHeights");
  const [isFloating, setIsFloating] = useState<boolean>(false);
  const dragControls = useDragControls();

  const getDockClasses = () => {
    if (isFloating) {
      return "fixed bottom-2 right-2 sm:bottom-6 sm:right-6 lg:right-10 z-[40] w-max max-w-[100vw] shadow-2xl sm:scale-100 scale-95 origin-bottom-right bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-3xl pt-2 px-3 pb-6";
    }
    return "w-max max-w-[100vw] relative transition-transform duration-700";
  };

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
              <div className="flex flex-col items-center order-1 lg:order-2 h-svh sm:h-screen w-full">
                {/* Placeholder to prevent layout shift when docked */}
                {isFloating && (
                  <div className="hidden lg:block w-full max-w-112.5 h-[650px]" />
                )}
                
                <motion.div
                  className={getDockClasses()}
                  drag={isFloating}
                  dragControls={dragControls}
                  dragListener={false}
                  dragMomentum={false}
                  animate={!isFloating ? { x: 0, y: 0 } : undefined}
                  style={{ touchAction: isFloating ? "none" : "auto" }}
                >
                  {isFloating && (
                    <div
                      className="w-full flex justify-center pb-3 pt-1 cursor-grab active:cursor-grabbing hover:opacity-100 opacity-60 transition-opacity"
                      onPointerDown={(e) => dragControls.start(e)}
                    >
                      <div className="w-12 h-1.5 bg-zinc-600 rounded-full" />
                    </div>
                  )}

                  <div className="absolute -inset-8 bg-amber-500/5 blur-[100px] rounded-full opacity-50 pointer-events-none" />
                  <HeightsCanvas
                    {...heights}
                    isFloating={isFloating}
                    setIsFloating={setIsFloating}
                    scrollToLeaderboard={scrollToLeaderboard}
                    highScores={heights.highScores}
                    username={heights.username}
                    isGeneratingSession={heights.isGeneratingSession}
                    lastCheer={heights.lastCheer}
                    onlineCount={heights.onlineCount}
                  />
                </motion.div>
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
                  {t("info.viewLeaderboard")}
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
            eligibilityMap={heights.eligibilityMap}
          />
        </div>
      </div>
    </main>
  );
};

export default SteemHeightsPage;
