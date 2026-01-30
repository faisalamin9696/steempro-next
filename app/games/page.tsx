"use client";

import { useState } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Zap, Trophy, Play, Gamepad2, Info } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const GAMES = [
  {
    id: "steem-heights",
    title: "Steem Heights",
    description:
      "Scale the skyline with unwavering focus. Align each block with surgical precision to reach record-breaking altitudes.",
    image: "/assets/games/steem-heights.png",
    category: "Precision",
    difficulty: "Medium",
    href: "/games/steem-heights",
    stats: {
      // players: "1.2k",
      rewards: "Active",
    },
    featured: true,
  },
];

const CATEGORIES = ["All Games", "Precision", "Prediction", "Knowledge"];

export default function GamesLandingPage() {
  const [activeCategory, setActiveCategory] = useState("All Games");

  const filteredGames = GAMES.filter((game) => {
    if (activeCategory === "All Games") return true;
    return game.category === activeCategory;
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest"
          >
            <Gamepad2 size={16} /> SteemPro Gaming Zone
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black italic tracking-tighter bg-clip-text text-transparent bg-linear-to-b from-white to-zinc-600 leading-tight"
          >
            PLAY. COMPETE. <span className="text-amber-500">EARN.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-500 text-base md:text-lg font-medium leading-relaxed"
          >
            Welcome to the ultimate blockchain gaming destination. Test your
            skills, climb the leaderboards, and win rewards in the Steem
            ecosystem.
          </motion.p>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap justify-center gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              key={cat}
            >
              <Button
                onPress={() => setActiveCategory(cat)}
                variant={activeCategory === cat ? "solid" : "bordered"}
                size="sm"
                className={`rounded-full font-bold px-6 h-10 transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-white text-black border border-zinc-800"
                    : "text-zinc-500 border border-muted/50 hover:border-zinc-600"
                }`}
              >
                {cat}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8 min-h-[450px]">
          <AnimatePresence mode="popLayout">
            {filteredGames.length > 0 ? (
              filteredGames.map((game, index) => (
                <motion.div
                  key={game.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    isFooterBlurred
                    className="w-full h-[450px] border-none bg-zinc-950/50 group hover:scale-[1.02] transition-all duration-500"
                  >
                    <CardHeader className="absolute z-10 top-1 flex-col items-start gap-2">
                      <div className="flex w-full justify-between items-start pt-2 px-2">
                        <Chip
                          variant="flat"
                          color="warning"
                          size="sm"
                          className="font-black uppercase text-[10px] backdrop-blur-md"
                        >
                          {game.category}
                        </Chip>
                        {game.featured && (
                          <div className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded italic shadow-2xl">
                            HOT
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <Image
                      removeWrapper
                      alt={game.title}
                      className="z-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 brightness-50 group-hover:brightness-75"
                      src={game.image}
                    />

                    <CardBody className="absolute bottom-0 z-10 w-full bg-linear-to-t from-black via-black/90 to-transparent p-6 space-y-4">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-black italic tracking-tight text-white uppercase group-hover:text-amber-500 transition-colors">
                          {game.title}
                        </h2>
                        <p className="text-zinc-400 text-xs font-medium line-clamp-2 leading-relaxed">
                          {game.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        <div className="flex items-center gap-1">
                          <Zap size={10} className="text-amber-500" />
                          {game.difficulty}
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy size={10} className="text-amber-500" />
                          {game.stats.rewards}
                        </div>
                      </div>

                      <Button
                        as={Link}
                        href={game.href}
                        className="w-full bg-white/10 hover:bg-white text-white hover:text-black font-black uppercase text-xs backdrop-blur-md border border-white/20 transition-all py-6 h-auto"
                        endContent={<Play size={16} fill="currentColor" />}
                      >
                        Play Now
                      </Button>
                    </CardBody>
                  </Card>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-4"
              >
                <Gamepad2 size={48} className="text-zinc-800" />
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-zinc-400 uppercase tracking-tighter italic">
                    No Games Found
                  </h3>
                  <p className="text-zinc-600 text-sm max-w-xs">
                    We're currently developing new titles for this category.
                    Stay tuned!
                  </p>
                </div>
                <Button
                  variant="bordered"
                  size="sm"
                  onPress={() => setActiveCategory("All Games")}
                  className="rounded-full border-zinc-800 text-zinc-500"
                >
                  Reset Filter
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Information Section */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 md:p-12 shadow-2xl shadow-amber-500/5 transition-all hover:border-zinc-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                <Info size={12} /> Fair Play & Rewards
              </div>
              <h3 className="text-3xl font-black italic tracking-tighter text-white">
                IMMUTABLE <span className="text-zinc-600">SCORES</span>
              </h3>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                All high scores and game achievements are recorded directly on
                the Steem blockchain. This ensures transparency, immutability,
                and proof of skill. Top performers are eligible for curated
                rewards from the SteemPro community.
              </p>
              <div className="flex gap-4">
                <div className="flex-1 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 space-y-2 group hover:bg-zinc-900 hover:border-zinc-700 transition-all">
                  <div className="text-amber-500 font-black text-xl italic tracking-tighter leading-none group-hover:scale-105 transition-transform">
                    TRANSPARENT
                  </div>
                  <div className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                    Verified on Chain
                  </div>
                </div>
                <div className="flex-1 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 space-y-2 group hover:bg-zinc-900 hover:border-zinc-700 transition-all">
                  <div className="text-amber-500 font-black text-xl italic tracking-tighter leading-none group-hover:scale-105 transition-transform">
                    REWARDING
                  </div>
                  <div className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                    Community Driven
                  </div>
                </div>
              </div>
            </div>
            <div className="relative aspect-auto rounded-2xl overflow-hidden border border-zinc-800 group shadow-2xl">
              <Image
                src={"/assets/games/gaming-cover.png"}
                alt="Gaming background"
                className="object-cover h-full w-full grayscale group-hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px] group-hover:backdrop-blur-0 transition-all duration-500">
                <div className="text-center p-6 bg-black/60 rounded-full border border-white/10 group-hover:scale-110 transition-transform duration-500">
                  <Trophy size={48} className="text-amber-500 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
