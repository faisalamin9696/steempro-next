"use client";

import MarkdownViewer from "@/components/post/body/MarkdownViewer";
import PostHeader from "@/components/post/PostHeader";
import { useParams } from "next/navigation";
import { Card } from "@heroui/card";
import PostFooter from "@/components/post/PostFooter";
import CommentsList from "@/components/comments/CommentsList";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { addCommentHandler } from "@/hooks/redux/reducers/CommentReducer";
import { Alert } from "@heroui/alert";
import { Chip } from "@heroui/chip";
import SubmitPage from "@/app/submit/page";
import NsfwOverlay from "@/components/nsfw/NsfwOverlay";
import { hasNsfwTag } from "@/utils";
import { trackPostView } from "@/utils/track-view";
import { scrollToWithOffset } from "@/utils/helper";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { CircleSlash2 } from "lucide-react";

export default function PostPage({
  initAuthor,
  initPermlink,
  data,
}: {
  initAuthor?: string;
  initPermlink?: string;
  data: Post;
}) {
  let { author, permlink } = useParams() as {
    author: string;
    permlink: string;
  };
  const dispatch = useAppDispatch();

  if (initAuthor && initPermlink) {
    author = initAuthor;
    permlink = initPermlink;
  }
  const [edit, setEdit] = useState(false);

  const commentData =
    useAppSelector(
      (state) =>
        state.commentReducer.values[`${data?.author}/${data?.permlink}`],
    ) ?? data;
  const [translatedBody, setTranslatedBody] = useState<string | null>(null);
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const [isTranslated, setIsTranslated] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>();
  const isMuted = Boolean(commentData.is_muted);
  const handleViewTrack = useCallback(async () => {
    if (
      !commentData.author ||
      !commentData.permlink ||
      commentData.link_id === 0
    )
      return;
    try {
      await trackPostView(commentData.author, commentData.permlink);
    } catch (error) {
      // ignore error
    }
  }, [commentData.author, commentData.permlink, commentData.link_id]);

  useEffect(() => {
    if (data) {
      dispatch(addCommentHandler(data));
    }
  }, [data]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (commentData.depth ?? 0 > 0) return;
      handleViewTrack();
    }, 30000); // 30 seconds to count view
    return () => clearTimeout(timer);
  }, [handleViewTrack]);

  useEffect(() => {
    const hash = window.location.hash?.slice(1);
    if (!hash || hash !== "comments") return;
    const target = document.getElementById("comments-section");
    if (!target) return;

    scrollToWithOffset(target, 80);
  }, [data]);

  const handleTranslate = async (translated: string, language: string) => {
    setTranslatedBody(translated);
    setIsTranslated(true);
    setCurrentLanguage(language);

    // Also translate the title if it exists
    if (commentData.title) {
      try {
        const { translateText } = await import("@/utils/translate");
        const titleResult = await translateText(
          commentData.title,
          language,
          "auto",
        );
        setTranslatedTitle(titleResult.translatedText as string);
      } catch (error) {
        console.error("Title translation failed:", error);
      }
    }
  };

  const handleResetTranslation = () => {
    setTranslatedBody(null);
    setTranslatedTitle(null);
    setIsTranslated(false);
    setCurrentLanguage(undefined);
  };

  if (commentData.link_id === 0) {
    return (
      <div className="flex flex-col items-center">
        <Alert
          className="max-w-lg"
          title="Post not found"
          description="The post you are looking for does not exist or has been deleted."
          color="danger"
          variant="faded"
        />
      </div>
    );
  }

  const tags =
    typeof JSON.parse(commentData.json_metadata)?.tags === "string"
      ? []
      : JSON.parse(commentData.json_metadata)?.tags || [];

  return (
    <div className="flex flex-col">
      <div className="flex flex-row-reverse w-full mx-auto gap-4 pb-4">
        <div className="min-h-[calc(100vh-96px)] w-full">
          <Card
            fullWidth
            className="card p-4 rounded-xl flex flex-col gap-4 items-center pb-20 overflow-visible"
          >
            {isMuted && (
              <Alert
                color="warning"
                variant="faded"
                title="This post is muted"
                description="This post has been muted by a community moderator."
                icon={
                  <div>
                    <CircleSlash2 size={24} />
                  </div>
                }
                className="mb-4"
              />
            )}

            {(commentData.depth ?? 0) > 0 && (
              <Card className="card flex flex-col gap-3 px-4 py-2 rounded-lg w-full">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted">
                    You are viewing a single comment’s thread from:
                  </p>

                  <span className="text-lg font-semibold">
                    <ThreadLink
                      onlyLabel
                      href={`/@${commentData.root_author}/${commentData.root_permlink}`}
                      label={`RE: ${commentData.root_title}`}
                    />
                  </span>
                </div>

                <div className="flex flex-col gap-1 text-sm">
                  <ThreadLink
                    label="View the full context"
                    href={`/@${commentData.root_author}/${commentData.root_permlink}`}
                  />

                  {(commentData.depth ?? 0) >= 2 && (
                    <ThreadLink
                      label="View the direct parent"
                      href={`/@${commentData.parent_author}/${commentData.parent_permlink}`}
                    />
                  )}
                </div>
              </Card>
            )}

            <div className="flex flex-col gap-6 items-start w-full">
              <PostHeader
                comment={commentData}
                onEditPress={() => setEdit(true)}
                isDetail
                showTranslate
                onTranslate={handleTranslate}
                onResetTranslation={handleResetTranslation}
                isTranslated={isTranslated}
              />
              {!edit && (
                <h1 className="text-3xl font-bold">
                  {translatedTitle || commentData.title}
                </h1>
              )}
            </div>

            {edit && (
              <SubmitPage
                isEdit={edit}
                root={commentData as Post}
                handleCancelEdit={() => setEdit(!edit)}
              />
            )}

            {!edit && (
              <div className=" flex flex-col w-full gap-4">
                <div className=" flex flex-col gap-4 max-w-[65ch] self-center w-full">
                  <NsfwOverlay
                    isNsfw={hasNsfwTag(commentData)}
                    placement="start"
                  >
                    <MarkdownViewer body={translatedBody || commentData.body} />
                  </NsfwOverlay>

                  <div
                    className={twMerge(
                      "flex md:hidden flex-row w-full sticky bottom-16 justify-center p-1 z-10",
                      "overflow-visible border-1 border-default-900/15 rounded-xl backdrop-blur-sm bg-background/50",
                    )}
                  >
                    <PostFooter comment={commentData} isMobile isDetail />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {tags.map((item: string) => {
                      return (
                        <Chip
                          as={Link}
                          href={`/trending/${item}`}
                          color="secondary"
                          prefetch={false}
                        >
                          #{item}
                        </Chip>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col" id="comments-section">
                  <CommentsList root={commentData as Post} />
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className=" hidden md:flex sticky top-1/4 h-max">
          <PostFooter comment={commentData} isDetail />
        </div>
      </div>
    </div>
  );
}

const ThreadLink = ({
  label,
  href,
  onlyLabel,
}: {
  label: string;
  href: string;
  onlyLabel?: boolean;
}) => (
  <div className="flex items-center gap-2 text-default-800">
    {!onlyLabel && <span>•</span>}
    <Link className="hover:text-blue-500 transition-colors" href={href}>
      {label}
    </Link>
  </div>
);
