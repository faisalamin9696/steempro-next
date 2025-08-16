"use client";

import ToolsItemCard from "@/components/ToolsItemCard";
import React from "react";
import { FaCheckCircle, FaChevronCircleUp, FaTrailer, FaUsers } from "react-icons/fa";
import { FaEllipsisVertical } from "react-icons/fa6";
import { useTranslation } from "@/utils/i18n";

export default function page() {
  const { t } = useTranslation();
  return (
    <div className=" flex flex-col  gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
        <ToolsItemCard
          title={t("tools.mass_voting")}
          description={t("tools.mass_voting_description")}
          Icon={FaChevronCircleUp}
          href="/tools/mass-voting"
          buttonText={t("common.open")}
        />

        <ToolsItemCard
          title={t("tools.author_report")}
          description={t("tools.author_report_description")}
          Icon={FaCheckCircle}
          href="/tools/author-report"
          buttonText={t("common.open")}
        />

        <ToolsItemCard
          title={t("tools.community_report")}
          description={t("tools.community_report_description")}
          Icon={FaUsers}
          href="/tools/community-report"
          buttonText={t("common.open")}
        />
        <ToolsItemCard
          title={t("tools.trail")}
          description={t("tools.trail_description")}
          Icon={FaTrailer}
          target="_blank"
          href="https://trail.steemcn.blog"
          buttonText={t("common.open")}
        />
        <ToolsItemCard
          title={t("tools.more")}
          description={t("tools.more_description")}
          Icon={FaEllipsisVertical}
          target="_blank"
          href="https://hivelearners-bcd3c.web.app/"
          buttonText={t("common.open")}
        />
      </div>
    </div>
  );
}
