"use client";

import { Button, ButtonProps } from "@heroui/button";
import { useSession } from "next-auth/react";
import { OverlayPlacement } from "@heroui/aria-utils";
import { Role } from "@/utils/community";
import { useState } from "react";
import { handleSteemError } from "@/utils/steemApiError";
import { steemApi } from "@/libs/steem";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { addCommentHandler } from "@/hooks/redux/reducers/CommentReducer";
import { Constants } from "@/constants";
import { addRepliesHandler } from "@/hooks/redux/reducers/RepliesReducer";
import { collectAncestorLinkIds } from "../submit/PublishButton";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@heroui/dropdown";
import {
  Award,
  CircleSlash,
  CircleSlash2,
  Copy,
  Ellipsis,
  PencilLine,
  Pin,
  PinOff,
  Share,
  Trash,
  History,
} from "lucide-react";
import ShareModal from "../ui/ShareModal";
import { useAccountsContext } from "../auth/AccountsContext";
import MuteModal from "../community/modals/MuteModal";
import RoleTitleModal from "../community/modals/RoleTitleModal";
import EditHistoryModal from "./EditHistoryModal";
import BoostModal from "./BoostModal";
import { Rocket } from "lucide-react";

const ICON_SIZE = 18;

interface CommentHeaderOptionProps extends ButtonProps {
  comment: Feed | Post;
  iconSize?: number;
  placement?: OverlayPlacement;
  onEditPress?: () => void;
  root?: Post;
  isDetail?: boolean;
}

