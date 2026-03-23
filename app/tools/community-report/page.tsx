"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/ui/PageHeader";
import {
  FileText,
  Play,
  Copy,
  RefreshCw,
  BarChart2,
  Users,
  DollarSign,
  Activity,
} from "lucide-react";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { client } from "@/libs/steem";
import { toast } from "sonner";
import moment from "moment";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

export default function CommunityReportPage() {
  const t = useTranslations("CommunityReport");
  const [communityId, setCommunityId] = useState("");
  const [startDate, setStartDate] = useState(
    moment().subtract(7, "days").format("YYYY-MM-DD"),
  );
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));

  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleFetchReport = async () => {
    if (!communityId.trim()) {
      toast.error(t("error.invalidCommunity"));
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
        const query: any = { tag: communityId, limit: 100 };
        if (lastAuthor && lastPermlink) {
          query.start_author = lastAuthor;
          query.start_permlink = lastPermlink;
        }

        const result = await client.database.getDiscussions("created", query);

        if (result.length === 0) break;

        const newPosts = lastAuthor ? result.slice(1) : result;
        if (newPosts.length === 0) break;

        let reachedEnd = false;

        for (const post of newPosts) {
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
      toast.success(t("success.analyzed", { count: allPosts.length }));
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
    let comments = 0;
    let authorMap: Record<string, { posts: number; comments: number }> = {};

    posts.forEach((post) => {
      // Payout could be in SBD or STEEM
      const payoutStr =
        typeof post.pending_payout_value === "string"
          ? post.pending_payout_value
          : typeof post.total_payout_value === "string"
            ? post.total_payout_value
            : "0 SBD";

      totalPayout += parseFloat(payoutStr);
      upvotes += post.active_votes?.length || 0;
      comments += post.children || 0;

      if (!authorMap[post.author]) {
        authorMap[post.author] = { posts: 0, comments: 0 };
      }
      authorMap[post.author].posts += 1;
      authorMap[post.author].comments += post.children || 0;
    });

    const authors = Object.keys(authorMap);
    const allAuthors = Object.entries(authorMap)
      .map(([author, counts]) => ({ author, ...counts }))
      .sort((a, b) => b.posts - a.posts || b.comments - a.comments);

    const topAuthors = allAuthors
      .slice(0, 10)
      .map((a) => [a.author, a.posts] as [string, number]);

    return {
      totalPosts: posts.length,
      totalAuthors: authors.length,
      totalPayout: totalPayout.toFixed(3),
      totalUpvotes: upvotes,
      totalComments: comments,
      topAuthors,
      allAuthors,
    };
  }, [posts]);

  const markdownReport = useMemo(() => {
    if (!stats) return "";

    return `
# ${t("markdown.reportTitle")}
**${t("markdown.community")}:** ${communityId}
**${t("markdown.dateRange")}:** ${moment(startDate).format("MMM DD, YYYY")} - ${moment(endDate).format("MMM DD, YYYY")}

## 📊 ${t("markdown.summary")}
| ${t("markdown.metric")} | ${t("markdown.value")} |
|--------|-------|
| 📝 **${t("markdown.totalPosts")}** | ${stats.totalPosts} |
| 👥 **${t("markdown.uniqueAuthors")}** | ${stats.totalAuthors} |
| 💰 **${t("markdown.generatedPayouts")}** | $${stats.totalPayout} |
| 👍 **${t("markdown.totalUpvotes")}** | ${stats.totalUpvotes} |
| 💬 **${t("markdown.commentsReplies")}** | ${stats.totalComments} |

## 🏆 ${t("markdown.topAuthors")}
${t("markdown.topAuthorsDesc")}
${stats.topAuthors.map(([author, count], i) => `${i + 1}. **@${author}** - ${count} ${t("table.posts")}`).join("\n")}

## 👥 ${t("markdown.fullList")}
| ${t("markdown.index")} | ${t("markdown.author")} | ${t("table.posts")} | ${t("markdown.repliesRcvd")} |
|---|--------|-------|-------------------|
${stats.allAuthors.map((a, i) => `| ${i + 1} | @${a.author} | ${a.posts} | ${a.comments} |`).join("\n")}

---
*${t("markdown.footer", { url: "https://www.steempro.com/tools" })}*
`.trim();
  }, [stats, communityId, startDate, endDate]);

  const authorColumns: ColumnDef<any>[] = useMemo(
    () => [
      {
        key: "index",
        header: t("markdown.index"),
        render: (_val, _row, index) => (
          <span className="font-mono text-xs text-muted">
            {index + 1}
          </span>
        ),
      },
      {
        key: "author",
        header: t("table.author"),
        sortable: true,
        searchable: true,
        render: (val) => <span className="font-medium">@{val}</span>,
      },
      {
        key: "posts",
        header: t("table.posts"),
        sortable: true,
        render: (val) => <div className="text-right w-full">{val}</div>,
        className: "text-right",
      },
      {
        key: "comments",
        header: t("table.replies"),
        sortable: true,
        render: (val) => <div className="text-right w-full">{val}</div>,
        className: "text-right",
      },
    ],
    [t],
  );

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={t("title")}
        description={t("description")}
        icon={FileText}
        color="success"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-4"
        >
          <Card className="border border-default-200 rounded-lg shadow-none bg-content1/20 backdrop-blur-md overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-success/20 via-success to-success/20 animate-pulse" />
            <CardHeader className="bg-default-50/20 border-b border-default-200 py-3 px-4">
              <div className="flex items-center gap-2">
                <Activity size={12} className="text-success" />
                <span className="font-black text-[10px] uppercase tracking-[0.2em] text-muted underline decoration-success/30 underline-offset-4">
                  Report Parameters
                </span>
              </div>
            </CardHeader>
            <CardBody className="p-4 space-y-5 bg-default-50/10">
              <Input
                label={
                  <span className="font-black text-[9px] uppercase tracking-widest text-muted">
                    Community ID
                  </span>
                }
                placeholder="hive-123456"
                value={communityId}
                onValueChange={setCommunityId}
                isDisabled={isLoading}
                autoCapitalize="off"
                variant="bordered"
                classNames={{
                  inputWrapper:
                    "border-default-200 shadow-none hover:border-success/50 transition-colors",
                }}
                startContent={
                  <span className="text-success font-black text-[10px]">#</span>
                }
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={
                    <span className="font-black text-[9px] uppercase tracking-widest text-muted">
                    Start Date
                  </span>
                  }
                  type="date"
                  value={startDate}
                  onValueChange={setStartDate}
                  isDisabled={isLoading}
                  variant="bordered"
                  classNames={{
                    input: "text-[10px] font-mono",
                    inputWrapper:
                      "h-11 border-default-200 shadow-none hover:border-success/50 transition-colors bg-content1",
                  }}
                />
                <Input
                  label={
                    <span className="font-black text-[9px] uppercase tracking-widest text-muted">
                    End Date
                  </span>
                  }
                  type="date"
                  value={endDate}
                  onValueChange={setEndDate}
                  isDisabled={isLoading}
                  variant="bordered"
                  classNames={{
                    input: "text-[10px] font-mono",
                    inputWrapper:
                      "h-11 border-default-200 shadow-none hover:border-success/50 transition-colors bg-content1",
                  }}
                />
              </div>

              <div className="pt-2">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    color="success"
                    className="w-full font-black uppercase tracking-[0.2em] text-[10px] h-12 shadow-lg shadow-success/20 bg-success text-white"
                    startContent={
                      isLoading ? (
                        <RefreshCw className="animate-spin" size={16} />
                      ) : (
                        <Play size={16} />
                      )
                    }
                    isDisabled={isLoading || !communityId.trim()}
                    onPress={handleFetchReport}
                  >
                    {isLoading ? "FETCHING DATA..." : "GENERATE REPORT"}
                  </Button>
                </motion.div>
              </div>
            </CardBody>
          </Card>

          {hasSearched && stats && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-success/5 rounded-lg border border-success/20 backdrop-blur-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-success flex items-center gap-2">
                  <BarChart2 size={12} /> Community Insights
                </h4>
                <div className="w-2 h-2 rounded-full bg-success animate-ping" />
              </div>
              <p className="text-[9px] font-medium text-success/70 leading-relaxed uppercase tracking-widest">
                Nodes Found: {stats.totalPosts}<br />
                Accuracy: High<br />
                Source: Hive API
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Right Column - Results */}
        <div className="lg:col-span-2 space-y-6">
          {!hasSearched && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center p-12 bg-content1/20 backdrop-blur-sm rounded-xl border border-default-200 border-dashed text-muted h-full min-h-[400px]"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-success/20 blur-3xl rounded-full animate-pulse" />
                <FileText
                  size={64}
                  className="relative text-default-300 opacity-50 drop-shadow-sm"
                />
              </div>
              <p className="text-center max-w-sm font-black text-[10px] uppercase tracking-[0.2em] opacity-60">
                {t("emptyState")}
              </p>
            </motion.div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 bg-content1/20 backdrop-blur-md rounded-xl text-success min-h-[400px] border border-default-200/50">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-success/30 blur-2xl rounded-full animate-ping" />
                <RefreshCw
                  size={56}
                  className="relative animate-spin opacity-80"
                />
              </div>
              <p className="font-black text-[11px] uppercase tracking-[0.3em] animate-pulse">
                Analysing_Community_Data...
              </p>
            </div>
          )}

          {hasSearched && stats && (
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 animate-opacity"
              >
                {/* Highlight Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    {
                      icon: BarChart2,
                      label: t("stats.posts"),
                      value: stats.totalPosts,
                    },
                    {
                      icon: Users,
                      label: t("stats.authors"),
                      value: stats.totalAuthors,
                    },
                    {
                      icon: DollarSign,
                      label: t("stats.payouts"),
                      value: parseFloat(stats.totalPayout).toFixed(0),
                      prefix: "$",
                    },
                    {
                      icon: Activity,
                      label: t("stats.upvotes"),
                      value: stats.totalUpvotes,
                    },
                  ].map((s, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="border border-default-200 rounded-lg shadow-none bg-content1/40 backdrop-blur-md hover:border-success/50 hover:bg-content1/60 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                          <s.icon size={48} />
                        </div>
                        <CardBody className="p-5 flex flex-col items-start gap-1">
                          <span className="text-2xl font-black text-success drop-shadow-sm">
                            {s.prefix}
                            {s.value}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-success/40" />
                            <span className="text-[9px] text-muted uppercase tracking-widest font-black">
                              {s.label}
                            </span>
                          </div>
                        </CardBody>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Markdown Preview */}
                <Card className="border border-default-200 rounded-lg shadow-xl shadow-success/5 bg-content1/30 backdrop-blur-xl overflow-hidden">
                  <CardHeader className="flex justify-between items-center bg-default-50/20 border-b border-default-200 py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-4 bg-success rounded-full animate-bounce" />
                      <span className="font-black text-[10px] uppercase tracking-[0.2em] text-muted">
                        Draft Report
                      </span>
                    </div>
                    <Button
                      size="sm"
                      color="success"
                      variant="flat"
                      className="font-black text-[10px] uppercase tracking-widest h-8"
                      startContent={<Copy size={14} />}
                      onPress={() => copyToClipboard(markdownReport)}
                    >
                      Export Log
                    </Button>
                  </CardHeader>
                  <CardBody className="p-0">
                    <Textarea
                      minRows={14}
                      value={markdownReport}
                      isReadOnly
                      classNames={{
                        input:
                          "font-mono text-[11px] leading-relaxed p-6 bg-content1/10",
                        inputWrapper:
                          "border-none shadow-none rounded-none bg-transparent",
                      }}
                    />
                  </CardBody>
                </Card>

                {/* Full Author List Table */}
                <Card className="border border-default-200 rounded-lg shadow-none bg-content1/20 backdrop-blur-md overflow-hidden">
                  <CardHeader className="flex justify-between items-center bg-default-50/20 border-b border-default-200 py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[10px] uppercase tracking-[0.2em] text-muted">
                        Author Leaderboard
                      </span>
                    </div>
                  </CardHeader>
                  <CardBody
                    className="p-4 bg-transparent"
                    style={{ minHeight: "400px" }}
                  >
                    <DataTable
                      columns={authorColumns}
                      data={stats.allAuthors}
                      searchPlaceholder={t("table.search")}
                      initialLoadCount={20}
                      loadMoreCount={20}
                    />
                  </CardBody>
                </Card>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
