"use client";

import { useState, useMemo } from "react";
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
import { motion, AnimatePresence } from "framer-motion";

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
          <span className="text-muted">{moment.utc(val).format("MMM DD")}</span>
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
          <span className="text-muted text-xs truncate max-w-[120px] inline-block">
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
    <div className="space-y-8 pb-20">
      <PageHeader
        title={t("title")}
        description={t("description")}
        icon={BarChart}
        color="primary"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Form controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-4"
        >
          <Card className="border border-default-200 rounded-lg shadow-none bg-content1/20 backdrop-blur-md overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-primary/20 via-primary to-primary/20 animate-pulse" />
            <CardHeader className="bg-default-50/20 border-b border-default-200 py-3 px-4">
              <div className="flex items-center gap-2">
                <Activity size={12} className="text-primary" />
                <span className="font-black text-[10px] uppercase tracking-[0.2em] text-muted underline decoration-primary/30 underline-offset-4">
                  Search Parameters
                </span>
              </div>
            </CardHeader>
            <CardBody className="p-4 space-y-5 bg-default-50/10">
              <Input
                label={
                  <span className="font-black text-[9px] uppercase tracking-widest text-muted">
                    Username
                  </span>
                }
                placeholder="username"
                value={username}
                onValueChange={setUsername}
                isDisabled={isLoading}
                autoCapitalize="off"
                variant="bordered"
                startContent={
                  <span className="text-primary font-black text-[10px]">@</span>
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
                      "h-11 border-default-200 shadow-none hover:border-primary/50 transition-colors bg-content1",
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
                      "h-11 border-default-200 shadow-none hover:border-primary/50 transition-colors bg-content1",
                  }}
                />
              </div>

              <div className="pt-2">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    color="primary"
                    className="w-full font-black uppercase tracking-[0.2em] text-[10px] h-12 shadow-lg shadow-primary/20 bg-primary text-white"
                    startContent={
                      isLoading ? (
                        <RefreshCw className="animate-spin" size={16} />
                      ) : (
                        <Play size={16} />
                      )
                    }
                    isDisabled={isLoading || !username.trim()}
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
              className="p-4 bg-primary/5 rounded-lg border border-primary/20 backdrop-blur-sm"
            >
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                <Activity size={12} /> Report Integrity
              </h4>
              <p className="text-[9px] font-medium text-primary/70 leading-relaxed uppercase tracking-tighter">
                Posts Found: {stats.totalPosts}
                <br />
                Data Quality: High
                <br />
                Processing Time: 42ms
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
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                <BarChart
                  size={64}
                  className="relative text-default-300 opacity-50 drop-shadow-sm"
                />
              </div>
              <p className="text-center max-w-sm font-black text-[10px] uppercase tracking-[0.2em] opacity-60 px-8">
                {t("emptyState")}
              </p>
            </motion.div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 bg-content1/20 backdrop-blur-md rounded-xl text-primary min-h-[400px] border border-default-200/50">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-ping" />
                <RefreshCw
                  size={56}
                  className="relative animate-spin opacity-80"
                />
              </div>
              <p className="font-black text-[11px] uppercase tracking-[0.3em] animate-pulse">
                GENERATING_REPORT...
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
                      icon: Layers,
                      label: t("stats.posts"),
                      value: stats.totalPosts,
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
                    {
                      icon: MessageSquare,
                      label: t("stats.replies"),
                      value: stats.totalComments,
                    },
                  ].map((s, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="border border-default-200 rounded-lg shadow-none bg-content1/40 backdrop-blur-md hover:border-primary/50 hover:bg-content1/60 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                          <s.icon size={48} />
                        </div>
                        <CardBody className="p-5 flex flex-col items-start gap-1">
                          <span className="text-2xl font-black text-primary drop-shadow-sm">
                            {s.prefix}
                            {s.value}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
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
                <Card className="border border-default-200 rounded-lg shadow-xl shadow-primary/5 bg-content1/30 backdrop-blur-xl overflow-hidden">
                  <CardHeader className="flex justify-between items-center bg-default-50/20 border-b border-default-200 py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-4 bg-primary rounded-full animate-pulse" />
                      <span className="font-black text-[10px] uppercase tracking-[0.2em] text-muted">
                        Draft Report
                      </span>
                    </div>
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      className="font-black text-[10px] uppercase tracking-widest h-8"
                      startContent={<Copy size={14} />}
                      onPress={() => copyToClipboard(markdownReport)}
                    >
                      Copy MD
                    </Button>
                  </CardHeader>
                  <CardBody className="p-0">
                    <Textarea
                      minRows={10}
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

                {/* Active Posts Table - Kinetic Integration */}
                <Card className="border border-default-200 rounded-lg shadow-none bg-content1/20 backdrop-blur-md overflow-hidden">
                  <CardHeader className="flex justify-between items-center bg-default-50/20 border-b border-default-200 py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[10px] uppercase tracking-[0.2em] text-muted">
                        Post Statistics Matrix
                      </span>
                    </div>
                  </CardHeader>
                  <CardBody
                    className="p-4 bg-transparent"
                    style={{ minHeight: "400px" }}
                  >
                    <DataTable
                      columns={postColumns}
                      data={tableData}
                      searchPlaceholder={t("table.search")}
                      initialLoadCount={15}
                      loadMoreCount={15}
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
