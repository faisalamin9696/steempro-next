"use client";

import React from "react";
import { twMerge } from "tailwind-merge";

interface LayoutProps {
  children: React.ReactNode;
  rootClassName?: string;
  start?: React.ReactNode;
  end?: React.ReactNode;
  top?: React.ReactNode;
  endClass?: string;
  startClass?: string;
  className?: string;
}

export default function MainWrapper({
  children,
  rootClassName,
  className,
  start,
  end,
  endClass,
  startClass,
  top,
}: LayoutProps) {
  return (
    <div
      className={twMerge(
        "flex flex-col w-full mx-auto max-w-7xl px-2 mt-4",
        rootClassName
      )}
    >
      {top}

      <div className="flex w-full justify-between">
        {start && (
          <aside className={twMerge("hidden xl:block", startClass)}>
            {start}
          </aside>
        )}

        <div className={twMerge("flex-1 min-w-0", className)}>{children}</div>

        {end && (
          <aside className={twMerge("hidden 1md:block ml-4", endClass)}>
            {end}
          </aside>
        )}
      </div>
    </div>
  );
}
