"use client";

import React from "react";
import "./style.scss";
import { twMerge } from "tailwind-merge";

interface Props {
  children: React.ReactNode;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  topContent?: React.ReactNode;
  fullScreen?: boolean;
  endClassName?: string;
  startClassName?: string;
  className?: string;
}

export default function MainWrapper(props: Props) {
  const {
    children,
    className,
    startContent,
    endContent,
    endClassName,
    startClassName,
    topContent,
  } = props;
  return (
    <div className="main-container flex flex-col gap-1 px-4 pt-4 max-sm:px-2 max-sm:pt-2">
      {topContent}

      <div className=" flex flex-row justify-center w-full">
        {startContent && (
          <div
            className={twMerge(
              `left hidden rounded-lg scrollbar-thin xl:block`,
              startClassName
            )}
          >
            <div className="pr-0">{startContent}</div>
          </div>
        )}
        <div className={twMerge("center-div flex-grow overflow-visible", className)}>
          {children}
        </div>

        {endContent && (
          <div
            className={twMerge(
              `right rounded-lg scrollbar-thin pl-2
                hidden 1md:block`,
              endClassName
            )}
          >
            <div className="pb-10">{endContent}</div>
          </div>
        )}
      </div>
    </div>
  );
}
