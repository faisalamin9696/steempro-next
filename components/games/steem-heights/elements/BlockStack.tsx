"use client";

import { motion } from "framer-motion";
import { memo } from "react";
import { Block, CANVAS_WIDTH, CANVAS_HEIGHT, BLOCK_HEIGHT } from "../Config";

interface Props {
  blocks: Block[];
  renderBlockIcon: (width: number) => React.ReactNode;
}

export const BlockStack = memo(({ blocks, renderBlockIcon }: Props) => {
  return (
    <>
      {blocks.map((block, i) => (
        <motion.div
          key={i}
          initial={block.grow ? { scale: 1.1 } : false}
          animate={{ scale: 1 }}
          className="absolute rounded-sm shadow-sm border-t border-white/20 z-1 flex items-center justify-center overflow-hidden will-change-transform"
          style={{
            left: `${(block.x / CANVAS_WIDTH) * 100}%`,
            bottom: `${((CANVAS_HEIGHT - block.y - BLOCK_HEIGHT) / CANVAS_HEIGHT) * 100}%`,
            width: `${(block.width / CANVAS_WIDTH) * 100}%`,
            height: `${((BLOCK_HEIGHT - 1) / CANVAS_HEIGHT) * 100}%`,
            backgroundColor: block.color,
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
          {block.grow && (
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
          <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />
          {renderBlockIcon(block.width)}
        </motion.div>
      ))}
    </>
  );
});

BlockStack.displayName = "BlockStack";
