import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { FaEllipsis, FaRegCopy } from "react-icons/fa6";
import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import { getCredentials, getSessionKey } from "@/utils/user";
import { Key, useState } from "react";
import { MdDelete, MdDoNotDisturb } from "react-icons/md";
import { GrAnnounce } from "react-icons/gr";
import { Role } from "@/utils/community";
import { allowDelete } from "@/utils/stateFunctions";
import { RiEdit2Fill } from "react-icons/ri";
import { LuHistory } from "react-icons/lu";
import { toast } from "sonner";
import EditRoleModal from "@/components/EditRoleModal";
import { FaUserEdit } from "react-icons/fa";
import MuteDeleteModal from "@/components/MuteDeleteModal";
import { useMutation } from "@tanstack/react-query";
import { mutePost, pinPost } from "@/libs/steem/condenser";
import { addCommentHandler } from "@/hooks/redux/reducers/CommentReducer";
import { useLogin } from "@/components/auth/AuthProvider";
import { BsPinAngleFill } from "react-icons/bs";
import { useSession } from "next-auth/react";
import { AppStrings } from "@/constants/AppStrings";
import CommentEditHistory from "@/components/CommentHistoryViewer";
import { TooltipPlacement } from "@heroui/tooltip";

interface Props {
  comment: Post | Feed;
  handleEdit?: () => void;
  iconSize?: number;
  placement?: TooltipPlacement;
}
function CommentHeaderMenu(props: Props) {
  const { comment, handleEdit, iconSize = 18, placement = "top" } = props;
  const { data: session } = useSession();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const dispatch = useAppDispatch();
  const username = session?.user?.name ?? loginInfo.name;
  const isSelf = session?.user?.name === comment.author;
  const canMute = username && Role.atLeast(comment.observer_role, "mod");
  const canDelete = !comment.children && isSelf && allowDelete(comment);
  const canEdit = isSelf;
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const { authenticateUser, isAuthorized } = useLogin();
  const [showHistory, setShowHistory] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    mute?: boolean;
    muteNote?: string;
  }>({
    isOpen: false,
    mute: false,
    muteNote: "",
  });

  const menuItems = [
    { show: canEdit, key: "edit", name: "Edit", icon: RiEdit2Fill },
    {
      show: canDelete,
      key: "delete",
      name: "Delete",
      icon: MdDelete,
      color: "danger",
    },
    {
      show: Role.atLeast(comment?.observer_role, "mod"),
      key: "role",
      name: "Edit Role/Title",
      icon: FaUserEdit,
    },
    {
      show: canMute,
      key: "mute",
      name: comment.is_muted ? "Unmute" : "Mute",
      icon: MdDoNotDisturb,
      color: "warning",
    },
    {
      show: canMute,
      key: "pin",
      name: comment.is_pinned ? "Unpin" : "Pin",
      icon: BsPinAngleFill,
    },
    { show: true, key: "copy", name: "Copy Link", icon: FaRegCopy },
    { show: false, key: "promote", name: "Promote", icon: GrAnnounce },
    { show: true, key: "history", name: "Edit History", icon: LuHistory },
  ];

  const renderedItems = menuItems
    .filter((item) => item.show)
    .map((item) => (
      <DropdownItem
        key={item.key}
        color={(item.color as any) || "default"}
        startContent={<item.icon className={"text-lg"} />}
      >
        {item.name}
      </DropdownItem>
    ));

  const unmuteMutation = useMutation({
    mutationFn: (data: { key: string; isKeychain?: boolean }) =>
      mutePost(
        loginInfo,
        data.key,
        !!!comment.is_muted,
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

  const pinMutation = useMutation({
    mutationFn: (data: { key: string; isKeychain?: boolean }) =>
      pinPost(
        loginInfo,
        data.key,
        !!!comment.is_pinned,
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
      dispatch(
        addCommentHandler({ ...comment, is_pinned: comment.is_pinned ? 0 : 1 })
      );
      toast.success(!!!comment.is_pinned ? "Pinned" : "Unpinned");
    },
  });

  const isPending = pinMutation.isPending || unmuteMutation.isPending;

  async function handleMenuActions(key: Key) {
    switch (key) {
      case "edit":
        handleEdit && handleEdit();
        break;

      case "history":
        setShowHistory(!showHistory);
        break;

      case "copy":
        navigator.clipboard.writeText(window.location.href);
        navigator.clipboard.writeText(
          `${AppStrings.steempro_base_url}/@${comment.author}/${comment.permlink}`
        );
        break;
      case "role":
        setIsRoleOpen(!isRoleOpen);
        break;
      case "delete":
        setConfirmationModal({ isOpen: true });
        break;

      case "mute":
      case "pin":
        authenticateUser();
        if (!isAuthorized()) return;
        const credentials = getCredentials(getSessionKey(session?.user?.name));
        if (!credentials?.key) {
          toast.error("Invalid credentials");
          return;
        }
        if (key === "mute") {
          // mute option will trigger the modal that's why only mute check
          if (comment.is_muted !== 0) {
            unmuteMutation.mutate({
              key: credentials.key,
              isKeychain: credentials.keychainLogin,
            });
            return;
          }

          // trigger for mute
          setConfirmationModal({ isOpen: true, mute: true });
          return;
        }
        if (key === "pin")
          pinMutation.mutate({
            key: credentials.key,
            isKeychain: credentials.keychainLogin,
          });
        break;
    }
  }

  return (
    <>
      <Dropdown placement={placement}>
        <DropdownTrigger>
          <Button
            size="sm"
            radius="full"
            isLoading={isPending}
            isDisabled={isPending}
            isIconOnly
            variant="light"
          >
            <FaEllipsis size={iconSize} />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-labelledby="comment options"
          onAction={handleMenuActions}
          hideEmptyContent
        >
          {renderedItems}
        </DropdownMenu>
      </Dropdown>
      {isRoleOpen && (
        <EditRoleModal
          comment={comment}
          isOpen={isRoleOpen}
          onOpenChange={setIsRoleOpen}
        />
      )}
      <MuteDeleteModal
        comment={comment}
        isOpen={confirmationModal.isOpen}
        onOpenChange={(open) =>
          setConfirmationModal({
            ...confirmationModal,
            isOpen: open,
          })
        }
        mute={confirmationModal.mute}
        muteNote={confirmationModal.muteNote}
        onNoteChange={(value) => {
          setConfirmationModal({ ...confirmationModal, muteNote: value });
        }}
      />
      {showHistory && (
        <CommentEditHistory
          isOpen={showHistory}
          onOpenChange={setShowHistory}
          author={comment.author}
          permlink={comment.permlink}
        />
      )}
    </>
  );
}

export default CommentHeaderMenu;
