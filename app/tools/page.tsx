"use client";

import { useState, useMemo } from "react";
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
  ArrowUpRight,
  ShieldCheck,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";

export default function ToolsPage() {
  const t = useTranslations("Tools");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Tools", icon: LayoutGrid },
    { id: "utils", label: "Utilities", icon: Wrench },
    { id: "reports", label: "Reports", icon: BarChart },
    { id: "security", label: "Security", icon: ShieldCheck },
  ];

  const toolsList = [
    {
      title: t("list.batchTransfer.title"),
      description: t("list.batchTransfer.description"),
      href: "/tools/batch-transfer",
      icon: Send,
      color: "primary",
      tag: "B-TX",
      category: "utils",
    },
    {
      title: t("list.batchVoting.title"),
      description: t("list.batchVoting.description"),
      href: "/tools/batch-voting",
      icon: CheckSquare,
      color: "primary",
      tag: "B-UP",
      category: "utils",
    },
    {
      title: t("list.batchCommenting.title"),
      description: t("list.batchCommenting.description"),
      href: "/tools/batch-commenting",
      icon: MessageSquare,
      color: "primary",
      tag: "B-CM",
      category: "utils",
    },
    {
      title: t("list.communityReport.title"),
      description: t("list.communityReport.description"),
      href: "/tools/community-report",
      icon: Users,
      color: "secondary",
      tag: "CM-RP",
      category: "reports",
    },
    {
      title: t("list.authorReport.title"),
      description: t("list.authorReport.description"),
      href: "/tools/author-statistic-report",
      icon: BarChart,
      color: "secondary",
      tag: "A-RP",
      category: "reports",
    },
    {
      title: t("list.accountCreation.title"),
      description: t("list.accountCreation.description"),
      href: "/tools/account-creation",
      icon: Settings,
      color: "danger",
      tag: "AC-C",
      category: "utils",
    },
    {
      title: t("list.snippetsTemplates.title"),
      description: t("list.snippetsTemplates.description"),
      href: "/submit",
      icon: FileText,
      color: "warning",
      tag: "SN-P",
      category: "utils",
    },
    {
      title: t("list.accountHealth.title"),
      description: t("list.accountHealth.description"),
      href: "/tools/account-health-check",
      icon: ShieldCheck,
      color: "success",
      tag: "AC-H",
      category: "security",
    },
  ];

  const filteredTools = useMemo(() => {
    if (selectedCategory === "all") return toolsList;
    return toolsList.filter((tool) => tool.category === selectedCategory);
  }, [selectedCategory, toolsList]);

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

      <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start pb-2 px-1">
        {categories.map((category) => {
          const CategoryIcon = category.icon;
          const isActive = selectedCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={twMerge(
                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border",
                isActive
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 "
                  : "bg-content1/40 text-muted border-default-200 hover:border-primary/50 hover:bg-content1/60",
              )}
            >
              <CategoryIcon size={14} />
              {category.label}
            </button>
          );
        })}
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredTools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.href + tool.title}
                variants={item}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
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
                              : tool.color === "secondary"
                                ? "bg-secondary/10 text-secondary border-secondary/20 shadow-sm shadow-secondary/10"
                                : "bg-success/10 text-success border-success/20 shadow-sm shadow-success/10",
                      )}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="px-2 py-1 rounded-md bg-default-100 border border-default-200 text-[9px] font-black uppercase tracking-tighter text-muted">
                      {tool.tag}
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
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
