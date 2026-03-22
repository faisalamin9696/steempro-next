import PageHeader from "@/components/ui/PageHeader";
import { Wrench, Send, CheckSquare, Users, BarChart, Settings, FileText } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function ToolsPage() {
  const t = await getTranslations("Tools");

  const toolsList = [
    {
      title: t("list.batchTransfer.title"),
      description: t("list.batchTransfer.description"),
      href: "/tools/batch-transfer",
      icon: Send,
      color: "primary",
    },
    {
      title: t("list.batchVoting.title"),
      description: t("list.batchVoting.description"),
      href: "/tools/batch-voting",
      icon: CheckSquare,
      color: "success",
    },
    {
      title: t("list.communityReport.title"),
      description: t("list.communityReport.description"),
      href: "/tools/community-report",
      icon: Users,
      color: "secondary",
    },
    {
      title: t("list.authorReport.title"),
      description: t("list.authorReport.description"),
      href: "/tools/author-statistic-report",
      icon: BarChart,
      color: "primary",
    },
    {
      title: t("list.accountCreation.title"),
      description: t("list.accountCreation.description"),
      href: "/tools/account-creation",
      icon: Settings,
      color: "danger",
    },
    {
      title: t("list.snippetsTemplates.title"),
      description: t("list.snippetsTemplates.description"),
      href: "/submit",
      icon: FileText,
      color: "warning",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("title")}
        description={t("description")}
        icon={Wrench}
        color="primary"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {toolsList.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <Link
              key={index}
              href={tool.href}
              className="post-card flex flex-col p-6 rounded-xl border border-default-200 hover:border-primary/50 hover:shadow-lg transition-all"
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 
                  ${
                    tool.color === "primary"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : tool.color === "warning"
                      ? "bg-warning/10 text-warning border-warning/20"
                      : tool.color === "danger"
                      ? "bg-danger/10 text-danger border-danger/20"
                      : tool.color === "success"
                      ? "bg-success/10 text-success border-success/20"
                      : "bg-secondary/10 text-secondary border-secondary/20"
                  } border`}
              >
                <Icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {tool.title}
              </h3>
              <p className="text-sm text-muted-foreground opacity-80 grow">
                {tool.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
