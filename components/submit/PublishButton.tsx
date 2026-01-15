import { Constants } from "@/constants";
import { empty_comment } from "@/constants/templates";
import { addCommentHandler } from "@/hooks/redux/reducers/CommentReducer";
import { addRepliesHandler } from "@/hooks/redux/reducers/RepliesReducer";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { sdsApi } from "@/libs/sds";
import { steemApi } from "@/libs/steem";
import {
  createPatch,
  extractMetadata,
  generatePermlink,
  generateReplyPermlink,
  makeJsonMetadata,
  makeJsonMetadataForUpdate,
  makeJsonMetadataReply,
  makeOptions,
  validateCommentBody,
} from "@/utils/editor";
import { handleSteemError } from "@/utils/steemApiError";
import { Button, ButtonProps } from "@heroui/button";
import { ZonedDateTime } from "@internationalized/date";
import moment from "moment";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAccountsContext } from "../auth/AccountsContext";
import GrantAuthorityModal from "../ui/GrantAuthorityModal";
import { AsyncUtils } from "@/utils/async.utils";
import { addSchedule } from "@/libs/supabase/schedule";

interface BaseProps extends Omit<ButtonProps, "title"> {
  buttonTitle?: string;
  scheduleTime?: ZonedDateTime | null;
  title: string;
  body: string;
  tags: string[];
  beneficiaries: Beneficiary[];
  payoutType: Payout;
  community?: Community;
  onPublished: (isSchedule?: boolean) => void;
  isEdit?: boolean;
  onPending: (isPending: boolean) => void;
  isReply?: boolean;
}

interface RootPostProps extends BaseProps {
  root: Post;
  comment: Post;
}

interface NormalPostProps extends BaseProps {
  root?: undefined;
  comment?: never;
}

type Props = RootPostProps | NormalPostProps;

