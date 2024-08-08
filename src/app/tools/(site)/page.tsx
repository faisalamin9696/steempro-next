"use client";

import ToolsItemCard from "@/components/ToolsItemCard";
import React from "react";
import { FaCheckCircle, FaChevronCircleUp, FaUsers } from "react-icons/fa";
import { FaEllipsisVertical } from "react-icons/fa6";

export default function page() {
  return (
    <div className=" flex flex-col  gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
        <ToolsItemCard
          title="Mass Voting"
          description="Cast vote on multiple posts"
          Icon={FaChevronCircleUp}
          href="/tools/mass-voting"
          buttonText="Open"
        />

        <ToolsItemCard
          title="Author Report"
          description="Explore author progress"
          Icon={FaCheckCircle}
          href="/tools/author-report"
          buttonText="Open"
        />

        <ToolsItemCard
          title="Community Report"
          description="Explore community progress"
          Icon={FaUsers}
          href="/tools/community-report"
          buttonText="Open"
        />

        <ToolsItemCard
          title="More"
          description="Explore more tools"
          Icon={FaEllipsisVertical}
          target="_blank"
          href="https://hivelearners-bcd3c.web.app/"
          buttonText="Open"
        />
      </div>
    </div>
  );
}
