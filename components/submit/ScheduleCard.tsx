"use client";

import { Card, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import {
  Calendar,
  Clock,
  Edit2,
  Trash2,
  FileText,
  XCircle,
  FileWarning,
  Link2,
} from "lucide-react";
import moment from "moment";
import { toast } from "sonner";
import { useState } from "react";
import { saveDraftToStorage } from "@/hooks/useDraft";
import ScheduleModal from "../ui/ScheduleModal";
import {
  parseAbsoluteToLocal,
  parseZonedDateTime,
  ZonedDateTime,
} from "@internationalized/date";
import {
  extractMetadata,
  validateCommunityAccount,
} from "@/utils/editor";
import Link from "next/link";
import { empty_comment, empty_community } from "@/constants/templates";
import SPopover from "../ui/SPopover";
import PostBody from "../post/PostBody";
import { deleteSchedule, updateSchedule } from "@/libs/supabase/schedule";

interface Props {
  schedule: Schedule;
  onRefresh: () => void;
}

export default function ScheduleCard({ schedule, onRefresh }: Props) {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const isPending = isRescheduling || isDeleting || isEditing || isDrafting;

  const targetUrl = schedule?.permlink
    ? `/@${schedule.username}/${schedule.permlink}`
    : undefined;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteSchedule(schedule.id!);
      toast.success("Scheduled post deleted");
      onRefresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDraft = (shouldDelete = false) => {
    if (shouldDelete) {
      setIsDrafting(true);
    }
    try {
      const draftData: DraftData = {
        title: schedule.title,
        body: schedule.body,
        tags: schedule.tags.split(","),
        beneficiaries:
          JSON.parse(schedule.options || "{}")?.beneficiaries || [],
        community: validateCommunityAccount(schedule.parent_permlink)
          ? empty_community(schedule.parent_permlink, schedule.parent_permlink)
          : undefined,
        updatedAt: moment().unix(),
      };

      saveDraftToStorage("post-editor", draftData);
      toast.success("Post drafted", {
        description: "You can find it in the submit page.",
      });

      if (shouldDelete) {
        deleteSchedule(schedule.id!)
          .then(() => onRefresh())
          .finally(() => {
            setIsDrafting(false);
          });
      }
    } catch (error: any) {
      toast.error("Failed to draft: " + error.message);
    }
  };

  const handleReschedule = async (newTime: ZonedDateTime | null) => {
    if (!newTime) return;
    const newMoment = moment(newTime.toAbsoluteString());
    const oldMoment = moment(schedule.time);

    if (Math.abs(newMoment.diff(oldMoment, "minutes")) < 5) {
      toast.error("Time difference must be at least 5 minutes");
      return;
    }

    setIsEditing(true);
    try {
      await updateSchedule(schedule.id!, {
        time: newTime.toAbsoluteString(),
      });
      toast.success("Schedule updated");
      setIsRescheduling(false);
      onRefresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <Card className="post-card w-full shadow-sm">
      <CardBody className="gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row  gap-2 items-center">
            <PostBody
              comment={{
                ...empty_comment(schedule.username, schedule.permlink),
                body: schedule.body,
                title: schedule.title,
                json_metadata: JSON.stringify(extractMetadata(schedule.body)),
                json_images: JSON.stringify(
                  extractMetadata(schedule.body)?.["image"] ?? []
                ),
              }}
            />

            {/* {thumbnail && <Image height={100} width={150} src={thumbnail} />} */}
          </div>
          <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{moment(schedule.time).format("MMM D, YYYY")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{moment(schedule.time).format("hh:mm A")}</span>
            </div>
            <Chip
              size="sm"
              variant="flat"
              color={
                schedule.status === 0
                  ? "warning"
                  : schedule.status === 1
                  ? "success"
                  : "danger"
              }
            >
              {schedule.status === 0
                ? "Pending"
                : schedule.status === 1
                ? "Published"
                : "Failed"}
            </Chip>
            {targetUrl && schedule.status === 1 && (
              <Chip
                size="sm"
                variant="flat"
                as={Link}
                href={targetUrl}
                classNames={{
                  content:
                    "flex flex-row items-center gap-1 hover:text-blue-500 delay-50 transition-colors",
                }}
              >
                <Link2 size={18} />
                <p className=" truncate max-w-[150px]">
                  {targetUrl?.replace("/", "")}
                </p>
              </Chip>
            )}
          </div>

          {schedule.status === 2 && schedule.message && (
            <div className="flex items-center gap-1 text-xs">
              <FileWarning size={14} className="text-danger" />
              <span className="text-danger">{schedule.message}</span>
            </div>
          )}
        </div>
      </CardBody>

      <Divider />

      <CardFooter className="p-2 flex justify-between gap-2 overflow-x-auto">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="flat"
            color="primary"
            startContent={<FileText size={16} />}
            onPress={() => handleDraft(false)}
            isDisabled={isPending}
          >
            Draft
          </Button>
          <Button
            size="sm"
            variant="flat"
            color="secondary"
            startContent={!isDrafting && <XCircle size={16} />}
            onPress={() => handleDraft(true)}
            isLoading={isDrafting}
            isDisabled={isPending}
          >
            Draft & Delete
          </Button>
        </div>

        <div className="flex gap-1">
          {schedule.status === 0 && (
            <Button
              size="sm"
              variant="flat"
              color="warning"
              isIconOnly
              onPress={() => setIsRescheduling(true)}
              isLoading={isEditing}
              isDisabled={isPending}
            >
              <Edit2 size={16} />
            </Button>
          )}
          <SPopover
            title="Delete Schedule"
            description="Do you really want to delete this schedule?"
            trigger={
              <Button
                size="sm"
                variant="flat"
                color="danger"
                isIconOnly
                onPress={handleDelete}
                isLoading={isDeleting}
                isDisabled={isPending}
              >
                <Trash2 size={16} />
              </Button>
            }
          >
            {(onClose) => (
              <div className="flex gap-2 self-end">
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>

                <Button
                  color="danger"
                  onPress={() => {
                    onClose();
                    handleDelete();
                  }}
                >
                  Delete
                </Button>
              </div>
            )}
          </SPopover>
        </div>
      </CardFooter>

      <ScheduleModal
        isOpen={isRescheduling}
        onOpenChange={setIsRescheduling}
        onDateTimeChange={handleReschedule}
        startTime={parseZonedDateTime(
          parseAbsoluteToLocal(schedule.time).toString()
        )}
      />
    </Card>
  );
}
