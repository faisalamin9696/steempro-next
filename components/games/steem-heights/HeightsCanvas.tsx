"use client";

import { forwardRef, memo, useCallback, useMemo, useState } from "react";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  ArrowUp,
  Volume2,
  VolumeX,
  Gamepad2,
  Star,
  Zap,
  Heart,
  Shield,
  Pause,
  Play,
  Mountain,
  PictureInPicture,
  Minimize2,
} from "lucide-react";
import { useDisclosure } from "@heroui/modal";
import { HeightsGuideModal } from "./HeightsGuideModal";
import { useTranslations } from "next-intl";
import {
  Block,
  Debris,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  BLOCK_HEIGHT,
  TIME_LIMIT,
  Skin,
  HighScore,
  PowerUp,
} from "./Config";
import { LiveCheer, CheerEvent } from "./elements/LiveCheer";

import { GameHUD } from "./elements/GameHUD";
import { GhostMarkers } from "./elements/GhostMarkers";
import { GameMenus } from "./elements/GameMenus";
import { Overlays } from "./elements/Overlays";
import { BlockStack } from "./elements/BlockStack";
import { LandmarksBar } from "./elements/LandmarksBar";
import { GameChat } from "./elements/GameChat";

interface Props {
  gameState: "idle" | "playing" | "gameover";
  score: number;
  blocks: Block[];
  debris: Debris[];
  currentBlock: Block | null;
  speed: number;
  timeLeft: number;
  isSavingScore: boolean;
  isLoggedIn: boolean;
  isMuted: boolean;
  isPaused: boolean;
  isSeasonActive: boolean;
  showPerfect: boolean;
  lastImpactTime: number;
  lastImpactPos: { x: number; y: number } | null;
  activePowerUp: PowerUp | null;
  handleAction: () => void;
  setIsMuted: (muted: boolean) => void;
  setIsPaused: (paused: boolean) => void;
  startGame: () => void;
  setGameState: (state: "idle") => void;
  scrollToLeaderboard?: () => void;
  perfectStreak: number;
  combos: number;
  totalBonusScore: number;
  showBonus: boolean;
  lastBonus: number;
  lives: number;
  windDrift: number;
  selectedSkin: Skin;
  highScores: HighScore[];
  username: string;
  isGeneratingSession?: boolean;
  isFloating?: boolean;
  setIsFloating?: (isFloating: boolean) => void;
  lastCheer?: CheerEvent | null;
  onlineCount?: number;
  chatMessages?: { id: string; user: string; text: string }[];
  sendChatMessage?: (text: string) => void;
}

const BLOCK_HEIGHT_PERCENT = ((BLOCK_HEIGHT - 1) / CANVAS_HEIGHT) * 100;
const IMPACT_SIZE = 60;
const CAMERA_WINDOW = 10;

