"use client";

import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import { addRepliesHandler } from "@/hooks/redux/reducers/RepliesReducer";
import { getPostReplies } from "@/libs/steem/sds";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { memo, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Reply from "./Reply";
import MarkdownViewer from "@/components/body/MarkdownViewer";
import EditorInput from "@/components/editor/EditorInput";
import PublishButton from "@/components/editor/components/PublishButton";
import moment from "moment";
import { toast } from "sonner";
import { addCommentHandler } from "@/hooks/redux/reducers/CommentReducer";
import { publishContent } from "@/libs/steem/condenser";
import {
  validateCommentBody,
  generateReplyPermlink,
  makeJsonMetadataReply,
  extractMetadata,
  makeOptions,
} from "@/utils/editor";
import { getCredentials, getSessionKey } from "@/utils/user";
import { useLogin } from "@/components/auth/AuthProvider";
import { readingTime } from "@/utils/readingTime/reading-time-estimator";
import EmptyList from "@/components/EmptyList";
import { Select, SelectItem } from "@heroui/select";
import { useSession } from "next-auth/react";
import { AsyncUtils } from "@/utils/async.utils";
import {
  getCommentDraft,
  removeCommentDraft,
  saveCommentDraft,
} from "@/utils/draft";
import BeneficiaryButton from "../editor/components/BeneficiaryButton";
import { RewardTypes } from "@/constants/AppConstants";
import RewardSelectButton, {
  rewardTypes,
} from "../editor/components/RewardSelectButton";

interface Props {
  comment: Post | Feed;
  onReplyClick?: () => {};
}

const defaultLimit = 10;

export default memo(function PostReplies(props: Props) {
  const { comment } = props;

  const commentInfo: Post = (useAppSelector(
    (state) => state.commentReducer.values
  )[`${comment.author}/${comment.permlink}`] ?? comment) as Post;
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const draft = getCommentDraft(comment.link_id);

  const [limit, setLimit] = useState(defaultLimit);
  const dispatch = useAppDispatch();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(
    draft.beneficiaries ?? []
  );
  const [reward, setReward] = useState(rewardTypes[1]);

  const postReplies = (useAppSelector((state) => state.repliesReducer.values)[
    `${commentInfo.author}/${commentInfo.permlink}`
  ] ?? []) as Post[];

  const rootReplies = postReplies
    ?.slice(0, limit)
    ?.filter((item: Post) => item.depth === commentInfo.depth + 1);

  const queryKey = [`post-${commentInfo.author}-${commentInfo.permlink}`];
  const queryClient = useQueryClient();
  const mutationKey = [
    `repliesMutation-${`${commentInfo?.author}/${commentInfo?.permlink}`}`,
  ];
  const [sorting, setSorting] = useState<"created" | "payout" | "upvote_count">(
    "payout"
  );
  const { users } = extractMetadata(commentInfo.body) ?? [];

  const [isLoading, setIsLoading] = useState(false);
  const [markdown, setMarkdown] = useState(draft.markdown);
  const rpm = readingTime(markdown);

  const [showReply, setShowReply] = useState(false);
  const [isPosting, setPosting] = useState(false);
  const { authenticateUser, isAuthorized } = useLogin();
  const { data: session } = useSession();
  const editorDiv = useRef<any>(null);

  function saveDraft() {
    saveCommentDraft(comment.link_id, markdown, beneficiaries);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      saveDraft();
    }, 800);

    return () => clearTimeout(timeout);
  }, [markdown]);

  const repliesMutation = useMutation({
    mutationKey,
    mutationFn: () =>
      getPostReplies(commentInfo.author, commentInfo.permlink, loginInfo.name),
    onSuccess(data) {
      setIsLoading(false);
      // setAllReplies(
      //   data?.sort((a, b) => b[sorting as string] - a[sorting as string]) ?? []
      // );
      dispatch(
        addRepliesHandler({
          comment: commentInfo,
          replies: data?.sort(
            (a, b) => b[sorting as string] - a[sorting as string]
          ),
        })
      );
    },
  });

  // useEffect(() => {
  //   setRootReplies(
  //     allReplies
  //       ?.sort((a, b) => b[sorting as string] - a[sorting as string])
  //       ?.filter((item: Post) => item.depth === commentInfo.depth + 1)
  //       ?.slice(0, limit)
  //   );
  // }, [sorting]);

  useEffect(() => {
    if (showReply) {
      editorDiv?.current?.focus();
    }
  }, [showReply]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const docId = window.location.hash.replace("#", "");
    const section = document.getElementById(docId);
    if (docId === "comments" && section) {
      timeout = setTimeout(() => {
        handleLoadComments();
      }, 1500);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const toggleReply = () => setShowReply(!showReply);

  async function handleLoadComments() {
    setIsLoading(true);
    repliesMutation.mutate();
  }

  async function handleLoadMore() {
    setIsLoading(true);
    await AsyncUtils.sleep(1.5);
    setLimit((prev) => prev + defaultLimit);
    setIsLoading(false);
  }

  function clearForm() {
    setMarkdown("");
    setBeneficiaries([]);
  }

  function handleClear() {
    removeCommentDraft(commentInfo.link_id);
    setMarkdown("");
  }

  function handleOnPublished(postData: PostingContent, options: any) {
    const time = moment().unix();

    let newComment: Post = {
      ...commentInfo,
      link_id: time,
      created: time,
      last_update: time,

      ...postData,
      json_metadata: JSON.stringify(postData.json_metadata),
      body: postData.body,
      author: loginInfo.name,
      depth: commentInfo.depth + 1,
      payout: 0,
      upvote_count: 0,
      observer_vote: 0,
      category: commentInfo.category,
      author_reputation: loginInfo.reputation,
      author_role: commentInfo?.observer_role ?? "",
      author_title: commentInfo?.observer_title ?? "",
      observer_title: commentInfo?.observer_title ?? "",
      observer_role: commentInfo?.observer_role ?? "",
      root_author: commentInfo.author,
      root_permlink: commentInfo.permlink,
      root_title: commentInfo.root_title,
      net_rshares: 0,
      children: 0,
      observer_vote_percent: 0,
      resteem_count: 0,
      observer_resteem: 0,
      replies: [],
      votes: [],
      downvote_count: 0,
      cashout_time: moment().add(7, "days").unix(),
      is_new: 1,
      ...(options ?? {}),
    };

    if (newComment.max_accepted_payout) {
      newComment.max_accepted_payout = parseFloat(
        String(newComment.max_accepted_payout)
      );
    }

    queryClient.setQueryData(queryKey, {
      ...commentInfo,
      children: commentInfo?.children + 1,
    });

    // update the redux state for the post
    dispatch(
      addCommentHandler({ ...commentInfo, children: commentInfo?.children + 1 })
    );

    // update the redux state for the current comment
    // dispatch(addCommentHandler({ ...commentInfo, children: commentInfo?.children + 1 }));

    // update the redux state for the root post replies
    dispatch(
      addRepliesHandler({
        comment: commentInfo,
        replies: [newComment].concat(postReplies),
      })
    );

    // setAllReplies((oldReplies) => [newComment].concat(oldReplies));
    handleClear();
    clearForm();
    toggleReply();
    toast.success("Sent");
    setPosting(false);
  }

  const replyMutation = useMutation({
    mutationKey: [`publish-reply`],
    mutationFn: ({
      postData,
      options,
      key,
      isKeychain,
    }: {
      postData: PostingContent;
      options?: any;
      key: string;
      isKeychain?: boolean;
    }) => publishContent(postData, options, key, isKeychain),
    onSettled(data, error, variables, context) {
      setPosting(false);

      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }
      const { postData, options } = variables;
      handleOnPublished(postData, options);
    },
  });

  async function handlePublish() {
    if (!markdown) {
      toast.info("Comment can not be empty");
      return;
    }

    const limit_check = validateCommentBody(markdown, false);
    if (limit_check !== true) {
      toast.info(limit_check);
      return;
    }

    authenticateUser();
    if (!isAuthorized()) return;
    const credentials = getCredentials(getSessionKey(session?.user?.name));
    if (!credentials?.key) {
      toast.error("Invalid credentials");
      return;
    }

    setPosting(true);
    await AsyncUtils.sleep(0.5);

    try {
      // generating the permlink for the comment author
      let permlink = generateReplyPermlink(commentInfo.author);

      let cbody = markdown.replace(
        /[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g,
        ""
      );
      const postData: PostingContent = {
        author: loginInfo,
        title: "",
        body: cbody,
        parent_author: commentInfo.author,
        parent_permlink: commentInfo.permlink,
        json_metadata: makeJsonMetadataReply(),
        permlink: permlink,
      };

      let options = makeOptions({
        author: loginInfo.name,
        permlink,
        operationType: reward?.payout,
        beneficiaries: beneficiaries,
      });

      // test case
      // handleOnPublished(postData);
      // return;

      replyMutation.mutate({
        postData,
        options: options,
        key: credentials.key,
        isKeychain: credentials.keychainLogin,
      });
    } catch (error: any) {
      toast.error(error.message || JSON.stringify(error));
      setPosting(false);
    }
  }

  return (
    <div id="post-replies">
      <div className="flex justify-between items-center gap-2 px-2">
        <Button
          size="sm"
          variant="flat"
          color="secondary"
          radius="full"
          onPress={toggleReply}
          isDisabled={showReply}
          className="text-tiny min-h-0"
        >
          Reply
        </Button>

        <div>
          {repliesMutation.isSuccess && (
            <div className="w-36 items-center">
              <Select
                radius="full"
                variant="flat"
                color="default"
                size="sm"
                label="Sort"
                selectedKeys={[sorting]}
                labelPlacement="outside-left"
                classNames={{ base: "items-center" }}
                selectionMode="single"
                onChange={(key) => {
                  const sortBy = key.target.value as string;
                  setSorting(sortBy as any);
                  const sorted = [...postReplies]?.sort(
                    (a, b) => b[sortBy] - a[sortBy]
                  );

                  // reset the limit for new sorted replies
                  setLimit(defaultLimit);

                  dispatch(
                    addRepliesHandler({
                      comment: commentInfo,
                      replies: sorted,
                    })
                  );

                  // setRootReplies((prevData) =>
                  //   prevData?.sort((a, b) => b[sortBy] - a[sortBy])
                  // );
                  // repliesMutation.mutate();
                }}
              >
                <SelectItem key={"created"}>Age</SelectItem>

                <SelectItem key={"payout"}>Trending</SelectItem>

                {/* <SelectItem key={"upvote_count"}>
                  Votes
                </SelectItem> */}
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className=" mt-4 flex flex-col py-4 gap-4">
        {repliesMutation.isSuccess ? null : !commentInfo.children ? (
          <EmptyList />
        ) : (
          <div className="flex flex-row gap-2 items-center justify-center">
            <Button
              color="default"
              variant="flat"
              isDisabled={repliesMutation.isPending}
              className="self-center"
              onPress={handleLoadComments}
              isLoading={isLoading || repliesMutation.isPending}
            >
              Load comments
            </Button>
          </div>
        )}

        <div
          ref={editorDiv}
          tabIndex={-1}
          className="focus:border-0 focus:ring-0 focus:outline-none"
        >
          {showReply && (
            <div className="flex flex-col mt-2 gap-2 animate-appearance-in ">
              <EditorInput
                value={markdown}
                users={[
                  commentInfo.author,
                  commentInfo.parent_author,
                  commentInfo.root_author,
                  ...(users ?? []),
                ]}
                onChange={setMarkdown}
                rows={6}
                isDisabled={isPosting}
              />

              <div className="flex justify-between">
                <div className="flex flex-row gap-2">
                  {/* <ClearFormButton
                    isDisabled={isPosting}
                    onClearPress={handleClear}
                  /> */}
                  <BeneficiaryButton
                    isDisabled={isPosting}
                    onSelectBeneficiary={(bene) => {
                      setBeneficiaries([
                        ...beneficiaries,
                        { ...bene, weight: bene.weight },
                      ]);
                    }}
                    onRemove={(bene) => {
                      setBeneficiaries(
                        beneficiaries?.filter(
                          (item) => item.account !== bene.account
                        )
                      );
                    }}
                    beneficiaries={beneficiaries}
                    favourites={[{ account: comment.author, weight: 500 }]}
                  />

                  <RewardSelectButton
                    isDisabled={isPosting}
                    selectedValue={reward}
                    onSelectReward={setReward}
                  />
                </div>
                <div className="flex gap-2 ">
                  {
                    <Button
                      radius="full"
                      size="sm"
                      isDisabled={isPosting}
                      onPress={() => {
                        toggleReply();
                      }}
                    >
                      Cancel
                    </Button>
                  }

                  <PublishButton
                    isDisabled={isPosting}
                    onPress={handlePublish}
                    isLoading={isPosting}
                    tooltip=""
                    buttonText={"Send"}
                  />
                </div>
              </div>

              <div className="space-y-1 w-full overflow-auto p-1 m-1 mt-4">
                <div className=" items-center flex justify-between">
                  <p className="float-left text-sm text-default-900/70 font-semibold">
                    Preview
                  </p>

                  <p className="float-right text-sm font-light text-default-900/60">
                    {rpm?.words} words, {rpm?.text}
                  </p>
                </div>
                {markdown ? (
                  <Card shadow="none" className="p-2 lg:shadow-none space-y-2">
                    <MarkdownViewer text={markdown} />
                  </Card>
                ) : null}
              </div>
            </div>
          )}
        </div>

        <InfiniteScroll
          dataLength={limit}
          next={handleLoadMore}
          hasMore={(repliesMutation?.data?.length ?? 0) > limit}
          loader={
            <div className="flex justify-center items-center">
              <Button
                color="default"
                variant="flat"
                className="self-center"
                onPress={handleLoadMore}
                isLoading
                isDisabled
              >
                Loading...
              </Button>
            </div>
          }
          endMessage={repliesMutation.isSuccess && <EmptyList />}
        >
          <div className="flex flex-col ">
            {rootReplies?.splice(0, limit)?.map((reply: Post, index) => {
              return !reply.link_id ? null : (
                <div key={index ?? reply.link_id}>
                  <Reply comment={reply} rootComment={commentInfo} />
                </div>
              );
            })}
          </div>
        </InfiniteScroll>
      </div>
    </div>
  );
});
