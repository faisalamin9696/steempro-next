import MuteDeleteModal from "@/components/MuteDeleteModal";
import MarkdownViewer from "@/components/body/MarkdownViewer";
import CommentFooter from "@/components/comment/components/CommentFooter";
import EditorInput from "@/components/editor/EditorInput";
import ClearFormButton from "@/components/editor/components/ClearFormButton";
import PublishButton from "@/components/editor/components/PublishButton";
import { useLogin } from "@/components/auth/AuthProvider";
import {
  useAppSelector,
  useAppDispatch,
  awaitTimeout,
} from "@/libs/constants/AppFunctions";
import { addCommentHandler } from "@/libs/redux/reducers/CommentReducer";
import { addRepliesHandler } from "@/libs/redux/reducers/RepliesReducer";
import {
  deleteComment,
  mutePost,
  publishContent,
} from "@/libs/steem/condenser";
import { allowDelete } from "@/libs/utils/StateFunctions";
import { Role } from "@/libs/utils/community";
import {
  createPatch,
  extractMetadata,
  generateReplyPermlink,
  makeJsonMetadata,
  makeJsonMetadataReply,
  validateCommentBody,
} from "@/libs/utils/editor";
import { readingTime } from "@/libs/utils/readingTime/reading-time-estimator";
import { getCredentials, getSessionKey } from "@/libs/utils/user";
import { Button } from "@nextui-org/button";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";
import { Card } from "@nextui-org/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { toast } from "sonner";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { CustomEvent } from "@piwikpro/react-piwik-pro";

