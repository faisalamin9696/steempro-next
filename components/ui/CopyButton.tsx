"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { twMerge } from "tailwind-merge";

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: number;
}

export default function CopyButton({
  text,
  className,
  size = 14,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={twMerge(
        "transition-colors duration-200 shrink-0",
        copied
          ? "text-success"
          : "text-default-300 hover:text-primary dark:text-default-400 dark:hover:text-primary",
        className,
      )}
    >
      {copied ? <Check size={size} /> : <Copy size={size} />}
    </button>
  );
}
