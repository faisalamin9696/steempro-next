import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import {
  getCommentDraft,
  removeCommentDraft,
  saveCommentDraft,
} from "@/utils/draft";
import { Card } from "@heroui/card";
import React, { useEffect, useState } from "react";
import RewardSelectButton, {
  rewardTypes,
} from "../editor/components/RewardSelectButton";
import {
  extractMetadata,
  generateReplyPermlink,
  makeJsonMetadataReply,
  makeOptions,
  validateCommentBody,
} from "@/utils/editor";
import { readingTime } from "@/utils/readingTime/reading-time-estimator";
import { useSession } from "next-auth/react";
import { useLogin } from "../auth/AuthProvider";
import { toast } from "sonner";
import { addRepliesHandler } from "@/hooks/redux/reducers/RepliesReducer";
import { addCommentHandler } from "@/hooks/redux/reducers/CommentReducer";
import moment from "moment";
import { useMutation } from "@tanstack/react-query";
import { publishContent } from "@/libs/steem/condenser";
import MarkdownViewer from "../body/MarkdownViewer";
import PublishButton from "../editor/components/PublishButton";
import BeneficiaryButton from "../editor/components/BeneficiaryButton";
import { getCredentials, getSessionKey } from "@/utils/user";
import { AsyncUtils } from "@/utils/async.utils";
import ClearFormButton from "../editor/components/ClearFormButton";
import EditorInput from "../editor/EditorInput";
import { useTranslation } from "@/utils/i18n";

interface Props {
  comment: Post;
  replies: Post[];
}
function ReplyInput(props: Props) {
  const { comment, replies } = props;
  const { t } = useTranslation();
  const { authenticateUser, isAuthorized } = useLogin();
  const { data: session } = useSession();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const draft = getCommentDraft(comment.link_id);
  const dispatch = useAppDispatch();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(
    draft.beneficiaries ?? []
  );
  const [reward, setReward] = useState(rewardTypes[1]);
  const { users } = extractMetadata(comment.body) ?? [];
  const [markdown, setMarkdown] = useState(draft.markdown);
  const rpm = readingTime(markdown);
  const [isPosting, setPosting] = useState(false);

  function saveDraft() {
    saveCommentDraft(comment.link_id, markdown, beneficiaries);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      saveDraft();
    }, 800);

    return () => clearTimeout(timeout);
  }, [markdown]);

  function clearForm() {
    setMarkdown("");
    setBeneficiaries([]);
  }

  function handleClear() {
    removeCommentDraft(comment.link_id);
    clearForm();
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

  function handleOnPublished(postData: PostingContent, options: any) {
    const time = moment().unix();

    let newComment: Post = {
      ...comment,
      link_id: time,
      created: time,
      last_update: time,

      ...postData,
      json_metadata: JSON.stringify(postData.json_metadata),
      body: postData.body,
      author: loginInfo.name,
      depth: comment.depth + 1,
      payout: 0,
      upvote_count: 0,
      observer_vote: 0,
      category: comment.category,
      author_reputation: loginInfo.reputation,
      author_role: comment?.observer_role ?? "",
      author_title: comment?.observer_title ?? "",
      observer_title: comment?.observer_title ?? "",
      observer_role: comment?.observer_role ?? "",
      root_author: comment.author,
      root_permlink: comment.permlink,
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
      ...(options ?? {}),
    };

    if (newComment.max_accepted_payout) {
      newComment.max_accepted_payout = parseFloat(
        String(newComment.max_accepted_payout)
      );
    }

    // update the redux state for the post
    dispatch(
      addCommentHandler({ ...comment, children: comment?.children + 1 })
    );

    dispatch(
      addRepliesHandler({
        comment: comment,
        replies: [newComment].concat(replies),
      })
    );

    // setAllReplies((oldReplies) => [newComment].concat(oldReplies));
    handleClear();
    clearForm();
    toast.success(t("reply.sent"));
    setPosting(false);
  }

  async function handlePublish() {
    if (!markdown) {
      toast.info(t("reply.comment_cannot_be_empty"));
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
      toast.error(t('reply.invalid_credentials'));
      return;
    }

    setPosting(true);
    await AsyncUtils.sleep(0.5);

    try {
      // generating the permlink for the comment author
      let permlink = generateReplyPermlink(comment.author);

      let cbody = markdown.replace(
        /[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g,
        ""
      );
      const postData: PostingContent = {
        author: loginInfo,
        title: "",
        body: cbody,
        parent_author: comment.author,
        parent_permlink: comment.permlink,
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
    <Card isBlurred className="p-3 border-1 border-default-500/10 bg-transparent" shadow="none">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('reply.write_reply')}</h3>

        <div className="flex flex-col mt-2 gap-2 animate-appearance-in ">
          <EditorInput
            value={markdown}
            users={[
              comment.author,
              comment.parent_author,
              comment.root_author,
              ...(users ?? []),
            ]}
            onChange={setMarkdown}
            rows={6}
            isDisabled={isPosting}
          />

          <div className="flex justify-between">
            <div className="flex flex-row gap-2">
              <ClearFormButton
                isDisabled={isPosting}
                onClearPress={handleClear}
              />

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
              <PublishButton
                isDisabled={isPosting}
                onPress={handlePublish}
                isLoading={isPosting}
                tooltip=""
                buttonText={t('reply.send')}
              />
            </div>
          </div>

          <div className="space-y-1 w-full overflow-auto p-1 m-1 mt-4">
            <div className=" items-center flex justify-between">
              <p className="float-left text-sm text-default-900/70 font-semibold">
                {t('reply.preview')}
              </p>

              <p className="float-right text-sm font-light text-default-900/60">
                {rpm?.words} {t('reply.words')}, {rpm?.text}
              </p>
            </div>
            {markdown ? (
              <Card shadow="none" className="p-2 lg:shadow-none space-y-2">
                <MarkdownViewer text={markdown} />
              </Card>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ReplyInput;
