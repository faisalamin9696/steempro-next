"use client";

import { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";
import {
  Trophy,
  Gamepad2,
  Info,
  Code2,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  OfficialGameCard,
  ThirdPartyGameCard,
} from "@/components/games/GameCard";
import { DeveloperTemplateModal } from "@/components/games/DeveloperTemplateModal";
import {
  OFFICIAL_GAMES,
  THIRD_PARTY_GAMES,
  CATEGORIES,
} from "@/components/games/Config";

export default function GamesLandingPage() {
  const [activeCategory, setActiveCategory] = useState("All Games");

  const filteredGames = OFFICIAL_GAMES.filter((game) => {
    if (activeCategory === "All Games") return true;
    return game.category === activeCategory;
  });

  return (
    <div className="min-h-screen">
      <div className="flex flex-col gap-6">
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
        <div className="flex flex-wrap justify-center gap-3 mt-4">
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
                className={`rounded-full font-bold px-4 h-8 transition-all duration-300 ${
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[450px]">
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
                  <OfficialGameCard game={game} />
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

        {/* 3rd Party Games Section */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                <ExternalLink size={12} /> Ecosystem Favorites
              </div>
              <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter text-white">
                COMMUNITY <span className="text-zinc-600">TITLES</span>
              </h2>
            </div>
            <p className="text-zinc-500 text-sm max-w-sm font-medium">
              Explore amazing games developed by the Steem community and partner
              studios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {THIRD_PARTY_GAMES.map((game) => (
              <ThirdPartyGameCard key={game.id} game={game} />
            ))}

            {/* Call to Action for Developers */}
            <Card className="h-[500px] border-2 border-dashed border-zinc-900 bg-transparent hover:border-amber-500/50 transition-all group cursor-pointer overflow-hidden">
              <CardBody className="flex flex-col items-center justify-center text-center p-8 space-y-6">
                <div className="p-6 rounded-full bg-zinc-950 border border-zinc-900 group-hover:border-amber-500/50 transition-colors">
                  <Code2
                    size={48}
                    className="text-zinc-700 group-hover:text-amber-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black italic uppercase tracking-tight text-white">
                    Your Game Here?
                  </h3>
                  <p className="text-zinc-500 text-xs font-medium">
                    Build your own game and showcase it on SteemPro Gaming Zone.
                  </p>
                </div>
                <DeveloperTemplateModal />
              </CardBody>
            </Card>
          </div>
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
              <div className="flex flex-wrap gap-4">
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
