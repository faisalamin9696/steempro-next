"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import CommentCard from "./CommentCard";
import { MessageCircleMore, Send } from "lucide-react";
import useInfiniteScroll from "react-infinite-scroll-hook";
import { useSdsList } from "@/hooks/sds-client-hooks";
import EmptyList from "../EmptyList";
import { Spinner } from "@heroui/spinner";
import { Card } from "@heroui/card";
import MarkdownEditor from "../submit/MarkdownEditor";
import BeneficiariesButton from "../submit/BeneficiariesButton";
import { Constants } from "@/constants";
import PublishButton from "../submit/PublishButton";
import LoadingStatus from "../LoadingStatus";
import ClearButton from "../ui/ClearButton";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { addRepliesHandler } from "@/hooks/redux/reducers/RepliesReducer";
import PayoutTypeButton from "../post/PayoutTypeButton";
import { Select, SelectItem } from "@heroui/select";
import { Clock, TrendingUp, ThumbsUp } from "lucide-react";
import { useDeviceInfo } from "@/hooks/redux/useDeviceInfo";
import { useDraft } from "@/hooks/useDraft";
import { useSession } from "next-auth/react";

interface CommentsListProps {
  root: Post;
}

const ICON_SIZE = 22;
const ITEMS_PER_PAGE = 10;
const pageCache = new Map<string, number>();

