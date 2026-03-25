"use client";

import { memo } from "react";
import { Block, CANVAS_WIDTH, CANVAS_HEIGHT, BLOCK_HEIGHT } from "../Config";

interface Props {
  blocks: Block[];
  renderBlockIcon: (width: number) => React.ReactNode;
}

const getBlockFrame = (block: Pick<Block, "x" | "y" | "width" | "color">) => ({
  left: `${(block.x / CANVAS_WIDTH) * 100}%`,
  bottom: `${((CANVAS_HEIGHT - block.y - BLOCK_HEIGHT) / CANVAS_HEIGHT) * 100}%`,
  width: `${(block.width / CANVAS_WIDTH) * 100}%`,
  height: `${((BLOCK_HEIGHT - 1) / CANVAS_HEIGHT) * 100}%`,
  backgroundColor: block.color,
});

export const BlockStack = memo(({ blocks, renderBlockIcon }: Props) => {
  return (
    <>
      {blocks.map((block, i) => (
        <div
          key={i}
          className="absolute rounded-sm border-t border-white/20 z-1 flex items-center justify-center overflow-hidden will-change-transform"
          style={getBlockFrame(block)}
        >
          <div className="absolute inset-0 bg-black/20" />
          {block.grow && <div className="absolute inset-0 animate-ping bg-white/40 opacity-40" />}
          <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />
          {renderBlockIcon(block.width)}
        </div>
      ))}
    </>
  );
});

BlockStack.displayName = "BlockStack";