export const HeightsCanvas = memo(
  forwardRef<HTMLDivElement, Props>(
    (
      {
        gameState,
        score,
        blocks,
        debris,
        currentBlock,
        timeLeft,
        isSavingScore,
        isLoggedIn,
        isMuted,
        isPaused,
        isSeasonActive,
        showPerfect,
        lastImpactTime,
        lastImpactPos,
        activePowerUp,
        handleAction,
        setIsMuted,
        setIsPaused,
        startGame,
        setGameState,
        scrollToLeaderboard,
        combos,
        totalBonusScore,
        showBonus,
        lastBonus,
        lives,
        windDrift,
        selectedSkin,
        highScores,
        username,
        isGeneratingSession,
        isFloating = false,
        setIsFloating,
        lastCheer,
        onlineCount,
        chatMessages = [],
        sendChatMessage,
      },
      ref,
    ) => {
      const t = useTranslations("Games.steemHeights");
      const { isOpen, onOpen, onOpenChange } = useDisclosure();
      const [isChatOpen, setIsChatOpen] = useState(false);
      const viewY = Math.max(0, (blocks.length - CAMERA_WINDOW) * BLOCK_HEIGHT);
      const cameraProgress = viewY / CANVAS_HEIGHT;
      const skinNameKey = `leaderboard.lab.items.skins.${selectedSkin.id}.name`;

      const renderBlockIcon = useCallback(
        (width: number) => {
          if (width < 30) return null;
          const iconSize = Math.min(12, width / 3);
          const commonProps = {
            size: iconSize,
            className: "text-white/80 drop-shadow-sm",
          };

          switch (selectedSkin?.id) {
            case "glacier":
              return <Zap {...commonProps} />;
            case "steel":
              return <Shield {...commonProps} />;
            case "phoenix":
              return <Heart {...commonProps} />;
            case "gold":
              return <Star {...commonProps} />;
            case "default":
              return <Mountain {...commonProps} />;
            default:
              return null;
          }
        },
        [selectedSkin.id],
      );

      const currentBlockStyle = useMemo(() => {
        if (!currentBlock) return null;

        return {
          left: `${(currentBlock.x / CANVAS_WIDTH) * 100}%`,
          bottom: `${((CANVAS_HEIGHT - currentBlock.y - BLOCK_HEIGHT) / CANVAS_HEIGHT) * 100}%`,
          width: `${(currentBlock.width / CANVAS_WIDTH) * 100}%`,
          height: `${BLOCK_HEIGHT_PERCENT}%`,
          backgroundColor: currentBlock.color,
        };
      }, [currentBlock]);

      const debrisStyles = useMemo(
        () =>
          debris.map((piece, index) => ({
            key: `debris-${index}`,
            style: {
              left: `${(piece.x / CANVAS_WIDTH) * 100}%`,
              bottom: `${((CANVAS_HEIGHT - piece.y - BLOCK_HEIGHT) / CANVAS_HEIGHT) * 100}%`,
              width: `${(piece.width / CANVAS_WIDTH) * 100}%`,
              height: `${BLOCK_HEIGHT_PERCENT}%`,
              backgroundColor: piece.color,
              transform: `rotate(${piece.rotation}deg)`,
            },
          })),
        [debris],
      );

      const impactStyle = useMemo(() => {
        if (!lastImpactPos) return null;

        return {
          left: `${(lastImpactPos.x / CANVAS_WIDTH) * 100}%`,
          bottom: `${((CANVAS_HEIGHT - lastImpactPos.y - BLOCK_HEIGHT) / CANVAS_HEIGHT) * 100}%`,
          width: `${IMPACT_SIZE}px`,
          height: `${IMPACT_SIZE}px`,
          marginLeft: `-${IMPACT_SIZE / 2}px`,
          marginBottom: `-${IMPACT_SIZE / 2}px`,
        };
      }, [lastImpactPos]);

      return (
        <div className="flex flex-col gap-1 sm:gap-2 w-max max-w-full group select-none sm:px-1">
          <GameHUD
            score={score}
            lives={lives}
            timeLeft={timeLeft}
            activePowerUp={activePowerUp}
            gameState={gameState}
            windDrift={windDrift}
            onOpenGuide={onOpen}
            scrollToLeaderboard={scrollToLeaderboard}
            onlineCount={onlineCount}
            isChatOpen={isChatOpen}
            onToggleChat={() => setIsChatOpen(!isChatOpen)}
          />

          <div className="flex items-center justify-between mb-1 px-1">
            <div className="flex items-center gap-1">
              <div
                className="w-5 h-5 rounded-lg flex items-center justify-center overflow-hidden transition-colors"
                style={{
                  color: selectedSkin.color,
                }}
              >
                <div className="[&_svg]:text-current">
                  {renderBlockIcon(30)}
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                {t(skinNameKey)}
              </span>
            </div>
          </div>

          <Card
            id="heights-canvas"
            ref={ref}
            className="relative w-[80vw] sm:w-[380px] min-w-[280px] min-h-[420px] sm:min-w-[320px] sm:min-h-[480px] max-w-[95vw] sm:max-w-[500px] max-h-[85vh] sm:max-h-[750px] aspect-2/3 bg-zinc-950 border-4 border-zinc-900 rounded-3xl overflow-hidden shadow-[0_0_80px_-20px_rgba(0,0,0,0.8)] transition-transform touch-none resize [&::-webkit-resizer]:bg-transparent [&::-webkit-resizer]:opacity-0"
            onMouseDown={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const isResizeHandle =
                e.clientX > rect.right - 24 && e.clientY > rect.bottom - 24;
              if (isResizeHandle) return;
              handleAction();
            }}
          >
            {/* Countdown Progress Bar */}
            {gameState === "playing" && (
              <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900 z-41">
                <motion.div
                  className="h-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  animate={{
                    width: `${(timeLeft / TIME_LIMIT) * 100}%`,
                    backgroundColor: timeLeft < 2 ? "#ef4444" : "#f59e0b",
                  }}
                  transition={{ type: "spring", bounce: 0, duration: 0.1 }}
                />
              </div>
            )}

            {/* Status Overlay Notices */}
            <AnimatePresence>
              {(!isLoggedIn || !isSeasonActive) && gameState === "idle" && (
                <div className="absolute top-14 left-0 right-0 z-41 px-4 pointer-events-none ">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex items-center gap-3 p-4 rounded-2xl backdrop-blur-md border border-white/5 shadow-2xl ${
                      !isLoggedIn
                        ? "bg-amber-500/10 border-amber-500/20"
                        : "bg-blue-500/10 border-blue-500/20"
                    }`}
                  >
                    <div
                      className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                        !isLoggedIn
                          ? "bg-amber-500/20 text-amber-500"
                          : "bg-blue-500/20 text-blue-500"
                      }`}
                    >
                      {!isLoggedIn ? (
                        <Gamepad2 size={16} />
                      ) : (
                        <RefreshCw size={16} className="animate-spin-slow" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          !isLoggedIn ? "text-amber-500" : "text-blue-500"
                        }`}
                      >
                        {!isLoggedIn
                          ? t("canvas.testGameplay")
                          : t("canvas.seasonBreak")}
                      </span>
                      <p className="text-[10px] text-zinc-400 font-medium leading-tight max-w-[200px]">
                        {!isLoggedIn
                          ? t("canvas.loginToRecord")
                          : t("canvas.seasonEnded")}
                      </p>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Background Gradients */}
            <div className="absolute inset-0 bg-linear-to-b from-zinc-900 via-zinc-950  to-black pointer-events-none" />
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 2px 2px, #3f3f46 1px, transparent 0)",
                backgroundSize: "28px 28px",
              }}
            />

            {/* Subtle atmosphere */}
            <div
              className="absolute inset-x-0 -top-[160%] -bottom-[160%] opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse at 50% 100%, rgba(245,158,11,0.35) 0%, transparent 68%)",
                backgroundSize: "100% 100%",
                transform: `translate3d(0, ${cameraProgress * 12}%, 0)`,
                filter: "blur(48px)",
              }}
            />

            <div
              className="absolute inset-x-0 -top-full -bottom-full opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 0.5px, transparent 0)",
                backgroundSize: "72px 72px",
                transform: `translate3d(0, ${cameraProgress * 20}%, 0)`,
              }}
            />

            {/* Game Controls */}
            <div
              className="absolute top-3 right-4 z-41 flex flex-row gap-2 flex-wrap justify-end max-w-[200px]"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {setIsFloating && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  className="w-8 h-8 bg-zinc-900/40 backdrop-blur-xl text-zinc-400 border border-white/5 hover:bg-zinc-800/60 hover:text-white hover:border-white/10 transition-all duration-300 rounded-xl shadow-lg active:scale-95"
                  onPress={() => setIsFloating(!isFloating)}
                >
                  <div className="relative">
                    {isFloating ? (
                      <Minimize2 size={16} className="drop-shadow-sm" />
                    ) : (
                      <PictureInPicture size={16} className="drop-shadow-sm" />
                    )}
                  </div>
                </Button>
              )}

              <Button
                isIconOnly
                size="sm"
                variant="flat"
                className="w-8 h-8 bg-zinc-900/40 backdrop-blur-xl text-zinc-400 border border-white/5 hover:bg-zinc-800/60 hover:text-white hover:border-white/10 transition-all duration-300 rounded-xl shadow-lg active:scale-95"
                onPress={() => setIsMuted(!isMuted)}
              >
                <div className="relative">
                  {isMuted ? (
                    <VolumeX size={18} className="drop-shadow-sm" />
                  ) : (
                    <Volume2 size={18} className="drop-shadow-sm" />
                  )}
                  {!isMuted && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-white/20 rounded-full"
                    />
                  )}
                </div>
              </Button>

              {gameState === "playing" && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  className="w-8 h-8 bg-zinc-900/40 backdrop-blur-xl text-zinc-400 border border-white/5 hover:bg-zinc-800/60 hover:text-white hover:border-white/10 transition-all duration-300 rounded-xl shadow-lg active:scale-95"
                  onPress={() => setIsPaused(!isPaused)}
                >
                  <div className="relative">
                    {isPaused ? (
                      <Play
                        size={18}
                        className="drop-shadow-sm fill-current ml-0.5"
                      />
                    ) : (
                      <Pause
                        size={18}
                        className="drop-shadow-sm fill-current"
                      />
                    )}
                  </div>
                </Button>
              )}
            </div>

            <div
              className="absolute w-full h-full bottom-0 transition-transform duration-500 ease-out will-change-transform "
              style={{
                transform: `translate3d(0, ${cameraProgress * 100}%, 0)`,
              }}
            >
              {gameState === "playing" && (
                <GhostMarkers highScores={highScores} username={username} />
              )}

              {/* Impact Shockwaves */}
              <AnimatePresence mode="popLayout">
                {lastImpactPos && (
                  <motion.div
                    key={lastImpactTime}
                    initial={{ scale: 0.5, opacity: 0.8 }}
                    animate={{ scale: 3.5, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="absolute pointer-events-none border-2 border-white/40 rounded-full z-20"
                    style={impactStyle ?? undefined}
                  />
                )}
              </AnimatePresence>

              <BlockStack blocks={blocks} renderBlockIcon={renderBlockIcon} />

              {currentBlock && gameState === "playing" && (
                <div
                  className="absolute rounded-sm border-t border-white/40 z-10 flex items-center justify-center overflow-hidden will-change-transform"
                  style={currentBlockStyle ?? undefined}
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-white/10" />
                  {renderBlockIcon(currentBlock.width)}
                </div>
              )}

              {debrisStyles.map((piece) => (
                <div
                  key={piece.key}
                  className="absolute rounded-sm border-t border-white/10 z-5 opacity-60 will-change-transform"
                  style={piece.style}
                />
              ))}
            </div>

            <Overlays
              showPerfect={showPerfect}
              showBonus={showBonus}
              lastBonus={lastBonus}
              lastImpactTime={lastImpactTime}
            />

            <LiveCheer cheer={lastCheer || null} />

            <GameMenus
              gameState={gameState}
              isPaused={isPaused}
              score={score}
              combos={combos}
              totalBonusScore={totalBonusScore}
              isSavingScore={isSavingScore}
              isLoggedIn={isLoggedIn}
              isSeasonActive={isSeasonActive}
              startGame={startGame}
              setGameState={setGameState}
              setIsPaused={setIsPaused}
              isGeneratingSession={isGeneratingSession}
            />
          </Card>

          <LandmarksBar score={score} highScores={highScores} />

          <GameChat
            messages={chatMessages}
            onSendMessage={sendChatMessage || (() => {})}
            currentScore={score}
            currentCombo={combos}
            isLoggedIn={isLoggedIn}
            isOpen={isChatOpen}
            onOpenChange={setIsChatOpen}
          />

          <HeightsGuideModal isOpen={isOpen} onOpenChange={onOpenChange} />
        </div>
      );
    },
  ),
);

HeightsCanvas.displayName = "HeightsCanvas";
