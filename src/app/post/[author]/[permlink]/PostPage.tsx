"use client";

import CommentFooter from "@/components/comment/components/CommentFooter";
import CommentHeader from "@/components/comment/components/CommentHeader";
import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import { addCommentHandler } from "@/hooks/redux/reducers/CommentReducer";
import { getSettings } from "@/utils/user";
import { Card, CardFooter } from "@heroui/card";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ViewCountTime } from "@/constants/AppConstants";
import { hasNsfwTag } from "@/utils/stateFunctions";
import TagsListCard from "@/components/TagsListCard";
import { Button } from "@heroui/button";
import { updatePostView } from "@/libs/mysql/database";
import { addRepliesHandler } from "@/hooks/redux/reducers/RepliesReducer";
import PostReplies from "@/components/reply/PostReplies";
import { useSession } from "next-auth/react";
import SLink from "@/components/ui/SLink";
import { twMerge } from "tailwind-merge";
import MarkdownViewer from "@/components/body/MarkdownViewer";
import SubmitPage from "@/app/submit/SubmitPage";
import { PiWarning } from "react-icons/pi";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";

interface Props {
  data: Post[];
}

export default function PostPage(props: Props) {
  const { data } = props;
  const post = data?.[0];
  const replies = data?.slice(1);

  const pathname = usePathname();
  const { data: session } = useSession();
  const dispatch = useAppDispatch();

  const commentInfo: Post =
    useAppSelector((state) => state.commentReducer.values)[
      `${post.author}/${post.permlink}`
    ] ?? post;

  const settings =
    useAppSelector((state) => state.settingsReducer.value) ?? getSettings();
  const [editMode, setEditMode] = useState(false);
  const toggleEditMode = () => setEditMode(!editMode);
  const isNsfw = hasNsfwTag(commentInfo) && settings?.nsfw !== "Always show";
  const isSelf = session?.user?.name === commentInfo.author;
  const isLowQuality =
    (!!commentInfo.is_muted || commentInfo.author_role === "muted") &&
    commentInfo.is_muted !== 2;

  const [showLowQuality, setShowLowQuality] = useState(isLowQuality);

  useEffect(() => {
    // scroll initial page to top
    window.scrollTo({
      top: 0,
      behavior: "instant", // instant scrolling
    });
  }, [pathname]);

  useEffect(() => {
    dispatch(
      addRepliesHandler({
        comment: commentInfo,
        replies: replies,
      })
    );
  }, []);

  useEffect(() => {
    if (post && location.pathname?.split("/")?.length === 3) {
      window.history.replaceState(
        {},
        "",
        `/${post?.category}/@${post?.author}/${post?.permlink}`
      );
    }
    dispatch(addCommentHandler(post));
  }, []);

  useEffect(() => {
    // count view after ViewCountTime mili seconds
    const timeout = setTimeout(() => {
      if (commentInfo.depth === 0 && !isSelf) updatePostView(commentInfo);
    }, ViewCountTime);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (post) {
      const docId = window.location.hash.replace("#", "");
      const section = document.getElementById(docId);
      if (docId === "comments" && section) {
        section.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [post]);

  if (editMode) {
    return (
      <SubmitPage
        params={{
          oldPost: commentInfo,
          handleUpdateCancel: toggleEditMode,
          handleUpdateSuccess: (post) => {
            dispatch(addCommentHandler(post));
            toggleEditMode();
          },
        }}
      />
    );
  }

  if (commentInfo && !commentInfo.link_id) {
    return <p>post/comment not found</p>;
  }

  return (
    <div className="flex items-start flex-row-reverse gap-4">
      <div
        className="flex-col bg-white dark:bg-white/5
    backdrop-blur-md rounded-lg p-4 w-full mb-10 "
      >
        {commentInfo ? (
          <div className="rounded-2xl w-full gap-4 flex flex-col">
            <>
              {!!commentInfo.depth && (
                <Card className="flex flex-col p-4 gap-2">
                  <p className="text-tiny">
                    You are viewing a single comment's thread from:
                  </p>
                  <p className="text-medium">RE: {commentInfo.root_title}</p>
                  <div className="flex gap-2 items-center">
                    •
                    <SLink
                      className="text-sm text-default-600 hover:text-blue-500"
                      href={`/@${commentInfo.root_author}/${commentInfo.root_permlink}`}
                    >
                      View the full context
                    </SLink>
                  </div>

                  {commentInfo.depth >= 2 && (
                    <div className="flex gap-2 items-center">
                      •
                      <SLink
                        className="text-sm text-default-600 hover:text-blue-500"
                        href={`/@${commentInfo.parent_author}/${commentInfo.parent_permlink}`}
                      >
                        View the direct parent
                      </SLink>
                    </div>
                  )}
                </Card>
              )}

              <div className="flex flex-col px-1 items-center">
                <Card
                  shadow="none"
                  className="w-full gap-4 bg-transparent overflow-visible"
                >
                  <div className={twMerge("space-y-4 flex-col lg:ml-4")}>
                    <div className="flex flex-wrap items-start gap-4 w-full justify-between">
                      <CommentHeader
                        isDetail
                        size="md"
                        hidden={isLowQuality}
                        handleEdit={toggleEditMode}
                        comment={commentInfo}
                        className={!isLowQuality ? "w-full" : "opacity-45"}
                      />

                      {isLowQuality && (
                        <div className="flex flex-col justify-end items-end gap-1 w-full sm:w-auto">
                          {isLowQuality && (
                            <div className="flex flex-row gap-2 items-center">
                              <PiWarning />
                              <p className=" font-mono text-sm ">
                                Hidden due to low rating
                              </p>
                            </div>
                          )}
                          <Button
                            onPress={() => {
                              setShowLowQuality(!showLowQuality);
                            }}
                            size="sm"
                            variant="flat"
                            color="warning"
                          >
                            {showLowQuality
                              ? `Reveal ${
                                  !!commentInfo.depth ? "Comment" : "Post"
                                }`
                              : `Hide ${
                                  !!commentInfo.depth ? "Comment" : "Post"
                                }`}
                          </Button>
                        </div>
                      )}
                    </div>
                    {
                      <h2
                        className={twMerge(
                          "text-xl font-bold",
                          isLowQuality && "opacity-45"
                        )}
                      >
                        {commentInfo.title}
                      </h2>
                    }
                  </div>

                  <div className=" flex flex-col w-full gap-4 max-w-[65ch] self-center">
                    {!showLowQuality && (
                      <div
                        className={twMerge(
                          "flex flex-col gap-4 self-center w-full",
                          isLowQuality && "opacity-45"
                        )}
                      >
                        <MarkdownViewer
                          isNsfw={isNsfw}
                          noImage={!!commentInfo.is_muted}
                          text={commentInfo.body}
                        />
                        <div className="w-full self-center">
                          <TagsListCard
                            tags={
                              commentInfo.depth === 0
                                ? JSON.parse(commentInfo.json_metadata ?? `{}`)
                                    ?.tags ?? []
                                : []
                            }
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex md:hidden flex-row w-full sticky bottom-2 justify-center">
                      <CardFooter className="w-full p-0 overflow-visible bg-white/90 border-1 border-default-900/15 rounded-full dark:bg-black/90">
                        <CommentFooter
                          comment={commentInfo}
                          isDetails
                          className={"w-full"}
                        />
                      </CardFooter>
                    </div>
                  </div>
                </Card>
              </div>
            </>

            <div className="flex flex-col items-center">
              <div className="flex flex-col w-full max-w-[65ch] self-center">
                <PostReplies comment={commentInfo} />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="hidden md:flex flex-col py-0 !text-default-600 sticky top-20">
        <CommentFooter
          stickLeft
          comment={commentInfo}
          isDetails
          handleEdit={toggleEditMode}
        />
      </div>

      <ScrollToTopButton className="bottom-14" translateClass={"translate-y-24"} />
    </div>
  );
}