const PostOptionButton: React.FC<CommentHeaderOptionProps> = ({
  comment,
  iconSize = 20,
  placement,
  onEditPress,
  root,
  isDetail,
  ...buttonProps
}) => {
  const { data: session } = useSession();
  const isMe = comment.author === session?.user?.name;
  const dispatch = useAppDispatch();
  const canDelete =
    isDetail &&
    !comment.upvote_count &&
    !comment.downvote_count &&
    comment.cashout_time !== 0 &&
    !comment.children &&
    isMe;
  const canEdit = isMe && isDetail;
  const canMute = isDetail && Role.atLeast(comment.observer_role, "mod");
  const canSetRole = isDetail && Role.atLeast(comment.observer_role, "mod");
  const [isPending, setIsPending] = useState(false);
  const shouldMute = !comment.is_muted;
  const shouldPin = !comment.is_pinned;

  const postReplies = useAppSelector(
    (state) => state.repliesReducer.values[`${root?.author}/${root?.permlink}`],
  );
  const { authenticateOperation } = useAccountsContext();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMuteModalOpen, setIsMuteModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBoostOpen, setIsBoostOpen] = useState(false);
  const shareUrl = `${Constants.site_url}/@${comment.author}/${comment.permlink}`;
  const isModerator = Constants.team.find(
    (item) => item.name === session?.user?.name,
  );

  async function handleMute(note: string = "mute") {
    setIsPending(true);
    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("posting");
      await steemApi.mutePost(
        session?.user?.name!,
        comment.category,
        comment.author,
        comment.permlink,
        note,
        shouldMute,
        key,
        useKeychain,
      );
      toast.success(`${shouldMute ? "Muted" : "Unmuted"} successfully!`);

      dispatch(
        addCommentHandler({
          ...comment,
          is_muted: +shouldMute,
        }),
      );
      setIsMuteModalOpen(false);
    }).finally(() => {
      setIsPending(false);
    });
  }

  async function handleUpdateRoleTitle(role: string, title: string) {
    setIsPending(true);
    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("posting");

      // Update Role, Title if both changed simultaneously
      if (role !== comment.author_role && title !== comment.author_title) {
        await steemApi.setUserRoleTitle(
          session?.user?.name!,
          comment.category,
          comment.author,
          role,
          title,
          key,
          useKeychain,
        );
      } else {
        // Update Role if changed
        if (role !== comment.author_role) {
          await steemApi.setRole(
            session?.user?.name!,
            comment.category,
            comment.author,
            role,
            key,
            useKeychain,
          );
        }

        // Update Title if changed
        if (title !== comment.author_title) {
          await steemApi.setUserTitle(
            session?.user?.name!,
            comment.category,
            comment.author,
            title,
            key,
            useKeychain,
          );
        }
      }
      toast.success("Updated successfully!");

      dispatch(
        addCommentHandler({
          ...comment,
          author_role: role as RoleTypes,
          author_title: title,
        }),
      );
      setIsRoleModalOpen(false);
    }).finally(() => {
      setIsPending(false);
    });
  }

  async function handleDelete() {
    setIsPending(true);
    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("posting");
      await steemApi.deleteComment(
        session?.user?.name!,
        comment.author,
        comment.permlink,
        key,
        useKeychain,
      );

      if (root) {
        const ancestors = collectAncestorLinkIds(postReplies ?? [], comment);

        const updatedReplies = postReplies
          ?.filter((item) => item.link_id !== comment.link_id)
          .map((item) =>
            ancestors.has(item.link_id)
              ? { ...item, children: Math.max(0, item.children - 1) }
              : item,
          );

        dispatch(
          addRepliesHandler({
            comment: root,
            replies: updatedReplies,
          }),
        );
      }

      dispatch(
        addCommentHandler({
          ...comment,
          link_id: 0,
        }),
      );
      toast.success("Deleted", {
        description:
          (comment.depth === 0 ? "Post" : "Comment") + " deleted successfully",
      });
      setIsPending(false);
    }).finally(() => {
      setIsPending(false);
    });
  }

  async function handlePin() {
    setIsPending(true);
    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("posting");
      await steemApi.pinPost(
        session?.user?.name!,
        comment.category,
        comment.author,
        comment.permlink,
        shouldPin,
        key,
        useKeychain,
      );
      toast.success(`${shouldPin ? "Pinned" : "Unpinned"} successfully!`);

      dispatch(
        addCommentHandler({
          ...comment,
          is_pinned: +shouldPin,
        }),
      );
      setIsMuteModalOpen(false);
    }).finally(() => {
      setIsPending(false);
    });
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard");
  };

  const handleShare = () => {
    setIsShareOpen(!isShareOpen);
  };

  const menuItems = [
    ...(isMe
      ? [
          canEdit && (
            <DropdownItem
              onPress={onEditPress}
              key="edit"
              startContent={<PencilLine size={ICON_SIZE} />}
            >
              Edit
            </DropdownItem>
          ),

          canDelete && (
            <DropdownItem
              onPress={handleDelete}
              key="delete"
              className="text-danger"
              color="danger"
              startContent={<Trash size={ICON_SIZE} />}
            >
              Delete
            </DropdownItem>
          ),
        ]
      : []),

    isDetail && (
      <DropdownItem
        key="history"
        onPress={() => setIsHistoryOpen(true)}
        startContent={<History size={ICON_SIZE} />}
      >
        Edit History
      </DropdownItem>
    ),
    <DropdownItem
      key="copy"
      onPress={handleCopy}
      startContent={<Copy size={ICON_SIZE} />}
    >
      Copy link
    </DropdownItem>,
    <DropdownItem
      key="share"
      onPress={handleShare}
      startContent={<Share size={ICON_SIZE} />}
    >
      Share
    </DropdownItem>,
    canMute && (
      <DropdownItem
        onPress={() => {
          setIsMuteModalOpen(true);
        }}
        key="mute"
        className="text-warning"
        color="warning"
        startContent={
          !isPending &&
          (shouldMute ? (
            <CircleSlash2 size={ICON_SIZE} />
          ) : (
            <CircleSlash size={ICON_SIZE} />
          ))
        }
      >
        {shouldMute ? "Mute" : "Unmute"}
      </DropdownItem>
    ),
    canMute && comment.depth === 0 && (
      <DropdownItem
        onPress={() => {
          handlePin();
        }}
        key="pin"
        className="text-secondary"
        color="secondary"
        startContent={
          !isPending &&
          (shouldPin ? <Pin size={ICON_SIZE} /> : <PinOff size={ICON_SIZE} />)
        }
      >
        {shouldPin ? "Pin" : "Unpin"}
      </DropdownItem>
    ),
    canSetRole && (
      <DropdownItem
        onPress={() => setIsRoleModalOpen(true)}
        key="role"
        className="text-primary"
        color="primary"
        startContent={<Award size={ICON_SIZE} />}
      >
        Update Role/Title
      </DropdownItem>
    ),

    (isMe || isModerator) && (comment?.depth ?? 0) === 0 && (
      <DropdownSection title="Promote" className="mt-2">
        <DropdownItem
          onPress={() => setIsBoostOpen(true)}
          key="boost"
          className="text-success"
          color="success"
          description="Boost your post to reach more users"
          startContent={<Rocket size={ICON_SIZE} />}
        >
          Boost Post
        </DropdownItem>
      </DropdownSection>
    ),
  ]
    .flat()
    .filter(Boolean) as React.JSX.Element[];

  return (
    <>
      <Dropdown placement={placement} shouldBlockScroll={false}>
        <DropdownTrigger>
          <Button
            aria-label="Post Options"
            variant="light"
            size="sm"
            isLoading={isPending}
            {...buttonProps}
          >
            <Ellipsis size={iconSize} className="text-muted" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Comment Actions" className="text-xs">
          {menuItems}
        </DropdownMenu>
      </Dropdown>

      <ShareModal
        isOpen={isShareOpen}
        onOpenChange={setIsShareOpen}
        url={shareUrl}
        title={comment.title || comment.root_title}
      />

      {isMuteModalOpen && (
        <MuteModal
          isOpen={isMuteModalOpen}
          onOpenChange={setIsMuteModalOpen}
          onMute={handleMute}
          isPending={isPending}
          isMuted={Boolean(comment.is_muted)}
        />
      )}

      {isRoleModalOpen && (
        <RoleTitleModal
          isOpen={isRoleModalOpen}
          onOpenChange={setIsRoleModalOpen}
          onUpdate={handleUpdateRoleTitle}
          currentRole={comment.author_role}
          currentTitle={comment.author_title}
          observerRole={comment.observer_role}
          username={comment.author}
          isPending={isPending}
        />
      )}
      {isHistoryOpen && (
        <EditHistoryModal
          isOpen={isHistoryOpen}
          onOpenChange={setIsHistoryOpen}
          author={comment.author}
          permlink={comment.permlink}
        />
      )}
      {isBoostOpen && (
        <BoostModal
          isOpen={isBoostOpen}
          onOpenChange={setIsBoostOpen}
          post={comment}
        />
      )}
    </>
  );
};

export default PostOptionButton;
