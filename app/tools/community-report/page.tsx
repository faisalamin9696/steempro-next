"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { FileText, Play, Copy, RefreshCw, BarChart2, Users, DollarSign, Activity } from "lucide-react";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { client } from "@/libs/steem";
import { toast } from "sonner";
import moment from "moment";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { useTranslations } from "next-intl";

export default function CommunityReportPage() {
  const t = useTranslations("CommunityReport");
  const [communityId, setCommunityId] = useState("");
  const [startDate, setStartDate] = useState(
    moment().subtract(7, "days").format("YYYY-MM-DD")
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
    let authorMap: Record<string, { posts: number, comments: number }> = {};

    posts.forEach((post) => {
      // Payout could be in SBD or STEEM
      const payoutStr = typeof post.pending_payout_value === "string" 
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
      
    const topAuthors = allAuthors.slice(0, 10).map(a => [a.author, a.posts] as [string, number]);

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

  const authorColumns: ColumnDef<any>[] = useMemo(() => [
    {
      key: "index",
      header: t("markdown.index"),
      render: (_val, _row, index) => <span className="font-mono text-xs text-default-400">{index + 1}</span>,
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
  ], [t]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 pb-20 max-w-5xl">
      <PageHeader
        title={t("title")}
        description={t("description")}
        icon={FileText}
        color="secondary"
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
                label={t("communityId")}
                placeholder={t("placeholder")}
                value={communityId}
                onValueChange={setCommunityId}
                isDisabled={isLoading}
                autoCapitalize="off"
                startContent={<span className="text-default-400 text-sm">#</span>}
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
                color="secondary"
                className="w-full font-semibold shadow-md shadow-secondary/20"
                startContent={isLoading ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
                isDisabled={isLoading || !communityId.trim()}
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
              <FileText size={48} className="mb-4 text-default-300 opacity-50" />
              <p className="text-center max-w-sm">
                {t("emptyState")}
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 bg-default-50/50 rounded-xl text-secondary">
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
                    <BarChart2 size={24} className="text-secondary mb-1" />
                    <span className="text-2xl font-bold">{stats.totalPosts}</span>
                    <span className="text-xs text-default-500 uppercase tracking-wider font-semibold">{t("stats.posts")}</span>
                  </CardBody>
                </Card>
                <Card shadow="sm" className="border border-default-200">
                  <CardBody className="p-4 flex flex-col items-center justify-center text-center gap-1">
                    <Users size={24} className="text-secondary mb-1" />
                    <span className="text-2xl font-bold">{stats.totalAuthors}</span>
                    <span className="text-xs text-default-500 uppercase tracking-wider font-semibold">{t("stats.authors")}</span>
                  </CardBody>
                </Card>
                <Card shadow="sm" className="border border-default-200">
                  <CardBody className="p-4 flex flex-col items-center justify-center text-center gap-1">
                    <DollarSign size={24} className="text-secondary mb-1" />
                    <span className="text-2xl font-bold">{parseFloat(stats.totalPayout).toFixed(0)}</span>
                    <span className="text-xs text-default-500 uppercase tracking-wider font-semibold">{t("stats.payouts")}</span>
                  </CardBody>
                </Card>
                <Card shadow="sm" className="border border-default-200">
                  <CardBody className="p-4 flex flex-col items-center justify-center text-center gap-1">
                    <Activity size={24} className="text-secondary mb-1" />
                    <span className="text-2xl font-bold">{stats.totalUpvotes}</span>
                    <span className="text-xs text-default-500 uppercase tracking-wider font-semibold">{t("stats.upvotes")}</span>
                  </CardBody>
                </Card>
              </div>

              {/* Markdown Preview */}
              <Card shadow="sm" className="border border-default-200">
                <CardHeader className="flex justify-between items-center bg-default-50 border-b border-default-200 py-3 px-4">
                  <span className="font-semibold text-foreground">{t("markdown.title")}</span>
                  <Button
                    size="sm"
                    color="secondary"
                    variant="flat"
                    startContent={<Copy size={16} />}
                    onPress={() => copyToClipboard(markdownReport)}
                  >
                    {t("markdown.copy")}
                  </Button>
                </CardHeader>
                <CardBody className="p-0">
                  <Textarea
                    minRows={14}
                    value={markdownReport}
                    isReadOnly
                    classNames={{ 
                      input: "font-mono text-sm leading-relaxed p-4",
                      inputWrapper: "border-none shadow-none rounded-none bg-content1"
                    }}
                  />
                </CardBody>
              </Card>

              {/* Full Author List Table */}
              <Card shadow="sm" className="border border-default-200">
                <CardHeader className="flex justify-between items-center bg-default-50 border-b border-default-200 py-3 px-4">
                  <span className="font-semibold text-foreground">{t("table.title")}</span>
                </CardHeader>
                <CardBody className="p-4" style={{ minHeight: "400px" }}>
                  <DataTable
                    columns={authorColumns}
                    data={stats.allAuthors}
                    searchPlaceholder={t("table.search")}
                    initialLoadCount={20}
                    loadMoreCount={20}
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
