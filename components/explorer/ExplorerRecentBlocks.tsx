"use client";

import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Box, Clock, ArrowRight, User, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRecentBlocks } from "./useExplorerData";
import CopyButton from "../ui/CopyButton";

export default function ExplorerRecentBlocks() {
  const { data: blocks, isLoading } = useRecentBlocks();

  if (isLoading || !blocks) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Chip
            size="sm"
            variant="dot"
            color="success"
            classNames={{
              base: "border-success/20",
              content: "text-xs font-semibold",
            }}
          >
            Live Feed
          </Chip>
          <span className="text-xs text-default-500 dark:text-default-400">
            Last 10 blocks · Auto-refreshes
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {blocks.map((block, i) => (
            <motion.div
              key={block.num}
              layout
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
            >
              <Card
                className="bg-white/60 dark:bg-content1/30 border border-default-200/60 dark:border-default-100/50 hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300 group cursor-default"
                shadow="none"
              >
                <CardBody className="p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Box size={18} />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/explorer/block/${block.num}`}
                          className="font-bold font-mono text-primary text-sm hover:underline"
                        >
                          #{block.num.toLocaleString()}
                        </Link>
                        <CopyButton text={block.num.toString()} size={12} />
                        <span className="text-default-300 dark:text-default-300">
                          <ArrowRight size={12} />
                        </span>
                        <Link
                          href={`/@${block.witness}`}
                          className="text-sm text-default-600 dark:text-default-500 hover:text-primary transition-colors flex items-center gap-1"
                        >
                          <User size={12} />
                          {block.witness}
                        </Link>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-default-500 dark:text-default-400">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(block.timestamp + "Z").toLocaleTimeString()}
                        </span>
                        <Chip
                          size="sm"
                          variant="flat"
                          classNames={{
                            base: "h-5",
                            content:
                              "text-[10px] font-bold flex items-center gap-1",
                          }}
                          color={block.txCount > 0 ? "primary" : "default"}
                        >
                          <Zap size={10} />
                          {block.txCount} tx
                        </Chip>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
