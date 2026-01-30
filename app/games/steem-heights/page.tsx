"use client";

import { HeightsCanvas } from "@/components/game/steem-heights/HeightsCanvas";
import { HeightsInfo } from "@/components/game/steem-heights/HeightsInfo";
import { HeightsLeaderboard } from "@/components/game/steem-heights/HeightsLeaderboard";
import { useHeights } from "@/components/game/steem-heights/useHeights";

const SteemHeightsPage = () => {
  const heights = useHeights();

  return (
    <div className="lg:pt-20">
      <div className="md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Side: Game Info */}
          <div className="lg:col-span-12 xl:col-span-5 space-y-8 order-2 lg:order-1">
            <HeightsInfo
              season={heights.currentSeason}
              seasonPost={heights.seasonPost}
            />
            <HeightsLeaderboard
              highScores={heights.highScores}
              userHistory={heights.userHistory}
              seasonalWinners={heights.seasonalWinners}
            />
          </div>

          {/* Center: The Game Canvas */}
          <div className="lg:col-span-12 xl:col-span-7 order-1 lg:order-2 flex justify-center mt-16 xl:mt-0">
            <HeightsCanvas {...heights} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SteemHeightsPage;
