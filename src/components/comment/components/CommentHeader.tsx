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
import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import Reputation from "@/components/Reputation";
import { getResizedAvatar } from "@/utils/parseImage";
import TimeAgoWrapper from "@/components/wrappers/TimeAgoWrapper";
import { validateCommunity } from "@/utils/helper";
import { getCredentials, getSessionKey, getSettings } from "@/utils/user";
import STag from "@/components/ui/STag";
import { Key, useState } from "react";
import { MdDelete, MdDoNotDisturb } from "react-icons/md";
import { GrAnnounce } from "react-icons/gr";
import ViewCountCard from "@/components/ViewCountCard";
import { readingTime } from "@/utils/readingTime/reading-time-estimator";
import { Role } from "@/utils/community";
import { allowDelete } from "@/utils/stateFunctions";
import { RiEdit2Fill } from "react-icons/ri";
import { LuHistory } from "react-icons/lu";
import { toast } from "sonner";
import EditRoleModal from "@/components/EditRoleModal";
import { FaInfoCircle, FaUserEdit } from "react-icons/fa";
import MuteDeleteModal from "@/components/MuteDeleteModal";
import { useMutation } from "@tanstack/react-query";
import { mutePost, pinPost } from "@/libs/steem/condenser";
import { addCommentHandler } from "@/hooks/redux/reducers/CommentReducer";
import { useLogin } from "@/components/auth/AuthProvider";
import { BsPinAngleFill } from "react-icons/bs";
import RoleTitleCard from "@/components/RoleTitleCard";
import { useSession } from "next-auth/react";
import { AppStrings } from "@/constants/AppStrings";
import CommentEditHistory from "@/components/CommentHistoryViewer";
import SLink from "@/components/ui/SLink";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import { Card } from "@heroui/card";
import { Chip } from "@heroui/chip";
import SAvatar from "@/components/ui/SAvatar";
import CommentHeaderMenu from "./CommentHeaderMenu";

interface Props {
  comment: Post | Feed;
  size?: "sm" | "md";
  className?: string;
  isReply?: boolean;
  compact?: boolean;
  handleEdit?: () => void;
  isDetail?: boolean;
  hidden?: boolean;
}
export default function CommentHeader(props: Props) {
  const { comment, className, isReply, compact, handleEdit, isDetail, hidden } =
    props;
  const isUsingSteempro = JSON.parse(
    comment?.json_metadata ?? "{}"
  )?.app?.includes("steempro");
  const settings =
    useAppSelector((state) => state.settingsReducer.value) ?? getSettings();
  const [isRoleOpen, setIsRoleOpen] = useState(false);
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

  const ExtraInformation = ({ className }: { className?: string }) => {
    return (
      <div className={twMerge("flex flex-col items-end gap-2", className)}>
        <div className="flex gap-2">
          <p className="text-tiny font-light ">{rpm.words} words,</p>

          <p className="text-tiny font-light ">{rpm.text}</p>
        </div>

        <ViewCountCard
          author={comment.author}
          permlink={comment.permlink}
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
      <div className="flex flex-row justify-between flex-1">
        <div className="flex flex-row items-center gap-1 flex-1">
          <SAvatar size="sm" username={comment.author} />
          <div className="flex flex-col gap-1">
            <div className="flex flex-row items-center gap-2 text-sm">
              <SLink href={`/@${comment.author}`}>{comment.author}</SLink>

              <Reputation reputation={comment.author_reputation} />
              {!!comment.is_pinned && (
                <Chip
                  color="success"
                  variant="flat"
                  size="sm"
                  className="ms-1 h-5 px-0"
                >
                  Pinned
                </Chip>
              )}
              {!isReply && !compact ? (
                <div className="flex md:hidden">
                  <CommentHeaderMenu
                    comment={comment}
                    handleEdit={handleEdit}
                  />
                </div>
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
            <div className="flex flex-wrap items-center gap-x-2 text-default-900/60 dark:text-gray-200 text-sm">
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
                  <div className="flex gap-2 sm:items-center">
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
          </div>
        </div>

        {!hidden && !isReply && !compact && comment.depth === 0 && (
          <div className="text-tiny items-center px-1">
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
      </div>
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
    </div>
  );
}
