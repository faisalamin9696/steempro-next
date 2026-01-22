"use client";

import SModal from "../ui/SModal";
import { Tabs, Tab } from "@heroui/tabs";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import {
  Search,
  User,
  FileText,
  MessageSquare,
  X,
  Clock,
  Filter,
  AtSign,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { sdsApi } from "@/libs/sds";
import SAvatar from "../ui/SAvatar";
import SUsername from "../ui/SUsername";
import Link from "next/link";
import moment from "moment";
import SInput from "../ui/SInput";
import { extractBodySummary } from "@/utils/extractContent";
import InfiniteList from "../InfiniteList";
import { normalizeUsername } from "@/utils/editor";

interface SearchModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onClose: () => void;
}

const EmptyState = ({ text, icon: Icon }: { text: string; icon: any }) => (
  <div className="flex flex-col items-center justify-center py-20 text-muted gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="p-4 rounded-full bg-default-100/50">
      <Icon size={40} className="opacity-40" />
    </div>
    <p className="text-sm font-medium max-w-[200px] text-center">{text}</p>
  </div>
);

const SearchModal = ({ isOpen, onOpenChange, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const [authorQuery, setAuthorQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("accounts");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    accounts: any[];
    posts: any[];
    comments: any[];
  }>({ accounts: [], posts: [], comments: [] });

  const handleSearch = useCallback(
    async (searchQuery: string, author: string, tab: string) => {
      if (!searchQuery.trim()) {
        setResults({ accounts: [], posts: [], comments: [] });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const trimmedQuery = searchQuery.trim();
        const trimmedAuthor = author.trim().replace("@", "");

        if (tab === "accounts") {
          const accounts =
            (await sdsApi.getAccountsByPrefix(
              normalizeUsername(trimmedQuery),
            )) || [];
          setResults((prev) => ({ ...prev, accounts }));
        } else if (tab === "posts") {
          let posts: Post[] = [];
          if (trimmedAuthor) {
            posts =
              (await sdsApi.getPostsByAuthorText(
                trimmedAuthor,
                trimmedQuery,
                null,
                250,
              )) || [];
          } else {
            posts =
              (await sdsApi.getPostsByText(trimmedQuery, null, 250)) || [];
          }
          setResults((prev) => ({ ...prev, posts }));
        } else if (tab === "comments") {
          let comments: Post[] = [];
          if (trimmedAuthor) {
            comments =
              (await sdsApi.getCommentsByAuthorText(
                trimmedAuthor,
                trimmedQuery,
                null,
                250,
              )) || [];
          } else {
            comments =
              (await sdsApi.getCommentsByText(trimmedQuery, null, 250)) || [];
          }
          setResults((prev) => ({ ...prev, comments }));
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [], // Removed [results] dependency to fix infinite loop
  );

  useEffect(() => {
    // 500ms Debounce
    const timer = setTimeout(() => {
      handleSearch(query, authorQuery, activeTab);
    }, 500);

    return () => clearTimeout(timer);
  }, [query, authorQuery, activeTab, handleSearch]);

  const renderAccount = (account: any) => (
    <Link
      key={account.name}
      href={`/@${account.name}`}
      onClick={onClose}
      className="flex items-center gap-3 p-4 rounded-2xl hover:bg-default-100 transition-all border border-transparent hover:border-default-200 group active:scale-[0.98]"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
        <SAvatar
          username={account.name}
          size={48}
          showLink={false}
          className="relative"
        />
      </div>
      <div className="flex flex-col">
        <SUsername username={account.name} className="font-bold text-base" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">
            Reputation: {Math.floor(account.reputation)}
          </span>
          <span className="h-1 w-1 bg-default-300 rounded-full" />
          <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
            Profile
          </span>
        </div>
      </div>
    </Link>
  );

  const renderPost = (post: any) => (
    <Link
      key={`${post.author}/${post.permlink}`}
      href={`/@${post.author}/${post.permlink}`}
      onClick={onClose}
      className="flex flex-col gap-3 p-4 rounded-2xl hover:bg-default-100 transition-all border border-transparent hover:border-default-200 group active:scale-[0.98]"
    >
      <div className="flex items-center gap-2">
        <SAvatar username={post.author} size={28} showLink={false} />
        <div className="flex flex-col -space-y-0.5">
          <span className="text-sm font-bold">@{post.author}</span>
          <span className="text-[10px] text-muted flex items-center gap-1 font-medium">
            <Clock size={10} />
            {moment.unix(post.created).fromNow()}
          </span>
        </div>
        <div className="ml-auto">
          <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-tight">
            Post
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <h4 className="text-base font-bold line-clamp-1 group-hover:text-primary transition-colors">
          {post.title}
        </h4>
        <p className="text-xs text-muted line-clamp-2 leading-relaxed opacity-80">
          {extractBodySummary(post.body)}
        </p>
      </div>
    </Link>
  );

  const renderComment = (comment: any) => (
    <Link
      key={`${comment.author}/${comment.permlink}`}
      href={`/@${comment.author}/${comment.permlink}`}
      onClick={onClose}
      className="flex flex-col gap-3 p-4 rounded-2xl hover:bg-default-100 transition-all border border-transparent hover:border-default-200 group active:scale-[0.98]"
    >
      <div className="flex items-center gap-2">
        <SAvatar username={comment.author} size={28} showLink={false} />
        <div className="flex flex-col -space-y-0.5">
          <span className="text-sm font-bold">@{comment.author}</span>
          <span className="text-[10px] text-muted flex items-center gap-1 font-medium">
            <Clock size={10} />
            {moment.unix(comment.created).fromNow()}
          </span>
        </div>
        <div className="ml-auto">
          <div className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-tight">
            Comment
          </div>
        </div>
      </div>
      <p className="text-sm text-muted line-clamp-3 leading-relaxed border-l-2 border-divider pl-3 italic opacity-90">
        {extractBodySummary(comment.body)}
      </p>
    </Link>
  );

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={onClose}
      size="2xl"
      placement="top"
      scrollBehavior="inside"
      className="bg-linear-to-b from-transparent to-default-50/30"
      classNames={{ body: "", header: "sm:py-0", closeButton: "sm:hidden" }}
    >
      {(onClose) => (
        <div className="flex flex-col gap-3">
          {/* Main Search Bar */}
          <div className="space-y-3">
            <div className="flex items-center gap-4 transition-all">
              <Input
                startContent={
                  <Search
                    className="text-muted group-focus-within:text-primary transition-colors"
                    size={20}
                  />
                }
                autoFocus
                value={query}
                onClear={() => setQuery("")}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search blockchain content..."
                className="flex-1 bg-transparent border-none outline-none text-xl font-semibold placeholder:text-muted/50"
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  handleSearch(query, authorQuery, activeTab)
                }
                isClearable
              />
              <div
                onClick={onClose}
                className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-default-200/50 border border-divider cursor-pointer hover:bg-default-100 transition-colors"
              >
                <span className="text-[10px] font-bold text-muted">ESC</span>
              </div>
            </div>

            {/* Advanced Filters (Author) */}
            <div className="flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-700">
              <div className="flex items-center gap-2 group flex-1 min-w-[200px]">
                <SInput
                  startContent={
                    <div className="text-muted rounded-xl group-focus-within:text-primary transition-all">
                      <AtSign size={20} />
                    </div>
                  }
                  value={authorQuery}
                  onChange={(e) => setAuthorQuery(e.target.value)}
                  placeholder="Filter by author..."
                  isDisabled={activeTab === "accounts"}
                />
                {authorQuery && (
                  <X
                    size={14}
                    className="text-muted cursor-pointer hover:text-danger"
                    onClick={() => setAuthorQuery("")}
                  />
                )}
              </div>
              <Divider orientation="vertical" className="h-4 hidden sm:block" />
              <div className="flex items-center gap-2 text-muted text-[10px] font-medium uppercase tracking-widest px-2">
                <Filter size={12} />
                Refine results
              </div>
            </div>
          </div>

          {/* Nav / Tabs */}
          <div>
            <Tabs
              aria-label="Search Categories"
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              fullWidth
              color="primary"
              classNames={{
                panel: "p-0",
              }}
            >
              <Tab
                key="accounts"
                title={
                  <div className="flex items-center space-x-2">
                    <User size={18} />
                    <span className="hidden xs:block">Accounts</span>
                    {results.accounts.length > 0 && (
                      <Chip
                        size="sm"
                        variant="faded"
                        color="default"
                        className="h-5 px-1 min-w-5 border-1"
                      >
                        {results.accounts.length}
                      </Chip>
                    )}
                  </div>
                }
              />
              <Tab
                key="posts"
                title={
                  <div className="flex items-center space-x-2">
                    <FileText size={18} />
                    <span className="hidden xs:block">Posts</span>
                    {results.posts.length > 0 && (
                      <Chip
                        size="sm"
                        variant="solid"
                        color="primary"
                        className="h-5 px-1 min-w-5 border-1"
                      >
                        {results.posts.length}
                      </Chip>
                    )}
                  </div>
                }
              />
              <Tab
                key="comments"
                title={
                  <div className="flex items-center space-x-2">
                    <MessageSquare size={18} />
                    <span className="hidden xs:block">Comments</span>
                    {results.comments.length > 0 && (
                      <Chip
                        size="sm"
                        variant="solid"
                        color="secondary"
                        className="h-5 px-1 min-w-5 border-1"
                      >
                        {results.comments.length}
                      </Chip>
                    )}
                  </div>
                }
              />
            </Tabs>
          </div>

          <Divider />

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="pb-12">
              {isLoading ? (
                <div className="h-[400px] flex flex-col items-center justify-center gap-6">
                  <div className="relative">
                    <Spinner size="lg" color="primary" />
                    <div className="absolute inset-x-0 -bottom-8 w-max left-1/2 -translate-x-1/2">
                      <p className="text-xs font-bold text-primary animate-pulse tracking-tighter">
                        DATA FETCHING...
                      </p>
                    </div>
                  </div>
                </div>
              ) : query.length > 0 ? (
                <div className="grid grid-cols-1 gap-1 animate-in fade-in slide-in-from-bottom-2 duration-500 p-1">
                  {activeTab === "accounts" &&
                    (results.accounts.length > 0 ? (
                      <InfiniteList
                        data={results.accounts}
                        renderItem={renderAccount}
                        enableClientPagination
                        clientItemsPerPage={16}
                        className="grid grid-cols-1 gap-1 animate-in fade-in slide-in-from-bottom-2 duration-500"
                      />
                    ) : (
                      <EmptyState
                        text="No accounts found with this name prefix."
                        icon={User}
                      />
                    ))}
                  {activeTab === "posts" &&
                    (results.posts.length > 0 ? (
                      <InfiniteList
                        data={results.posts}
                        renderItem={renderPost}
                        enableClientPagination
                        clientItemsPerPage={16}
                        className="grid grid-cols-1 gap-1 animate-in fade-in slide-in-from-bottom-2 duration-500"
                      />
                    ) : (
                      <EmptyState
                        text="Try searching globally or with a different author filter."
                        icon={FileText}
                      />
                    ))}
                  {activeTab === "comments" &&
                    (results.comments.length > 0 ? (
                      <InfiniteList
                        data={results.comments}
                        renderItem={renderComment}
                        enableClientPagination
                        clientItemsPerPage={16}
                        className="grid grid-cols-1 gap-1 animate-in fade-in slide-in-from-bottom-2 duration-500"
                      />
                    ) : (
                      <EmptyState
                        text="No textual matches found in recent discussions."
                        icon={MessageSquare}
                      />
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-6 text-muted">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl opacity-50" />
                    <Search
                      size={80}
                      className="relative opacity-20 transform -rotate-12"
                    />
                  </div>
                  <div className="text-center space-y-2 relative">
                    <h3 className="text-xl font-bold text-foreground">
                      Discover Steem
                    </h3>
                    <p className="text-sm max-w-[280px] opacity-60">
                      Search for profiles, deep-dive into posts or filter by
                      specific authors.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div
                      className="px-3 py-1.5 rounded-xl border border-divider text-[10px] font-bold hover:bg-default-100 cursor-pointer"
                      onClick={() => setQuery("steempro.com")}
                    >
                      try "steempro.com"
                    </div>
                    <div
                      className="px-3 py-1.5 rounded-xl border border-divider text-[10px] font-bold hover:bg-default-100 cursor-pointer"
                      onClick={() => {
                        setQuery(`"Story" AND "Pakistan"`);
                        setActiveTab("posts");
                      }}
                    >
                      try "Story" AND "Pakistan"
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </SModal>
  );
};

export default SearchModal;
