"use client";

import MarkdownViewer from "@/components/body/MarkdownViewer";
import CommentFooter from "@/components/comment/components/CommentFooter";
import CommentHeader from "@/components/comment/components/CommentHeader";
import { useAppDispatch, useAppSelector } from "@/libs/constants/AppFunctions";
import { addCommentHandler } from "@/libs/redux/reducers/CommentReducer";
import { getSettings } from "@/libs/utils/user";
import { Card, CardFooter } from "@heroui/card";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import usePathnameClient from "@/libs/hooks/usePathnameClient";
import SubmitPage from "@/app/submit/(site)/SubmitPage";
import { ViewCountTime } from "@/libs/constants/AppConstants";
import { hasNsfwTag } from "@/libs/utils/stateFunctions";
import TagsListCard from "@/components/TagsListCard";
import { Button } from "@heroui/button";
import { updatePostView } from "@/libs/mysql/database";
import { addRepliesHandler } from "@/libs/redux/reducers/RepliesReducer";
import PostReplies from "@/components/reply/PostReplies";
import { useSession } from "next-auth/react";
import SLink from "@/components/SLink";
import { twMerge } from "tailwind-merge";
import MarkdownViewer2 from "@/components/body/MarkdownViewer";
// const DynamicPostReplies = dynamic(
//   () => import("../../../components/reply/PostReplies")
// );

interface Props {
  data: Post;
}

export default function PostPage(props: Props) {
  const { data } = props;
  const pathname = usePathname();
  const { data: session } = useSession();
  const { category } = usePathnameClient();
  const dispatch = useAppDispatch();
  const commentInfo: Post =
    useAppSelector((state) => state.commentReducer.values)[
      `${data.author}/${data.permlink}`
    ] ?? data;
    
  const settings =
    useAppSelector((state) => state.settingsReducer.value) ?? getSettings();
  const [editMode, setEditMode] = useState(false);
  const toggleEditMode = () => setEditMode(!editMode);
  const isNsfw = hasNsfwTag(commentInfo) && settings?.nsfw !== "Always show";
  const isSelf = session?.user?.name === commentInfo.author;

  useEffect(() => {
    // clear the replies store
    dispatch(addRepliesHandler({ comment: commentInfo, replies: [] }));
  }, [pathname]);

  useEffect(() => {
    if (!category && data) {
      window.history.replaceState(
        {},
        "",
        `/${data?.category}/@${data?.author}/${data?.permlink}`
      );
    }
    dispatch(addCommentHandler(data));
  }, []);

  useEffect(() => {
    // count view after ViewCountTime mili seconds
    const timeout = setTimeout(() => {
      if (commentInfo.depth === 0 && !isSelf) updatePostView(commentInfo);
    }, ViewCountTime);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (data) {
      const docId = window.location.hash.replace("#", "");
      const section = document.getElementById(docId);
      if (docId === "comments" && section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [data]);

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
    <div
      className="flex-col bg-white dark:bg-white/5
    backdrop-blur-md rounded-lg p-4 w-full mb-10 "
    >
      {commentInfo ? (
        <div className="rounded-2xl w-full gap-4 flex flex-col">
          {!!commentInfo.is_muted && commentInfo.is_muted !== 2 ? (
            <div className=" flex items-center gap justify-between mt-2">
              <p>The post was hidden due to low rating</p>

              <Button
                onPress={() => {
                  // temporary set the is_muted status to 2
                  dispatch(addCommentHandler({ ...commentInfo, is_muted: 2 }));
                }}
                size="sm"
                variant="flat"
                color="warning"
              >
                Show
              </Button>
            </div>
          ) : (
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
                  <div className="space-y-4 flex-col lg:ml-4">
                    <>
                      <CommentHeader
                        isDetail
                        size="md"
                        handleEdit={toggleEditMode}
                        comment={commentInfo}
                        className="w-full"
                      />
                    </>
                    <h2 className="text-xl font-bold text-black dark:text-white">
                      {commentInfo.title}
                    </h2>
                  </div>

                  <div className=" flex flex-col w-full gap-4 max-w-[65ch] self-center">
                    <div
                      className={twMerge("flex flex-col items-center lg:ml-4")}
                    >
                      <MarkdownViewer2
                        isNsfw={isNsfw}
                        noImage={!!commentInfo.is_muted}
                        text={commentInfo.body}
                      />
                    </div>

                    <div className="w-full  self-center">
                      <TagsListCard
                        tags={
                          commentInfo.depth === 0
                            ? JSON.parse(commentInfo.json_metadata ?? `{}`)
                                ?.tags ?? []
                            : []
                        }
                      />
                    </div>

                    <div className="flex flex-row w-full sticky bottom-2 justify-center">
                      <CardFooter className="w-full p-1 overflow-visible bg-white/90 rounded-full dark:bg-black/90">
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
          )}

          <div id="comments" className="flex flex-col items-center">
            <div className="flex flex-col w-full max-w-[65ch] self-center">
              <PostReplies comment={commentInfo} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
