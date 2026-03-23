"use client";

import PageHeader from "@/components/ui/PageHeader";
import {
  Wrench,
  Send,
  CheckSquare,
  Users,
  BarChart,
  Settings,
  FileText,
  MessageSquare,
  Database,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

export default function ToolsPage() {
  const t = useTranslations("Tools");

  const toolsList = [
    {
      title: t("list.batchTransfer.title"),
      description: t("list.batchTransfer.description"),
      href: "/tools/batch-transfer",
      icon: Send,
      color: "primary",
      tag: "V-TX",
    },
    {
      title: t("list.batchVoting.title"),
      description: t("list.batchVoting.description"),
      href: "/tools/batch-voting",
      icon: CheckSquare,
      color: "success",
      tag: "V-UP",
    },
    {
      title: t("list.batchCommenting.title"),
      description: t("list.batchCommenting.description"),
      href: "/tools/batch-commenting",
      icon: MessageSquare,
      color: "primary",
      tag: "V-CM",
    },
    {
      title: t("list.communityReport.title"),
      description: t("list.communityReport.description"),
      href: "/tools/community-report",
      icon: Users,
      color: "success",
      tag: "M-RP",
    },
    {
      title: t("list.authorReport.title"),
      description: t("list.authorReport.description"),
      href: "/tools/author-statistic-report",
      icon: BarChart,
      color: "primary",
      tag: "A-RP",
    },
    {
      title: t("list.accountCreation.title"),
      description: t("list.accountCreation.description"),
      href: "/tools/account-creation",
      icon: Settings,
      color: "danger",
      tag: "AC-C",
    },
    {
      title: t("list.snippetsTemplates.title"),
      description: t("list.snippetsTemplates.description"),
      href: "/submit",
      icon: FileText,
      color: "warning",
      tag: "SN-P",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={t("title")}
        description={t("description")}
        icon={Wrench}
        color="primary"
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {toolsList.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <motion.div key={index} variants={item}>
              <Link
                href={tool.href}
                className="group relative flex flex-col p-5 rounded-xl border border-default-200 bg-content1/20 backdrop-blur-md hover:bg-content1/40 hover:border-primary/50 transition-all h-full overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={twMerge(
                      "w-10 h-10 rounded-lg flex items-center justify-center border transition-all group-hover:scale-105",
                      tool.color === "primary"
                        ? "bg-primary/10 text-primary border-primary/20 shadow-sm shadow-primary/10"
                        : tool.color === "warning"
                          ? "bg-warning/10 text-warning border-warning/20 shadow-sm shadow-warning/10"
                          : tool.color === "danger"
                            ? "bg-danger/10 text-danger border-danger/20 shadow-sm shadow-danger/10"
                            : "bg-success/10 text-success border-success/20 shadow-sm shadow-success/10",
                    )}
                  >
                    <Icon size={20} />
                  </div>
                </div>

                <div className="flex items-start justify-between gap-2 overflow-hidden">
                  <h3 className="text-sm font-black text-foreground uppercase tracking-widest group-hover:text-primary transition-colors line-clamp-1">
                    {tool.title}
                  </h3>
                  <ArrowUpRight
                    size={14}
                    className="text-default-300 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </div>

                <p className="text-[11px] font-medium text-muted opacity-70 grow leading-relaxed mt-2 line-clamp-2">
                  {tool.description}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
