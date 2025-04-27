import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { User } from "@heroui/user";
import { Button } from "@heroui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { FaEllipsis, FaRegCopy } from "react-icons/fa6";
import { useAppDispatch, useAppSelector } from "@/libs/constants/AppFunctions";
import Reputation from "@/components/Reputation";
import { getResizedAvatar } from "@/libs/utils/parseImage";
import TimeAgoWrapper from "@/components/wrappers/TimeAgoWrapper";
import { validateCommunity } from "@/libs/utils/helper";
import { getCredentials, getSessionKey, getSettings } from "@/libs/utils/user";
import STag from "@/components/STag";
import { Key, useState } from "react";
import { MdDelete, MdDoNotDisturb } from "react-icons/md";
import { GrAnnounce } from "react-icons/gr";
import ViewCountCard from "@/components/ViewCountCard";
import { readingTime } from "@/libs/utils/readingTime/reading-time-estimator";
import { Role } from "@/libs/utils/community";
import { allowDelete } from "@/libs/utils/stateFunctions";
import { RiEdit2Fill } from "react-icons/ri";
import { LuHistory } from "react-icons/lu";
import { toast } from "sonner";
import EditRoleModal from "@/components/EditRoleModal";
import { FaInfoCircle, FaUserEdit } from "react-icons/fa";
import MuteDeleteModal from "@/components/MuteDeleteModal";
import { useMutation } from "@tanstack/react-query";
import { mutePost, pinPost } from "@/libs/steem/condenser";
import { addCommentHandler } from "@/libs/redux/reducers/CommentReducer";
import { useLogin } from "@/components/auth/AuthProvider";
import { BsPinAngleFill } from "react-icons/bs";
import RoleTitleCard from "@/components/RoleTitleCard";
import { useSession } from "next-auth/react";
import { AppStrings } from "@/libs/constants/AppStrings";
import CommentEditHistory from "@/components/CommentHistoryViewer";
import SLink from "@/components/SLink";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import { Card } from "@heroui/card";

interface Props {
  comment: Post | Feed;
  size?: "sm" | "md";
  className?: string;
  isReply?: boolean;
  compact?: boolean;
  handleEdit?: () => void;
  isDetail?: boolean;
}
export default function CommentHeader(props: Props) {
  const { comment, className, isReply, compact, handleEdit, isDetail } = props;
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const dispatch = useAppDispatch();
  const { data: session } = useSession();

  const username = session?.user?.name ?? loginInfo.name;
  const isUsingSteempro = JSON.parse(
    comment?.json_metadata ?? "{}"
  )?.app?.includes("steempro");

  const isSelf = session?.user?.name === comment.author;
  const canMute = username && Role.atLeast(comment.observer_role, "mod");
  const canDelete = !comment.children && isSelf && allowDelete(comment);
  const canEdit = isSelf;
  const settings =
    useAppSelector((state) => state.settingsReducer.value) ?? getSettings();
  const [isRoleOpen, setIsRoleOpen] = useState(false);

  const { authenticateUser, isAuthorized } = useLogin();
  const rpm = readingTime(comment.body);
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

  const ExtraInformation = ({ className }: { className?: string }) => {
    return (
      <div className={twMerge("flex flex-col items-end gap-2", className)}>
        <div className="flex gap-2">
          <p className="text-tiny font-light ">{rpm.words} words,</p>

          <p className="text-tiny font-light ">{rpm.text}</p>
        </div>

        <ViewCountCard
          comment={comment}
          className="shadow-sm shadow-foreground/30 rounded-full bg-white dark:border-none dark:bg-foreground/10 text-tiny px-2 py-[1px] font-light "
        />
      </div>
    );
  };
  return (
    <div
      className={twMerge(
        "main-comment-list flex card-content w-auto relative items-center",
        className
      )}
    >
      <User
        classNames={{
          description: "text-default-900/60 dark:text-gray-200 text-sm",
          name: "text-default-800",
          wrapper: "gap-1",
        }}
        name={
          <div className="flex flex-row items-center gap-1">
            {isSelf ? (
              <SLink
                className=" hover:text-blue-500"
                href={`/@${comment.author}`}
              >
                {comment.author}
              </SLink>
            ) : (
              <SLink
                className=" hover:text-blue-500"
                href={`/@${comment.author}`}
              >
                {comment.author}
              </SLink>
            )}
            <Reputation reputation={comment.author_reputation} />
            {!!comment.is_pinned && (
              <p className="ms-1 px-1 rounded-full text-tiny bg-success/50">
                Pinned
              </p>
            )}
            {!isReply && !compact ? (
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    size="sm"
                    radius="full"
                    isLoading={isPending}
                    isDisabled={isPending}
                    isIconOnly
                    variant="light"
                  >
                    <FaEllipsis size={18} />
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
            ) : null}
            {isDetail && isUsingSteempro && (
              <Card title="Posted using SteemPro" className=" rounded-full">
                <Image
                  quality={75}
                  title="Posted using SteemPro"
                  alt=""
                  height={20}
                  width={20}
                  src="/logo192.png"
                />
              </Card>
            )}
          </div>
        }
        description={
          <div className="flex flex-col">
            <RoleTitleCard comment={comment} />

            <div className={twMerge(`flex items-center gap-1`)}>
              <TimeAgoWrapper
                handleEditClick={() => {
                  setShowHistory(!showHistory);
                }}
                lang={settings.lang.code}
                created={comment.created * 1000}
                lastUpdate={comment.last_update * 1000}
              />
              {!isReply && (
                <div className="flex gap-1  sm:items-center">
                  <p className={""}>in</p>

                  <STag
                    className="text-md font-semibold"
                    onlyText
                    content={
                      comment.community ||
                      (validateCommunity(comment.category)
                        ? comment.category
                        : `#${comment.category}`)
                    }
                    tag={comment.category}
                  />
                </div>
              )}
            </div>
          </div>
        }
        avatarProps={
          {
            className: twMerge(isReply ? "h-8 w-8" : "", "cursor-pointer "),
            src: getResizedAvatar(comment.author),
            as: SLink,
            href: `/@${comment.author}`,
          } as any
        }
      />
      {!isReply && !compact && comment.depth === 0 && (
        <div className="absolute top-0 text-tiny right-0 items-center px-1">
          <Popover
            className="hidden max-sm:block"
            placement="bottom"
            showArrow
            offset={10}
          >
            <PopoverTrigger className="absolute top-0 text-tiny right-0 items-center px-1">
              <Button
                isIconOnly
                radius="full"
                className="hidden max-sm:block"
                size="sm"
                variant="light"
                color="default"
              >
                <FaInfoCircle className="text-lg text-default-800" />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <ExtraInformation />
            </PopoverContent>
          </Popover>
          <ExtraInformation className="flex max-sm:hidden" />
        </div>
      )}
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
        onClose={() =>
          setConfirmationModal({
            ...confirmationModal,
            isOpen: !confirmationModal.isOpen,
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
    </div>
  );
}