export default function ReplyFooter({
  comment,
  expanded,
  toggleExpand,
  className,
  isDeep,
  rootComment,
}: {
  comment: Post;
  expanded?: boolean;
  toggleExpand?: () => void;
  className?: string;
  isDeep: boolean;
  rootComment: Post | Feed;
}) {
  const postReplies =
    useAppSelector((state) => state.repliesReducer.values)[
      `${rootComment?.author}/${rootComment?.permlink}`
    ] ?? [];
  const [showReply, setShowReply] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const rpm = readingTime(markdown);
  const [isPosting, setPosting] = useState(false);
  const { authenticateUser, isAuthorized } = useLogin();
  const { data: session } = useSession();

  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const dispatch = useAppDispatch();
  const queryKey = [`post-${rootComment.author}-${rootComment.permlink}`];
  const queryClient = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);
  const [deletePopup, setDeletePopup] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    muteNote?: string;
  }>({
    isOpen: false,
    muteNote: "",
  });
  const editorDiv = useRef<any>(null);

  const isSelf = !!loginInfo.name && loginInfo.name === comment.author;
  const canMute = loginInfo.name && Role.atLeast(comment.observer_role, "mod");
  const canDelete = !comment.children && isSelf && allowDelete(comment);
  const canEdit = isSelf;
  const allowReply = Role.canComment(comment.community, comment.observer_role);
  const canReply = allowReply && comment.depth < 255;
  const { users } = JSON.parse(comment.json_metadata ?? `{}`) || [];

  const toggleReply = () => setShowReply(!showReply);
  const toggleEdit = () => setShowEdit(!showEdit);

  function handleClear() {
    secureLocalStorage.removeItem("comment_draft");
    setMarkdown("");
  }

  useEffect(() => {
    if (showEdit || showReply) {
      editorDiv?.current?.focus();
    }
    if (showEdit) {
      setMarkdown(comment.body);
    }
    if (showReply) {
      const draft = (secureLocalStorage.getItem("comment_draft") ||
        "") as string;
      setMarkdown(draft || "");
    }
  }, [showEdit, showReply]);

  function saveDraft() {
    if (showReply) secureLocalStorage.setItem("comment_draft", markdown);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      saveDraft();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [markdown]);

  const deleteMutation = useMutation({
    mutationFn: (data: { key: string; isKeychain?: boolean }) =>
      deleteComment(
        loginInfo,
        data.key,
        {
          author: comment.author,
          permlink: comment.permlink,
        },
        data.isKeychain
      ),
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(error.message);
        return;
      }
      dispatch(addCommentHandler({ ...comment, link_id: undefined }));
      dispatch(
        addCommentHandler({
          ...rootComment,
          children: rootComment.children - 1,
        })
      );

      toast.success(`Deleted`);
    },
  });

  const unmuteMutation = useMutation({
    mutationFn: (data: { key: string; isKeychain?: boolean }) =>
      mutePost(
        loginInfo,
        data.key,
        false,
        {
          community: comment.category,
          account: comment.author,
          permlink: comment.permlink,
        },
        data.isKeychain
      ),
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }
      dispatch(addCommentHandler({ ...comment, is_muted: 0 }));
      toast.success(`Unmuted`);
    },
  });

  function handleDelete() {
    authenticateUser();
    if (!isAuthorized()) return;

    const credentials = getCredentials(getSessionKey(session?.user?.name));
    if (!credentials?.key) {
      toast.error("Invalid credentials");
      return;
    }
    deleteMutation.mutate({
      key: credentials.key,
      isKeychain: credentials.keychainLogin,
    });
  }

  function handleMute() {
    authenticateUser();
    if (!isAuthorized()) return;
    const credentials = getCredentials(getSessionKey(session?.user?.name));
    if (!credentials?.key) {
      toast.error("Invalid credentials");
      return;
    }
    if (comment.is_muted !== 0) {
      unmuteMutation.mutate({
        key: credentials.key,
        isKeychain: credentials.keychainLogin,
      });
      return;
    }
    setConfirmationModal({ ...confirmationModal, isOpen: true });
  }

  function clearForm() {
    setMarkdown("");
  }

  function handleOnPublished(postData: PostingContent) {
    const time = moment().unix();

    let newComment: Post;
    // if the update then use the old data
    if (showEdit) {
      let body = markdown;

      newComment = {
        ...postData,
        ...comment,
        last_update: time,
        body: body,
        is_new: 1,
      };
    } else {
      newComment = {
        ...comment,
        link_id: time,
        created: time,
        last_update: time,
        ...postData,
        body: postData.body,
        json_metadata: JSON.stringify(postData.json_metadata),
        author: loginInfo.name,
        depth: comment.depth + 1,
        payout: 0,
        upvote_count: 0,
        observer_vote: 0,
        category: comment.category,
        author_reputation: loginInfo.reputation,
        author_role: comment.observer_role ?? "",
        author_title: comment.observer_title ?? "",
        observer_title: comment.observer_title ?? "",
        observer_role: comment.observer_role ?? "",
        root_author: rootComment?.author ?? "",
        root_permlink: rootComment?.permlink ?? "",
        root_title: comment.root_title,
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
      };
    }

    if (showEdit) {
      dispatch(addCommentHandler({ ...newComment }));
    } else {
      queryClient.setQueryData(queryKey, {
        ...rootComment,
        children: rootComment?.children + 1,
      });

      // update the redux state for the post
      dispatch(
        addCommentHandler({
          ...rootComment,
          children: rootComment?.children + 1,
        })
      );

      // update the redux state for the current comment
      dispatch(
        addCommentHandler({ ...comment, children: comment?.children + 1 })
      );

      // update the redux state for the root post replies
      dispatch(
        addRepliesHandler({
          comment: rootComment,
          replies: [newComment].concat(postReplies),
        })
      );
    }

    clearForm();
    if (showEdit) setShowEdit(false);
    if (showReply) setShowReply(false);

    setPosting(false);
    handleClear();
    toast.success(showEdit ? "Updated" : "Sent");
    CustomEvent.trackEvent("comment_submit_form", newComment.author, "Sent");
  }

  const postingMutation = useMutation({
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
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }
      const { postData } = variables;
      handleOnPublished(postData);
      setPosting(false);
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

    if (isAuthorized()) {
      setPosting(true);

      await awaitTimeout(1);
      try {
        // generating the permlink for the comment author
        let permlink = generateReplyPermlink(comment.author);

        const postData: PostingContent = {
          author: loginInfo,
          title: "",
          body: markdown,
          parent_author: comment.author,
          parent_permlink: comment.permlink,
          json_metadata: makeJsonMetadataReply(),
          permlink: permlink,
        };

        const cbody = markdown.replace(
          /[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g,
          ""
        );

        // check if post is edit
        if (showEdit) {
          const oldComment = comment;
          let newBody = cbody;

          const patch = createPatch(oldComment?.body, newBody?.trim());
          if (
            patch &&
            patch.length < Buffer.from(oldComment?.body, "utf-8").length
          ) {
            newBody = patch;
          }
          const meta = extractMetadata(markdown);
          const new_json_metadata = makeJsonMetadata(meta, []);
          postData.permlink = oldComment.permlink;
          postData.body = newBody;
          postData.json_metadata = "";
          postData.parent_author = oldComment.parent_author;
          postData.parent_permlink = oldComment.parent_permlink;
        }

        const credentials = getCredentials(getSessionKey(session?.user?.name));
        if (credentials) {
          // test case
          // handleOnPublished(postData);
          // return

          postingMutation.mutate({
            postData,
            options: null,
            key: credentials.key,
            isKeychain: credentials.keychainLogin,
          });
        } else {
          setPosting(false);
          toast.error("Invalid credentials");
        }
      } catch (error: any) {
        toast.error(error.message || JSON.stringify(error));
        setPosting(false);
      }
    }
  }

  return (
    <div className={className}>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center focus:border-0 focus:ring-0 focus:outline-none">
          <CommentFooter isReply comment={comment} className="p-0" />

          <div className="flex">
            {canReply && (
              <Button
                size="sm"
                onClick={() => {
                  toggleReply();
                }}
                variant="light"
                isDisabled={showReply || showEdit}
                className="text-tiny min-w-0 min-h-0"
              >
                Reply
              </Button>
            )}

            {canEdit && (
              <Button
                size="sm"
                onClick={() => {
                  toggleEdit();
                }}
                variant="light"
                isDisabled={showReply || showEdit}
                className="text-tiny min-w-0 min-h-0"
              >
                Edit
              </Button>
            )}

            {canDelete && (
              <div>
                <Popover
                  isOpen={deletePopup}
                  onOpenChange={(open) => setDeletePopup(open)}
                  placement={"top-start"}
                >
                  <PopoverTrigger>
                    <Button
                      size="sm"
                      variant="light"
                      isLoading={deleteMutation.isPending}
                      isDisabled={deleteMutation.isPending}
                      className="text-tiny min-w-0 min-h-0"
                    >
                      Delete
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="px-1 py-2">
                      <div className="text-small font-bold">
                        {"Confirmation"}
                      </div>
                      <div className="text-tiny flex">
                        {"Do you really want to delete?"}
                      </div>

                      <div className="text-tiny flex mt-2 space-x-2">
                        <Button
                          onClick={() => setDeletePopup(false)}
                          size="sm"
                          color="default"
                        >
                          No
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="solid"
                          onClick={() => {
                            setDeletePopup(false);
                            handleDelete();
                          }}
                        >
                          Yes
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {canMute && (
              <Button
                size="sm"
                isLoading={unmuteMutation.isPending}
                onClick={() => {
                  handleMute();
                }}
                variant="light"
                isDisabled={unmuteMutation.isPending}
                className="text-tiny min-w-0 min-h-0"
              >
                {comment.is_muted ? "Unmute" : "Mute"}
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between w-full">
          {!expanded && !!comment.children && (
            <div>
              {isDeep ? (
                <Button
                  target="_blank"
                  as={Link}
                  href={`/${comment.category}/@${comment.author}/${comment.permlink}`}
                  variant="flat"
                  className="self-start h-6 min-w-0 px-2"
                  color="warning"
                  radius="full"
                  size="sm"
                >
                  Open thread ({comment.children})
                </Button>
              ) : (
                <Button
                  variant="flat"
                  className="self-start h-6 min-w-0 px-2"
                  color="warning"
                  radius="full"
                  size="sm"
                  onClick={toggleExpand}
                >
                  Reveal {comment.children} replies
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        ref={editorDiv}
        className="focus:border-0 focus:ring-0 focus:outline-none"
        tabIndex={-1}
      >
        {showReply || showEdit ? (
          <div className="flex flex-col mt-2 gap-2 animate-appearance-in">
            <EditorInput
              users={[
                comment.author,
                comment.parent_author,
                comment.root_author,
                ...(users ?? []),
              ]}
              value={markdown}
              onChange={setMarkdown}
              onImageUpload={() => {}}
              onImageInvalid={() => {}}
              rows={6}
            />

            <div className="flex justify-between">
              <ClearFormButton onClearPress={handleClear} />

              <div className="flex gap-2 ">
                {
                  <Button
                    radius="full"
                    size="sm"
                    onClick={() => {
                      if (showReply) toggleReply();
                      else toggleEdit();
                    }}
                  >
                    Cancel
                  </Button>
                }

                <PublishButton
                  isDisabled={isPosting}
                  onClick={handlePublish}
                  isLoading={isPosting}
                  tooltip=""
                  buttonText={showEdit ? "Update" : "Send"}
                />
              </div>
            </div>

            <div className="space-y-1 w-full overflow-auto m-1 mt-4">
              <div className=" items-center flex justify-between">
                <p className="float-left text-sm text-default-900/70 font-semibold">
                  Preview
                </p>

                <p className="float-right text-sm font-light text-default-900/60">
                  {rpm?.words} words, {rpm?.text}
                </p>
              </div>
              {markdown ? (
                <Card
                  isBlurred
                  shadow="sm"
                  className={"p-2 lg:shadow-none space-y-2"}
                >
                  <MarkdownViewer text={markdown} className="!prose-sm" />
                </Card>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {confirmationModal.isOpen && (
        <MuteDeleteModal
          comment={comment}
          isOpen={confirmationModal.isOpen}
          onOpenChange={(isOpen) =>
            setConfirmationModal({ ...confirmationModal, isOpen: isOpen })
          }
          mute={true}
          muteNote={confirmationModal.muteNote}
          onNoteChange={(value) => {
            setConfirmationModal({ ...confirmationModal, muteNote: value });
          }}
        />
      )}
    </div>
  );
}