function PublishButton(props: Props) {
  const {
    onPending,
    buttonTitle,
    scheduleTime,
    title = "",
    body,
    tags,
    beneficiaries,
    payoutType,
    community,
    comment,
    root,
    onPublished,
    isEdit = false,
    isReply = false,
    ...buttonProps
  } = props;

  const { data: session } = useSession();
  const dispatch = useAppDispatch();
  const [isPending, setIsPending] = useState(false);
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const { authenticateOperation } = useAccountsContext();
  const author = session?.user?.name!;

  const postReplies =
    useAppSelector(
      (state) =>
        root && state.repliesReducer.values[`${root.author}/${root.permlink}`]
    ) ?? [];

  /* ------------------ VALIDATION ------------------ */

  const validate = () => {
    if (!isReply && !title.trim()) {
      toast.info("Title can not be empty");
      return false;
    }

    if (!body.trim()) {
      toast.info("Post can not be empty");
      return false;
    }

    const bodyCheck = validateCommentBody(body, true);
    if (bodyCheck !== true) {
      toast.info(bodyCheck);
      return false;
    }

    const normalizedTags = tags.filter(
      (t) => t && t !== " " && t !== community?.account
    );

    if (!isReply && !normalizedTags.length && !community?.account) {
      toast.info("Add a tag or select community");
      return false;
    }

    return true;
  };

  /* ------------------ HELPERS ------------------ */

  const buildOptions = (permlink: string) => {
    const isDefaultPayout = payoutType === Constants.reward_types[1];
    if (isEdit || (isDefaultPayout && !beneficiaries.length)) return undefined;

    return makeOptions({
      author,
      permlink,
      payoutType,
      beneficiaries,
    });
  };

  const sanitizeBody = (text: string) =>
    text.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, "");

  const preparePostData = async () => {
    let permlink = isReply
      ? generateReplyPermlink(comment!.author)
      : generatePermlink(title);

    if (!isEdit && !isReply) {
      try {
        await sdsApi.getPost(author, permlink);
        permlink = generatePermlink(title, true);
      } catch {
        /* permlink free */
      }
    }

    const normalizedTags = tags.filter((t) => t && t !== community?.account);

    const parent_permlink = isReply
      ? comment!.permlink
      : community?.account && community.account !== author
      ? community.account
      : normalizedTags[0] || "steempro";

    const cleanBody = sanitizeBody(body);

    let postData: PostingContent = {
      author,
      title,
      body: cleanBody,
      parent_author: isReply ? comment!.author : "",
      parent_permlink,
      permlink,
      json_metadata: isReply
        ? makeJsonMetadataReply()
        : makeJsonMetadata(extractMetadata(cleanBody), normalizedTags),
    };

    if (isEdit && comment) {
      const patch = createPatch(comment.body, cleanBody.trim());
      postData.body =
        patch && patch.length < comment.body.length ? patch : cleanBody;

      postData.permlink = comment.permlink;
      postData.parent_author = comment.parent_author;
      postData.parent_permlink = comment.parent_permlink;

      postData.json_metadata = isReply
        ? JSON.parse(comment.json_metadata)
        : makeJsonMetadataForUpdate(
            JSON.parse(comment.json_metadata || "{}"),
            extractMetadata(cleanBody),
            normalizedTags
          );

      postData.title = title.trim();
    }

    const options = buildOptions(postData.permlink);

    return { postData, options, normalizedTags };
  };

  /* ------------------ PUBLISH ------------------ */

  const handlePublish = async () => {
    if (!validate()) return;
    if (scheduleTime) return handleSchedule();
    setIsPending(true);
    onPending(true);

    await handleSteemError(async () => {
      const { postData, options } = await preparePostData();
      const { key, useKeychain } = await authenticateOperation("posting");
      await steemApi.publish(postData, options, key, useKeychain);

      /* ---------- OPTIMISTIC UPDATES ---------- */

      if (!isEdit && root) {
        dispatch(
          addCommentHandler({
            ...root,
            children: (root.children ?? 0) + 1,
          })
        );
      }

      if (isReply && comment && root && !isEdit) {
        const optimisticReply: Post = {
          ...empty_comment(
            author,
            postData.permlink,
            body,
            root.observer_role,
            root.observer_title
          ),
          created: moment().unix(),
          last_update: moment().unix(),
          parent_author: comment.author,
          parent_permlink: comment.permlink,
          depth: comment.depth + 1,
          root_author: root.author,
          root_permlink: root.permlink,
          root_title: comment.root_title,
          json_metadata: JSON.stringify(postData.json_metadata),
          children: 0,
          percent_steem_dollars: payoutType.payout === 100 ? 0 : 10000,
          max_accepted_payout: payoutType.payout === 0 ? 0 : 1000000,
        };

        const ancestors = collectAncestorLinkIds(postReplies, optimisticReply);

        dispatch(
          addRepliesHandler({
            comment: root,
            replies: [
              optimisticReply,
              ...postReplies.map((r) =>
                ancestors.has(r.link_id)
                  ? { ...r, children: Math.max(0, r.children + 1) }
                  : r
              ),
            ],
          })
        );
      }

      if (isEdit && comment) {
        dispatch(
          addCommentHandler({
            ...comment,
            ...postData,
            body,
            json_metadata: JSON.stringify(postData.json_metadata),
            last_update: moment().unix(),
          })
        );
      }

      onPublished();
    }).finally(() => {
      setIsPending(false);
      onPending(false);
    });
  };

  async function handleSchedule(force = false) {
    if (!session?.user?.name) {
      toast.error("Error", { description: "Login required" });
      return;
    }
    setIsPending(true);
    onPending(true);
    await handleSteemError(async () => {
      if (!force) {
        // 1. Check Authority
        const accountData = await sdsApi.getAccountExt(author);
        const postingAuths = accountData.posting_account_auths || [];
        const isAuthorized = postingAuths.some(
          ([acc]) => acc === Constants.official_account
        );

        if (!isAuthorized) {
          setIsGrantModalOpen(true);
          return;
        }
      }

      // 2. Prepare Data
      const { postData, options, normalizedTags } = await preparePostData();

      const scheduleData: Schedule = {
        username: author,
        title: postData.title,
        body: postData.body,
        tags: normalizedTags.join(","),
        parent_permlink: postData.parent_permlink,
        options: JSON.stringify(options || {}),
        time: moment(scheduleTime!.toAbsoluteString()).format(),
        status: 0,
        permlink: postData.permlink,
      };

      await addSchedule(scheduleData);
      onPublished(true);
    }).finally(() => {
      setIsPending(false);
      onPending(false);
    });
  }

  async function handleGrantAuthority() {
    setIsPending(true);
    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("active");
      await steemApi.grantPostingAuthority(
        author,
        Constants.official_account,
        key,
        useKeychain
      );
      await AsyncUtils.sleep(3);
      toast.success("Permission granted successfully!");
      setIsGrantModalOpen(false);
      // After granting, try to schedule again
      await handleSchedule(true);
    }).finally(() => {
      setIsPending(false);
    });
  }

  return (
    <>
      <Button
        color={scheduleTime ? "secondary" : "success"}
        variant="flat"
        isLoading={isPending}
        onPress={handlePublish}
        {...buttonProps}
        startContent={isPending ? undefined : props.startContent}
      >
        {buttonTitle ?? (scheduleTime ? "Schedule" : "Publish")}
      </Button>

      <GrantAuthorityModal
        isOpen={isGrantModalOpen}
        onOpenChange={setIsGrantModalOpen}
        onConfirm={handleGrantAuthority}
        isPending={isPending}
      />
    </>
  );
}

export default PublishButton;

export function collectAncestorLinkIds(
  replies: Post[],
  comment: Post | Feed
): Set<number> {
  const map = new Map(replies.map((r) => [`${r.author}/${r.permlink}`, r]));

  const ancestors = new Set<number>();
  let current: any = comment;

  while (current.parent_author && current.parent_permlink) {
    const parent = map.get(
      `${current.parent_author}/${current.parent_permlink}`
    );
    if (!parent) break;
    ancestors.add(parent.link_id);
    current = parent;
  }

  return ancestors;
}
