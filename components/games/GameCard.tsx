"use client";

import { Card, CardHeader, CardBody } from "@heroui/card";
import { Image } from "@heroui/image";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Zap, Trophy, Play, Globe, Database } from "lucide-react";
import Link from "next/link";
import { Game } from "./types";

interface GameCardProps {
  game: Game;
}

export const OfficialGameCard = ({ game }: GameCardProps) => {
  return (
    <Card
      isFooterBlurred
      className="w-full h-[400px] border-none bg-zinc-950/40 group hover:scale-[1.02] transition-all duration-500 overflow-hidden"
    >
      <CardHeader className="absolute z-10 top-0 flex-col items-start p-0">
        <div className="flex w-full justify-between items-start p-4">
          <div className="flex flex-col gap-1">
            <Chip
              variant="dot"
              color="warning"
              size="sm"
              className="font-black uppercase text-[9px] bg-black/40 backdrop-blur-md border-white/10 text-white"
            >
              NATIVE
            </Chip>
          </div>
          {game.featured && (
            <div className="bg-amber-500 text-black text-[9px] font-black px-2 py-0.5 rounded italic shadow-2xl -skew-x-12">
              HOT
            </div>
          )}
        </div>
      </CardHeader>

      <Image
        fetchPriority="high"
        removeWrapper
        alt={game.title}
        className="z-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 brightness-50 group-hover:brightness-75"
        src={game.image}
      />

      <CardBody className="absolute bottom-0 z-10 w-full bg-linear-to-t from-black via-black/90 to-transparent p-5 space-y-3">
        <div className="space-y-0.5">
          <h2 className="text-xl md:text-2xl font-black italic tracking-tighter text-white uppercase group-hover:text-amber-500 transition-colors">
            {game.title}
          </h2>
          <p className="text-zinc-500 text-[11px] font-medium line-clamp-1 leading-relaxed">
            {game.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
            <Zap size={12} className="text-amber-500" />
            <span className="text-[10px] font-black uppercase text-zinc-400">
              {game.difficulty}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
            <Trophy size={12} className="text-amber-500" />
            <span className="text-[10px] font-black uppercase text-zinc-400">
              {game.stats.rewards}
            </span>
          </div>
          {game.usesBlockchain && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
              <Database size={12} className="text-amber-500" />
              <span className="text-[10px] font-black uppercase text-amber-500/80">
                Chain
              </span>
            </div>
          )}
        </div>

        <Button
          as={Link}
          href={game.href}
          className="w-full bg-white text-black hover:bg-amber-500 hover:text-black font-black uppercase text-[10px] tracking-widest transition-all h-10 rounded-lg"
          endContent={<Play size={14} fill="currentColor" />}
        >
          Enter Game
        </Button>
      </CardBody>
    </Card>
  );
};

export const ThirdPartyGameCard = ({ game }: GameCardProps) => {
  return (
    <Card
      isFooterBlurred
      className="w-full h-[500px] border-none bg-zinc-950/40 group hover:scale-[1.02] transition-all duration-500 overflow-hidden"
    >
      <CardHeader className="absolute z-10 top-0 flex-col items-start p-0 px-4 pt-4">
        <div className="flex w-full justify-between items-start">
          <div className="flex gap-2">
            <Chip
              variant="flat"
              size="sm"
              className="bg-black/40 text-white backdrop-blur-md border-white/10 font-black uppercase text-[9px]"
            >
              {game.category}
            </Chip>
            {game.usesBlockchain && (
              <Chip
                color="warning"
                variant="solid"
                size="sm"
                classNames={{ content: "flex flex-row items-center gap-1" }}
                className="text-[9px] font-black uppercase backdrop-blur-md"
              >
                <Database size={10} /> Chain
              </Chip>
            )}
          </div>
          {game.developer?.website && (
            <Button
              as={Link}
              href={game.developer.website}
              target="_blank"
              isIconOnly
              size="sm"
              variant="flat"
              className="bg-black/40 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full border border-white/10 backdrop-blur-md"
            >
              <Globe size={14} />
            </Button>
          )}
        </div>
      </CardHeader>

      <Image
        fetchPriority="high"
        removeWrapper
        alt={game.title}
        className="z-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 brightness-50 group-hover:brightness-[0.65]"
        src={game.image}
      />

      <CardBody className="absolute bottom-0 z-10 w-full bg-linear-to-t from-black via-black/95 to-transparent p-6 space-y-4">
        <div className="space-y-1">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase group-hover:text-amber-500 transition-colors">
              {game.title}
            </h2>
            {game.developer && (
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/60">
                Studio: {game.developer.name}
              </span>
            )}
          </div>
          <p className="text-zinc-500 text-[11px] font-medium line-clamp-2 leading-relaxed">
            {game.description}
          </p>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 p-2 rounded-xl bg-white/5 border border-white/5 text-center backdrop-blur-sm">
            <span className="block text-[8px] font-black text-zinc-600 uppercase tracking-widest">
              Difficulty
            </span>
            <span className="text-[10px] font-bold text-zinc-400">
              {game.difficulty}
            </span>
          </div>
          <div className="flex-1 p-2 rounded-xl bg-white/5 border border-white/5 text-center backdrop-blur-sm">
            <span className="block text-[8px] font-black text-zinc-600 uppercase tracking-widest">
              Rewards
            </span>
            <span className="text-[10px] font-bold text-zinc-400">
              {game.stats.rewards}
            </span>
          </div>
        </div>

        <Button
          as={Link}
          href={game.href}
          target={game.href.startsWith("http") ? "_blank" : "_self"}
          className="w-full bg-white text-black hover:bg-amber-500 hover:text-black font-black uppercase text-[10px] tracking-widest transition-all h-11 rounded-xl"
        >
          Launch Website
        </Button>
      </CardBody>
    </Card>
  );
};