const CommentsList = ({ root }: CommentsListProps) => {
  let { ...draftData } = useDraft(
    `comment-editor-${root.author}-${root.permlink}`,
  );
  const [draft, setDraft] = useState(draftData.draft);
  const { data: session } = useSession();
  const api = `/posts_api/getPostReplies/${root.author}/${root.permlink}/true/${
    session?.user?.name || "steem"
  }`;
  // Stable references
  const uniqueKey = useRef(btoa(api)).current;
  const [page, setPage] = useState(1);
  const pageRef = useRef(page);
  pageRef.current = page;
  const [markdown, setMarkdown] = useState(draft.body);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [payoutType, setPayoutType] = useState<Payout>(
    Constants.reward_types[1],
  );
  const [isPending, setIsPending] = useState(false);
  const { data, isLoading, error } = useSdsList<Post>(api);
  const allReplies =
    useAppSelector(
      (state) => state.repliesReducer.values[`${root.author}/${root.permlink}`],
    ) ?? data;
  const [sortOrder, setSortOrder] = useState<"newest" | "payout" | "upvotes">(
    "newest",
  );
  const { isMobile } = useDeviceInfo();

  useEffect(() => {
    const latestDraft = draftData.loadDraft();
    setDraft(latestDraft);
    loadDraft(latestDraft);
  }, []);

  function loadDraft(data: DraftData) {
    setMarkdown(data.body);
  }

  const postReplies = useMemo(() => {
    if (!allReplies) return [];
    const filtered = allReplies.filter(
      (reply) =>
        reply.parent_author === root.author &&
        reply.parent_permlink === root.permlink,
    );

    return [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case "payout":
          return b.payout - a.payout;
        case "upvotes":
          return b.upvote_count - a.upvote_count;
        case "newest":
        default:
          return b.created - a.created;
      }
    });
  }, [allReplies, root.author, root.permlink, sortOrder]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data) {
      dispatch(addRepliesHandler({ comment: root, replies: data }));
    }
  }, [dispatch, data]);

  // Single memo for all computed values
  const { visibleItems, canLoadMore } = useMemo(() => {
    if (!postReplies) return { visibleItems: [], canLoadMore: false };

    const visibleItems = postReplies.slice(0, page * ITEMS_PER_PAGE);
    const canLoadMore = visibleItems.length < postReplies.length;

    return { visibleItems, canLoadMore };
  }, [postReplies, page]);

  const loadMore = useCallback(() => {
    const newPage = pageRef.current + 1;
    setPage(newPage);
    pageCache.set(uniqueKey, newPage);
  }, [uniqueKey]);

  const [infiniteRef] = useInfiniteScroll({
    loading: isLoading,
    hasNextPage: canLoadMore,
    onLoadMore: loadMore,
    disabled: !!error || !canLoadMore,
    delayInMs: 300, // Faster response
    rootMargin: "0px 0px 100px 0px", // Closer trigger
  });

  function clearForm() {
    setMarkdown("");
    setPayoutType(Constants.reward_types[1]);
    setBeneficiaries([]);
  }

  if (error) {
    return <p>Something went wrong!</p>;
  }
  // Early return for initial load
  if (isLoading && visibleItems.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 items-center">
      <Card
        isBlurred
        className="p-3 border-1 border-default-500/30"
        shadow="none"
        fullWidth
      >
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Write a Reply</h3>

          <div className="flex flex-col mt-2 gap-4 animate-appearance-in ">
            <MarkdownEditor
              insidePreview
              value={markdown}
              rows={6}
              onChange={(body) => {
                setMarkdown(body);
                draftData.setBody(body);
              }}
              placeholder="Write your comment here... Use @ to mention users"
              body={root.body}
              disabled={isPending}
              authors={
                root
                  ? [root?.author, root?.parent_author, root?.root_author]
                  : []
              }
            />

            <div className="flex flex-wrap gap-2 justify-end">
              <div className="flex flex-row flex-wrap gap-2 grow">
                <ClearButton
                  onPress={clearForm}
                  isDisabled={isPending}
                  size={isMobile ? "sm" : "md"}
                />

                <BeneficiariesButton
                  beneficiaries={beneficiaries}
                  setBeneficiaries={setBeneficiaries}
                  color="warning"
                  radius="md"
                  variant="flat"
                  iconSize={ICON_SIZE}
                  isDisabled={isPending}
                  size={isMobile ? "sm" : "md"}
                />

                <PayoutTypeButton
                  payoutType={payoutType}
                  setPayoutType={setPayoutType}
                  color="primary"
                  radius="md"
                  variant={"flat"}
                  iconSize={ICON_SIZE}
                  isDisabled={isPending}
                  size={isMobile ? "sm" : "md"}
                />
              </div>
              <PublishButton
                title={""}
                isReply
                body={markdown}
                tags={[]}
                beneficiaries={beneficiaries}
                payoutType={payoutType}
                isDisabled={!markdown.trim() || isPending}
                buttonTitle="Reply"
                startContent={<Send size={16} />}
                comment={root}
                root={root}
                onPublished={clearForm}
                onPending={setIsPending}
                size={isMobile ? "sm" : "md"}
              />
            </div>
          </div>
        </div>
      </Card>

      {error ? (
        <p>Something went wrong!</p>
      ) : isLoading && visibleItems.length === 0 ? (
        <LoadingStatus message="Loading comments..." />
      ) : (
        <div className="p-3 w-full bg-foreground/5 dark:bg-background/50 rounded-xl">
          <div className="flex flex-row items-center flex-wrap justify-between gap-2 pb-4">
            <div className="flex flex-row items-center gap-2">
              <MessageCircleMore size={24} className="text-primary" />
              <p className="text-xl font-semibold">Comments</p>
            </div>

            <Select
              className="w-[140px]"
              selectedKeys={[sortOrder]}
              onSelectionChange={(keys) => setSortOrder([...keys][0] as any)}
              selectionMode="single"
              disallowEmptySelection
              size="sm"
            >
              <SelectItem
                key="newest"
                textValue="Newest"
                startContent={<Clock size={16} />}
              >
                Newest
              </SelectItem>
              <SelectItem
                key="payout"
                textValue="Payout"
                startContent={<TrendingUp size={16} />}
              >
                Payout
              </SelectItem>
              <SelectItem
                key="upvotes"
                textValue="Upvotes"
                startContent={<ThumbsUp size={16} />}
              >
                Upvotes
              </SelectItem>
            </Select>
          </div>

          {!postReplies || postReplies?.length === 0 ? (
            <EmptyList message="Be the first to comment!" />
          ) : (
            <div className="infinite-list p-2">
              <div className="flex flex-col gap-6">
                {visibleItems.map((item) => (
                  <div key={item.link_id}>
                    <CommentCard comment={item} root={root} />
                  </div>
                ))}
              </div>

              {canLoadMore && (
                <div className="flex items-center gap-4 py-4 justify-center">
                  <Spinner ref={infiniteRef} size="sm" />
                  <span className="text-sm text-muted">Loading more...</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentsList;
