"use client";

import { useTranslations } from "next-intl";
import { useDisclosure } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Code2 } from "lucide-react";
import Link from "next/link";
import SModal from "../ui/SModal";

export const DeveloperTemplateModal = () => {
  const t = useTranslations("Games.developerTemplate");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const CONFIG_GITHUB_URL =
    "https://github.com/faisalamin9696/steempro-next/tree/master/components/games/Config.ts";

  const codeString = `{
  id: "your-game-id",
  title: "Your Game Title",
  description: "Catchy description.",
  image: "https://url.com/thumbnail.png",
  category: "Strategy",
  difficulty: "Hard",
  href: "https://your-game.com",
  usesBlockchain: false,
  stats: { rewards: "External" },
  developer: {
    name: "Your Studio",
    website: "https://studio.com",
  },
};`;

  return (
    <>
      <Button
        variant="bordered"
        onPress={onOpen}
        className="rounded-full border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all font-black uppercase text-[10px] tracking-widest px-8"
      >
        {t("viewTemplate")}
      </Button>
      <SModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        classNames={{
          base: "dark:bg-zinc-950 border border-zinc-900",
          header: "border-b border-zinc-300 dark:border-zinc-900",
          footer: "border-t border-zinc-300 dark:border-zinc-900",
        }}
        title={() => (
          <div className="flex flex-row gap-2 items-center">
            <Code2 className="text-amber-500" />
            <span className="font-black italic uppercase tracking-tight">
              {t("title")}
            </span>
          </div>
        )}
        footer={() => (
          <div className="flex gap-2">
            <Button
              variant="light"
              onPress={onOpenChange}
              className="rounded-full font-bold uppercase text-[10px] tracking-widest text-zinc-500"
            >
              {t("close")}
            </Button>
            <Button
              as={Link}
              href={CONFIG_GITHUB_URL}
              target="_blank"
              className="bg-foreground text-background font-black uppercase text-[10px] tracking-widest rounded-full px-6"
            >
              {t("getStarted")}
            </Button>
          </div>
        )}
      >
        {() => (
          <div className="space-y-4">
            <p className="text-muted text-sm">
              {t("description")}
            </p>
            <pre className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 overflow-x-auto text-[10px] text-amber-500 font-mono">
              {codeString}
            </pre>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-zinc-300 dark:bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                <span className="block text-[10px] font-black uppercase mb-1">
                  {t("thumbnail")}
                </span>
                <span className="text-zinc-500 text-[9px]">
                  {t("thumbnailRecommended")}
                </span>
              </div>
              <div className="p-3 bg-zinc-300 dark:bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                <span className="block text-[10px] font-black uppercase mb-1">
                  {t("integration")}
                </span>
                <span className="text-zinc-500 text-[9px]">
                  {t("integrationLevels")}
                </span>
              </div>
            </div>
          </div>
        )}
      </SModal>
    </>
  );
};
