import { useState, useCallback, useRef } from "react";
import { FiSearch, FiTrendingUp, FiUser } from "react-icons/fi";
import SModal from "./ui/SModal";
import { Input } from "@heroui/input";
import { Tab, Tabs } from "@heroui/tabs";
import { Button } from "@heroui/button";
import { FeedBodyLength } from "@/constants/AppConstants";
import InfiniteScroll from "./ui/InfiniteScroll";
import { fetchSds } from "@/constants/AppFunctions";
import CommentListLayout from "./comment/layouts/CommentListLayout";
import SAvatar from "./ui/SAvatar";
import Reputation from "./Reputation";
import TimeAgoWrapper from "./wrappers/TimeAgoWrapper";
import { twMerge } from "tailwind-merge";

type SearchTypes = "posts" | "comments" | "tags" | "people";

const getSearchApi = (
  type: SearchTypes,
  query: string,
  author?: string,
  limit = 30,
  offset = 0
) => {
  query = query.trim();
  author = author?.trim();
  const searchParams = `${"any"}/${"null"}/${FeedBodyLength}/${"time"}/${"DESC"}/${limit}/${offset}`;
  switch (type) {
    case "posts":
      if (author)
        return `/content_search_api/getPostsByAuthorText/${author}/${query}/${searchParams}`;
      else return `/content_search_api/getPostsByText/${query}/${searchParams}`;
    case "comments":
      if (author)
        return `/content_search_api/getCommentsByAuthorText/${author}/${query}/${searchParams}`;
      else
        return `/content_search_api/getCommentsByText/${query}/${searchParams}`;
    case "tags":
      if (author)
        return `/content_search_api/getPostsByAuthorTagsText/${author}/${query}/${query}/${searchParams}`;
      else
        return `/content_search_api/getPostsByTagsText/${query}/${query}/${searchParams}`;
    default:
      query = query.replace("@", "");
      return `/accounts_api/getAccountsByPrefix/${query}/${"null"}/name,reputation,posting_json_metadata,created/${limit}/${offset}`;
  }
};

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const SearchModal = (props: Props) => {
  const { isOpen, onOpenChange } = props;
  const [query, setQuery] = useState("");
  const [author, setAuthor] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTypes>("posts");
  const [searchParams, setSearchParams] = useState<{
    query: string;
    author: string;
    activeTab: SearchTypes;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchTriggerRef = useRef(0);

  const handleSearch = useCallback(() => {
    if (query.trim().length === 0) return;
    setIsSearching(true);
    // Update search params which will trigger the InfiniteScroll
    setSearchParams({
      query,
      author,
      activeTab,
    });
    searchTriggerRef.current += 1; // Force InfiniteScroll to reset
    setIsSearching(false);
  }, [query, author, activeTab]);

  const getKey = useCallback(
    (pageIndex: number, previousPageData: any[] | null) => {
      if (!searchParams) return null; // Don't search until button is clicked
      if (previousPageData && previousPageData.length === 0) return null;

      return getSearchApi(
        searchParams.activeTab,
        searchParams.query,
        searchParams.author,
        30,
        pageIndex * 30
      );
    },
    [searchParams, searchTriggerRef.current] // Include trigger ref to force refresh
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modalProps={{
        scrollBehavior: "inside",
        size: "xl",
        backdrop: "blur",
        placement: "top",
      }}
      body={(onClose) => (
        <>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-primary text-primary-foreground">
                <FiSearch className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div>
                  <h2 className="text-xl font-bold text-card-foreground">
                    Search
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Discover posts, comments, tags, and people
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 justify-evenly">
              <div className="flex flex-row gap-3">
                <Input
                  className="flex-1"
                  size="md"
                  placeholder={`Search for ${activeTab}...`}
                  value={query}
                  onValueChange={setQuery}
                  onKeyDown={handleKeyDown}
                  startContent={<FiSearch />}
                  isClearable
                />

                <Button
                  variant="flat"
                  color="primary"
                  size="md"
                  onPress={handleSearch}
                  isLoading={isSearching}
                  endContent={<FiSearch size={16} />}
                >
                  Search
                </Button>
              </div>

              {activeTab !== "people" && (
                <Input
                  size="md"
                  placeholder={`Filter by author...`}
                  startContent={<FiUser />}
                  value={author}
                  onValueChange={setAuthor}
                  onKeyDown={handleKeyDown}
                  isClearable
                />
              )}
            </div>

            <Tabs
              variant="underlined"
              color="primary"
              size="md"
              selectedKey={activeTab}
              className="mt-2"
              onSelectionChange={(key) => {
                setActiveTab(key as typeof activeTab);
                // Reset search when tab changes
                setSearchParams(null);
              }}
              classNames={{
                tab: "!w-full capitalize px-0",
                tabList: "w-full capitalize px-0",
              }}
            >
              {["posts", "comments", "tags", "people"].map((tab) => (
                <Tab key={tab} value={tab} title={tab}>
                  {!searchParams ? (
                    <div className="flex flex-col text-center py-12">
                      <div className="p-4 rounded-full bg-primary/10 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <FiTrendingUp className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-semibold text-card-foreground mb-2">
                        Type and click search
                      </h3>
                      <p className="text-default-500 text-sm">
                        Click the search button to find {tab} on the blockchain
                      </p>
                    </div>
                  ) : (
                    <div>
                      <InfiniteScroll
                        getKey={getKey}
                        fetcher={fetchSds}
                        keyExtractor={(item, index) => index?.toString() || ""}
                        renderItem={(item, index) => {
                          const posting_json_metadata = JSON.parse(
                            item?.posting_json_metadata || "{}"
                          );
                          return activeTab !== "people" ? (
                            <div
                              key={index}
                              className="flex flex-col gap-2"
                              onClick={onClose}
                            >
                              <CommentListLayout
                                compact
                                comment={item}
                                isSearch
                              />
                            </div>
                          ) : (
                            <div
                              key={index}
                              className={`flex items-start h-full dark:bg-foreground/10
                                                bg-white  overflow-hidden rounded-lg shadow-lg p-2 gap-4`}
                            >
                              <SAvatar
                                onPress={onClose}
                                className="cursor-pointer"
                                size="sm"
                                username={item?.name || ""}
                              />
                              <div className="flex flex-col items-start justify-center">
                                <div className="flex items-start  gap-2">
                                  <div className=" flex-col items-start">
                                    <h4 className="text-sm font-semibold leading-none text-default-600">
                                      {posting_json_metadata?.profile?.name}
                                    </h4>
                                    <h5
                                      className={twMerge(
                                        "text-sm tracking-tight text-default-500"
                                      )}
                                    >
                                      @{item?.name}
                                    </h5>
                                  </div>
                                  <Reputation reputation={item?.reputation} />
                                </div>
                                <div className="flex text-sm gap-1 text-default-600 items-center">
                                  <p className="text-default-500 text-tiny">
                                    Joined
                                  </p>
                                  <TimeAgoWrapper
                                    className="text-tiny"
                                    created={(item?.created || 0) * 1000}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        }}
                        pageSize={30}
                      />
                    </div>
                  )}
                </Tab>
              ))}
            </Tabs>
          </div>
        </>
      )}
      footer={(onClose) => (
        <Button color="danger" variant="flat" onPress={onClose} size="sm">
          Cancel
        </Button>
      )}
    />
  );
};
