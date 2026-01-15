import { useState, useEffect, useRef, useMemo } from "react";
import { Send, X, Navigation, ExternalLink } from "lucide-react";
import SAvatar from "../ui/SAvatar";
import MarkdownViewer from "../post/body/MarkdownViewer";
import Link from "next/link";
import { Button } from "@heroui/react";
import MarkdownEditor from "../submit/MarkdownEditor";
import { scrollToWithOffset } from "@/utils/helper";
import PublishButton from "../submit/PublishButton";
import { Constants } from "@/constants";
import { useAppSelector } from "@/hooks/redux/store";
import CommentHeader from "./CommentHeader";
import CommentFooter from "./CommentFooter";
import { useDraft } from "@/hooks/useDraft";
import { twMerge } from "tailwind-merge";

interface CommentCardProps {
  comment: Post;
  root: Post;
  depth?: number;
}

const MAX_DEPTH = 5;
const AUTO_EXPAND_DEPTH = 3;
const THREAD_COLORS = [
  "bg-primary/60",
  "bg-emerald-500/60",
  "bg-amber-500/60",
  "bg-purple-500/60",
  "bg-cyan-500/60",
  "bg-rose-500/60",
];

export default function CommentCard({
  comment,
  depth = 0,
  root,
}: CommentCardProps) {
  const commentRef = useRef<HTMLDivElement>(null);

  let { ...draftData } = useDraft(
    `comment-editor-${comment.author}-${comment.permlink}`
  );

  const commentData =
    useAppSelector(
      (state) =>
        state.commentReducer.values[`${comment.author}/${comment.permlink}`]
    ) ?? comment;

  const [draft, setDraft] = useState(draftData.draft);

  const [showReplies, setShowReplies] = useState(depth < AUTO_EXPAND_DEPTH);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [edit, setEdit] = useState(false);
  const [replyText, setReplyText] = useState(
    edit ? commentData?.body || "" : draft.body
  );
  const isLowQuality =
    Boolean(commentData.is_muted) || commentData.author_role === "muted";

  const [isPending, setIsPending] = useState(false);

  // Translation state
  const [translatedBody, setTranslatedBody] = useState<string | null>(null);
  const [isTranslated, setIsTranslated] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string | undefined>();

  const handleTranslate = (translated: string, language: string) => {
    setTranslatedBody(translated);
    setIsTranslated(true);
    setCurrentLanguage(language);
  };

  const handleResetTranslation = () => {
    setTranslatedBody(null);
    setIsTranslated(false);
    setCurrentLanguage(undefined);
  };

  const isDeep = comment.depth - root.depth > MAX_DEPTH;

  const postReplies = useAppSelector(
    (state) =>
      state.repliesReducer.values[`${root.author}/${root.permlink}`] ?? []
  );

  useEffect(() => {
    if (!edit) {
      const latestDraft = draftData.loadDraft();
      setDraft(latestDraft);
      loadDraft(latestDraft);
    }
  }, []);

  function loadDraft(data: DraftData) {
    setReplyText(data.body);
  }

  const childReplies = useMemo(() => {
    if (!postReplies.length) return [];

    return postReplies.filter(
      (c) =>
        c.parent_author === comment.author &&
        c.parent_permlink === comment.permlink
    );
  }, [postReplies, comment.author, comment.permlink]);

  useEffect(() => {
    if (depth < AUTO_EXPAND_DEPTH && commentData.children > 0) {
      setShowReplies(true);
    }
  }, [depth, commentData.children]);

  const toggleReplies = () => {
    setShowReplies((v) => !v);
  };

  const scrollToComment = () => {
    if (commentRef.current) {
      scrollToWithOffset(commentRef.current, 80);
    }
  };

  function clearForm() {
    setReplyText("");
    setShowReplyInput(false);
    if (edit) setEdit(false);
  }

  if (commentData.link_id === 0) {
    return null;
  }

  function moveCaretAtEnd(e) {
    var temp_value = e.target.value;
    e.target.value = "";
    e.target.value = temp_value;
  }

  return (
    <div ref={commentRef} className="relative flex gap-2 w-full">
      {depth > 0 && (
        <div
          className={`absolute left-0 top-0 bottom-0 w-px ${
            THREAD_COLORS[depth % THREAD_COLORS.length]
          } opacity-50 rounded-full`}
        />
      )}

      {/* Avatar Column */}
      <div className={`hidden sm:flex flex-col ${depth ? "pl-2" : ""}`}>
        <div className="flex flex-col gap-2 sticky top-18 z-10 shrink-0">
          <SAvatar size={"sm"} username={comment.author} />
          <Button
            onPress={scrollToComment}
            isIconOnly
            size="sm"
            className="opacity-0 hover:opacity-100 p-1 rounded-full bg-primary/10 mt-1"
          >
            <Navigation size={16} />
          </Button>
        </div>
      </div>

      <div
        className={`flex flex-col flex-1 min-w-0 pt-4 sm:pt-0 ${
          depth ? "pl-3 sm:pl-1" : ""
        }`}
      >
        <CommentHeader
          comment={commentData}
          showTranslate
          onTranslate={handleTranslate}
          onResetTranslation={handleResetTranslation}
          isTranslated={isTranslated}
          currentLanguage={currentLanguage}
        />

        {!edit && (
          <MarkdownViewer
            body={translatedBody || commentData.body}
            className={twMerge(
              "prose-sm! text-default-800!",
              isLowQuality && "opacity-50 text-warning!"
            )}
          />
        )}

        {!edit && (
          <CommentFooter
            //  children from repliesReducer comment
            comment={{ ...commentData, children: comment.children }}
            onReplyPress={() => setShowReplyInput(!showReplyInput)}
            onEditPress={() => {
              setShowReplyInput(true);
              setEdit(true);
              setReplyText(commentData.body);
            }}
            onTogglePress={toggleReplies}
            showReplies={showReplies}
            root={root}
          />
        )}

        {/* Reply Input */}
        {showReplyInput && (
          <div className="space-y-2 pb-8 animate-appearance-in">
            <MarkdownEditor
              insidePreview
              value={replyText}
              rows={6}
              onChange={(body) => {
                setReplyText(body);
                if (!edit) draftData.setBody(body);
              }}
              placeholder={
                edit ? `Update reply...` : `Reply to @${comment.author}...`
              }
              body={root.body + commentData.body}
              autoFocus
              onFocus={moveCaretAtEnd}
              disabled={isPending}
              authors={
                root
                  ? [
                      comment?.author,
                      comment?.parent_author,
                      comment?.root_author,
                    ]
                  : []
              }
            />
            <div className="flex items-center gap-2">
              <PublishButton
                title=""
                isReply
                body={replyText}
                beneficiaries={[]}
                payoutType={Constants.reward_types[1]}
                tags={[]}
                variant="solid"
                size="sm"
                color="primary"
                buttonTitle={edit ? "Update" : "Reply"}
                startContent={<Send size={14} />}
                isDisabled={!replyText.trim() || isPending}
                root={root}
                comment={commentData as Post}
                onPublished={clearForm}
                isEdit={edit}
                onPending={setIsPending}
              />

              <Button
                size="sm"
                variant="ghost"
                onPress={clearForm}
                className="border-1"
                isDisabled={isPending}
              >
                <X size={14} /> Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Too deep → Open thread */}
        {isDeep && commentData.children > 0 && (
          <Link
            href={`/@${comment.author}/${comment.permlink}`}
            className="text-xs flex items-center gap-1 text-primary hover:underline mt-2"
          >
            <ExternalLink size={12} /> Open full thread
          </Link>
        )}

        {/* Children */}
        {showReplies &&
          childReplies.length > 0 &&
          childReplies.map((item) => (
            <CommentCard
              key={`${item.author}-${item.permlink}`}
              comment={item}
              depth={depth + 1}
              root={root}
            />
          ))}
      </div>
    </div>
  );
}
