"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/ui/PageHeader";
import {
  BarChart,
  Play,
  Copy,
  RefreshCw,
  Layers,
  DollarSign,
  Activity,
  MessageSquare,
} from "lucide-react";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { client } from "@/libs/steem";
import { toast } from "sonner";
import moment from "moment";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { useTranslations } from "next-intl";

export default function AuthorStatisticReportPage() {
  const t = useTranslations("AuthorStatistic");
  const [username, setUsername] = useState("");
  const [startDate, setStartDate] = useState(
    moment().subtract(7, "days").format("YYYY-MM-DD"),
  );
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));

  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleFetchReport = async () => {
    const author = username.replace("@", "").trim().toLowerCase();
    if (!author) {
      toast.error(t("error.invalidUsername"));
      return;
    }

    setIsLoading(true);
    setPosts([]);
    setHasSearched(false);

    let allPosts: any[] = [];
    let lastAuthor = "";
    let lastPermlink = "";

    // Parse dates to start and end of day in UTC (Steem blockchain time is UTC)
    const startTimestamp = moment.utc(startDate).startOf("day").unix();
    const endTimestamp = moment.utc(endDate).endOf("day").unix();

    try {
      while (true) {
        const query: any = { tag: author, limit: 100 };
        if (lastAuthor && lastPermlink) {
          query.start_author = lastAuthor;
          query.start_permlink = lastPermlink;
        }

        const result = await client.database.getDiscussions("blog", query);

        if (result.length === 0) break;

        const newPosts = lastAuthor ? result.slice(1) : result;
        if (newPosts.length === 0) break;

        let reachedEnd = false;

        for (const post of newPosts) {
          // Ignore reblogs by checking if author matches
          if (post.author !== author) continue;

          const postTime = moment.utc(post.created).unix();

          if (postTime > endTimestamp) {
            continue; // Skip posts newer than end date
          }
          if (postTime < startTimestamp) {
            reachedEnd = true; // We've reached past the start date window
            break;
          }

          allPosts.push(post);
        }

        if (reachedEnd) break;
        if (result.length < 100) break;

        lastAuthor = result[result.length - 1].author;
        lastPermlink = result[result.length - 1].permlink;
      }

      setPosts(allPosts);
      setHasSearched(true);
      toast.success(t("success.analyzed", { count: allPosts.length, author }));
    } catch (e: any) {
      toast.error(e?.message || t("error.fetchFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("success.copied"));
  };

  const stats = useMemo(() => {
    if (posts.length === 0) return null;

    let totalPayout = 0;
    let upvotes = 0;
    let commentsReceived = 0;

    posts.forEach((post) => {
      // Payout could be in SBD or STEEM
      const payoutStr =
        typeof post.total_payout_value === "string"
          ? post.total_payout_value
          : "0 SBD";

      totalPayout += parseFloat(payoutStr);
      upvotes += post.active_votes?.length || 0;
      commentsReceived += post.children || 0;
    });

    return {
      totalPosts: posts.length,
      totalPayout: totalPayout.toFixed(3),
      avgPayout:
        posts.length > 0 ? (totalPayout / posts.length).toFixed(3) : "0.000",
      totalUpvotes: upvotes,
      totalComments: commentsReceived,
      postsData: posts,
    };
  }, [posts]);

  // Transform data slightly so sorting by payout/upvotes works perfectly in the DataTable
  const tableData = useMemo(() => {
    if (!stats) return [];
    return stats.postsData
      .map((post: any) => {
        const payoutVal =
          parseFloat(post.pending_payout_value) ||
          parseFloat(post.total_payout_value) ||
          0;
        return {
          ...post,
          payout: payoutVal,
          upvotes: post.active_votes?.length || 0,
        };
      })
      .sort(
        (a: any, b: any) =>
          moment.utc(b.created).unix() - moment.utc(a.created).unix(),
      );
  }, [stats]);

  const postColumns: ColumnDef<any>[] = useMemo(
    () => [
      {
        key: "created",
        header: t("table.date"),
        sortable: true,
        render: (val) => (
          <span className="text-default-500">
            {moment.utc(val).format("MMM DD")}
          </span>
        ),
      },
      {
        key: "title",
        header: t("table.postTitle"),
        searchable: true,
        render: (val, row) => (
          <a
            href={`https://steemit.com/@${row.author}/${row.permlink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline line-clamp-1 max-w-[280px]"
          >
            {val}
          </a>
        ),
      },
      {
        key: "category",
        header: t("table.community"),
        sortable: true,
        searchable: true,
        render: (val) => (
          <span className="text-default-500 text-xs truncate max-w-[120px] inline-block">
            {val}
          </span>
        ),
      },
      {
        key: "payout",
        header: t("table.payout"),
        sortable: true,
        render: (val) => {
          return (
            <div className="text-right w-full font-semibold text-success">
              ${val.toFixed(2)}
            </div>
          );
        },
        className: "text-right",
      },
      {
        key: "upvotes",
        header: t("table.votes"),
        sortable: true,
        render: (val) => <div className="text-right w-full">{val}</div>,
        className: "text-right w-16",
      },
      {
        key: "children",
        header: t("table.replies"),
        sortable: true,
        render: (val) => <div className="text-right w-full">{val}</div>,
        className: "text-right w-16",
      },
    ],
    [t],
  );

  const markdownReport = useMemo(() => {
    if (!stats || !tableData) return "";

    return `
# ${t("markdown.reportTitle", { author: username.replace("@", "").trim() })}
**${t("markdown.dateRange")}:** ${moment(startDate).format("MMM DD, YYYY")} - ${moment(endDate).format("MMM DD, YYYY")}

## 📊 ${t("markdown.summary")}
| ${t("markdown.metric")} | ${t("markdown.value")} |
|--------|-------|
| 📝 **${t("markdown.totalPosts")}** | ${stats.totalPosts} |
| 💰 **${t("markdown.totalPayout")}** | $${stats.totalPayout} |
| ⚖️ **${t("markdown.avgPayout")}** | $${stats.avgPayout} |
| 👍 **${t("markdown.totalUpvotes")}** | ${stats.totalUpvotes} |
| 💬 **${t("markdown.totalComments")}** | ${stats.totalComments} |

## 📰 ${t("markdown.performanceLog")}
| ${t("markdown.date")} | ${t("markdown.postTitle")} | ${t("markdown.community")} | ${t("markdown.votes")} | ${t("markdown.replies")} | ${t("markdown.payout")} |
|------|-------|-----------|-------|---------|--------|
${tableData.map((post: any) => `| ${moment.utc(post.created).format("MMM DD")} | [${post.title.substring(0, 50).replace(/\|/g, "-")}](https://steemit.com/@${post.author}/${post.permlink}) | ${post.category} | ${post.upvotes} | ${post.children} | $${post.payout.toFixed(2)} |`).join("\n")}

---
*${t("markdown.footer", { url: "https://www.steempro.com/tools" })}*
`.trim();
  }, [stats, tableData, username, startDate, endDate]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 pb-20 max-w-5xl">
      <PageHeader
        title={t("title")}
        description={t("description")}
        icon={BarChart}
        color="primary"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form controls */}
        <div className="lg:col-span-1 space-y-4">
          <Card shadow="sm" className="border border-default-200">
            <CardHeader className="font-semibold px-4 py-3 bg-default-50 border-b border-default-200">
              {t("parameters")}
            </CardHeader>
            <CardBody className="p-4 space-y-4">
              <Input
                label={t("username")}
                placeholder={t("placeholder")}
                value={username}
                onValueChange={setUsername}
                isDisabled={isLoading}
                autoCapitalize="off"
                startContent={
                  <span className="text-default-400 text-sm">@</span>
                }
                variant="bordered"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label={t("startDate")}
                  type="date"
                  value={startDate}
                  onValueChange={setStartDate}
                  isDisabled={isLoading}
                  variant="bordered"
                />
                <Input
                  label={t("endDate")}
                  type="date"
                  value={endDate}
                  onValueChange={setEndDate}
                  isDisabled={isLoading}
                  variant="bordered"
                />
              </div>

              <Button
                color="primary"
                className="w-full font-semibold shadow-md shadow-primary/20"
                startContent={isLoading ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
                isDisabled={isLoading || !username.trim()}
                onPress={handleFetchReport}
              >
                {isLoading ? t("analyzing") : t("generate")}
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-2 space-y-6">
          {!hasSearched && !isLoading && (
            <div className="flex flex-col items-center justify-center p-12 bg-default-50 rounded-xl border border-default-200 border-dashed text-default-500 h-full">
              <BarChart
                size={48}
                className="mb-4 text-default-300 opacity-50"
              />
              <p className="text-center max-w-sm">
                {t("emptyState")}
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 bg-default-50/50 rounded-xl text-primary">
              <RefreshCw size={48} className="mb-6 animate-spin opacity-50" />
              <p className="font-semibold animate-pulse">{t("scanning")}</p>
            </div>
          )}

          {hasSearched && stats && (
            <div className="space-y-6 animate-opacity">
              {/* Highlight Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card shadow="sm" className="border border-default-200">
                  <CardBody className="p-4 flex flex-col items-center justify-center text-center gap-1">
                    <Layers size={24} className="text-primary mb-1" />
                    <span className="text-2xl font-bold">
                      {stats.totalPosts}
                    </span>
                    <span className="text-xs text-default-500 uppercase tracking-wider font-semibold">
                      {t("stats.posts")}
                    </span>
                  </CardBody>
                </Card>
                <Card shadow="sm" className="border border-default-200">
                  <CardBody className="p-4 flex flex-col items-center justify-center text-center gap-1">
                    <DollarSign size={24} className="text-primary mb-1" />
                    <span className="text-2xl font-bold">
                      {parseFloat(stats.totalPayout).toFixed(0)}
                    </span>
                    <span className="text-xs text-default-500 uppercase tracking-wider font-semibold">
                      {t("stats.payouts")}
                    </span>
                  </CardBody>
                </Card>
                <Card shadow="sm" className="border border-default-200">
                  <CardBody className="p-4 flex flex-col items-center justify-center text-center gap-1">
                    <Activity size={24} className="text-primary mb-1" />
                    <span className="text-2xl font-bold">
                      {stats.totalUpvotes}
                    </span>
                    <span className="text-xs text-default-500 uppercase tracking-wider font-semibold">
                      {t("stats.upvotes")}
                    </span>
                  </CardBody>
                </Card>
                <Card shadow="sm" className="border border-default-200">
                  <CardBody className="p-4 flex flex-col items-center justify-center text-center gap-1">
                    <MessageSquare size={24} className="text-primary mb-1" />
                    <span className="text-2xl font-bold">
                      {stats.totalComments}
                    </span>
                    <span className="text-xs text-default-500 uppercase tracking-wider font-semibold">
                      {t("stats.replies")}
                    </span>
                  </CardBody>
                </Card>
              </div>

              {/* Markdown Preview */}
              <Card shadow="sm" className="border border-default-200">
                <CardHeader className="flex justify-between items-center bg-default-50 border-b border-default-200 py-3 px-4">
                  <span className="font-semibold text-foreground">
                    {t("markdown.title")}
                  </span>
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    startContent={<Copy size={16} />}
                    onPress={() => copyToClipboard(markdownReport)}
                  >
                    {t("markdown.copy")}
                  </Button>
                </CardHeader>
                <CardBody className="p-0">
                  <Textarea
                    minRows={10}
                    value={markdownReport}
                    isReadOnly
                    classNames={{
                      input: "font-mono text-sm leading-relaxed p-4",
                      inputWrapper:
                        "border-none shadow-none rounded-none bg-content1",
                    }}
                  />
                </CardBody>
              </Card>

              {/* Active Posts Table */}
              <Card shadow="sm" className="border border-default-200">
                <CardHeader className="flex justify-between items-center bg-default-50 border-b border-default-200 py-3 px-4">
                  <span className="font-semibold text-foreground">
                    {t("table.title")}
                  </span>
                </CardHeader>
                <CardBody className="p-4" style={{ minHeight: "400px" }}>
                  <DataTable
                    columns={postColumns}
                    data={tableData}
                    searchPlaceholder={t("table.search")}
                    initialLoadCount={15}
                    loadMoreCount={15}
                  />
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
