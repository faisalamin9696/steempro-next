"use client";

import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import { extractMetadata } from "@/utils/editor";
import { useLanguage } from "@/contexts/LanguageContext";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { Chip } from "@heroui/chip";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import React, { useState } from "react";
import CommentCover from "./comment/components/CommentCover";
import BodyShort from "./body/BodyShort";
import { RiDraftLine } from "react-icons/ri";
import { TbClockEdit } from "react-icons/tb";
import { MdDelete } from "react-icons/md";
import STag from "./ui/STag";
import { FaClock, FaInfoCircle } from "react-icons/fa";
import TimeAgoWrapper from "./wrappers/TimeAgoWrapper";
import moment from "moment";
import ScheduleModal from "./ScheduleModal";
import { ZonedDateTime } from "@internationalized/date";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import { toast } from "sonner";
import { useLogin } from "./auth/AuthProvider";
import { signMessage, verifyPrivKey } from "@/libs/steem/condenser";
import { getCredentials, getSessionKey } from "@/utils/user";
import { useSession } from "next-auth/react";
import { addScheduleHandler } from "@/hooks/redux/reducers/ScheduleReducer";
import secureLocalStorage from "react-secure-storage";
import { validateCommunity } from "@/utils/helper";
import { empty_community } from "@/constants/Placeholders";
import { proxifyImageUrl } from "@/utils/proxifyUrl";
import STooltip from "./ui/STooltip";
import {
  parseZonedDateTime,
  parseAbsoluteToLocal,
} from "@internationalized/date";
import { cryptoUtils, Signature } from "@steempro/dsteem";
import SLink from "./ui/SLink";
import { twMerge } from "tailwind-merge";
import { savePostDraft } from "@/utils/draft";
import ConfirmationPopup from "./ui/ConfirmationPopup";

const StatusData = {
  0: { title: "Pending", color: "warning" },
  1: { title: "Published", color: "success" },
  2: { title: "Failed", color: "danger" },
};

function ScheduleItemCard({ item }: { item: Schedule }) {
  const scheduleInfo =
    (useAppSelector((state) => state.scheduleReducer.values)[
      `${item?.id}/${item?.username}`
    ] as Schedule) ?? item;

  const { data: session } = useSession();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const { authenticateUser, isAuthorized } = useLogin();
  const { t } = useLanguage();
  const [dateTime, setDateTime] = useState<ZonedDateTime | null>();
  const [scheduleModal, setScheduleModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  const metadata = extractMetadata(scheduleInfo.body);
  const targetUrl = scheduleInfo?.permlink
    ? `/@${scheduleInfo.username}/${scheduleInfo.permlink}`
    : undefined;
  const images = metadata?.["image"] ?? [];
  const dispatch = useAppDispatch();

  const isPending = isUpdating || isDeleting || isDrafting;

  function clearPending() {
    console.log(isUpdating, isDeleting, isDrafting);
    // clearing
    setIsUpdating(false);
    setIsDrafting(false);
    setIsDeleting(false);
  }

  function deleteSchedule(
    hash: Buffer,
    signature: Signature,
    isDraft?: boolean
  ) {
    axios
      .post(
        "/api/schedules/delete",
        {
          id: scheduleInfo.id,
          username: loginInfo.name,
          signature: signature.toString(),
          hash,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        if (isDraft) toast.success(t('schedules.copied_to_draft_deleted'));
        else toast.success(t('schedules.deleted_successfully'));
        dispatch(
          addScheduleHandler({
            ...scheduleInfo,
            status: -1,
          })
        );
      })
      .catch(function (error) {
        toast.error(t('common.error_occurred', { error: error.message || JSON.stringify(error) }));
      })
      .finally(() => {
        setIsUpdating(false);
        setIsDrafting(false);
      });
  }
  async function handleDelete(isDraft?: boolean) {
    authenticateUser();

    if (!isAuthorized()) {
      return;
    }

    try {
      const credentials = getCredentials(getSessionKey(session?.user?.name));

      if (!credentials?.key) {
        toast.error(t('schedules.invalid_credentials'));
        return;
      }
      if (isDraft) setIsDrafting(true);
      else setIsDeleting(true);

      if (credentials.keychainLogin) {
        const hash = cryptoUtils.sha256(loginInfo.name);

        window.steem_keychain.requestSignBuffer(
          loginInfo.name,
          loginInfo.name,
          "Posting",
          function (response) {
            if (response?.success && response?.result) {
              const signature = response.result;
              deleteSchedule(hash, signature, isDraft);
            } else {
              clearPending();
              toast.error(t('common.error_occurred', { error: response.message }));
              return;
            }
          }
        );
      } else {
        const isValidKey = verifyPrivKey(loginInfo, credentials.key);

        if (!isValidKey) {
          clearPending();
          toast.info(t('schedules.posting_key_required'));
          return;
        }

        const { signature, hash } = signMessage(
          credentials.key,
          loginInfo.name
        );

        deleteSchedule(hash, signature, isDraft);
      }
    } catch (error: any) {
      toast.error(t('common.error_occurred', { error: error?.message }));
      clearPending();
    }
  }

  function updateSchedule(
    hash: Buffer,
    signature: Signature,
    isDraft?: boolean
  ) {
    const time = moment(dateTime!.toAbsoluteString()).format();

    axios
      .post(
        "/api/schedules/update",
        {
          time: time,
          id: scheduleInfo.id,
          username: loginInfo.name,
          signature: signature.toString(),
          hash,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        toast.success(t('schedules.updated_successfully'));
        dispatch(
          addScheduleHandler({
            ...scheduleInfo,
            time: time,
            status: 0,
            message: "",
          })
        );
        setDateTime(undefined);
      })
      .catch(function (error) {
        toast.error(t('common.error_occurred', { error: error.message || JSON.stringify(error) }));
      })
      .finally(() => {
        setIsUpdating(false);
      });
  }
  async function handleOnEdit() {
    if (moment(scheduleInfo.time).isSameOrBefore(moment())) {
      toast.info(t('schedules.cannot_edit_published'));
      return;
    }

    if (!dateTime) {
      setScheduleModal(!scheduleModal);
      return;
    }

    if (moment(dateTime.toDate()).isSameOrBefore(moment())) {
      toast.info(t('schedules.schedule_future_time'));
      return;
    }

    if (scheduleInfo.status === 1) {
      toast.info(t('schedules.post_already_published'));
      return;
    }

    authenticateUser();

    if (!isAuthorized()) {
      return;
    }

    try {
      const credentials = getCredentials(getSessionKey(session?.user?.name));

      if (!credentials?.key) {
        toast.error(t('schedules.invalid_credentials'));
        return;
      }

      setIsUpdating(true);

      if (credentials.keychainLogin) {
        const hash = cryptoUtils.sha256(loginInfo.name);

        window.steem_keychain.requestSignBuffer(
          loginInfo.name,
          loginInfo.name,
          "Posting",
          function (response) {
            if (response.success) {
              const signature = response.result;
              updateSchedule(hash, signature);
            } else {
              toast.error(t('common.error_occurred', { error: response.message }));
            }
          }
        );
      } else {
        const isValidKey = verifyPrivKey(loginInfo, credentials.key);

        if (!isValidKey) {
          setIsUpdating(false);
          toast.info(t('schedules.posting_key_required'));
          return;
        }

        const { signature, hash } = signMessage(
          credentials.key,
          loginInfo.name
        );

        updateSchedule(hash, signature);
      }
    } catch (error: any) {
      toast.error(t('common.error_occurred', { error: error?.message }));
      setIsUpdating(false);
    }
  }

  async function handleDraft() {
    const options = JSON.parse(scheduleInfo?.options ?? "{}");
    const beneficiaries =
      options?.["extensions"]?.[0]?.[1]?.["beneficiaries"] ?? [];

    savePostDraft(
      scheduleInfo.title,
      scheduleInfo.body,
      scheduleInfo.tags?.replaceAll(",", " "),
      beneficiaries,
      validateCommunity(scheduleInfo.parent_permlink)
        ? empty_community(scheduleInfo.parent_permlink)
        : undefined
    );

    await handleDelete(true);
  }
  if (scheduleInfo?.status === -1) return null;

  return (
    <div className="w-full rounded-2xl flex-col gap-4 comment-card">
      <Card
        radius="none"
        shadow="none"
        className={twMerge("w-full bg-transparent gap-4 p-4 relative")}
      >
        <div className=" absolute right-4 flex items-center gap-2">
          {targetUrl && (
            <SLink className=" text-blue-500 text-sm" href={targetUrl}>
              Visit
            </SLink>
          )}

          {scheduleInfo.status === 2 && (
            <STooltip content={scheduleInfo.message || "Failed"}>
              <div>
                <FaInfoCircle className=" text-lg" />
              </div>
            </STooltip>
          )}

          <Chip
            size="sm"
            variant="dot"
            color={StatusData[scheduleInfo.status].color}
          >
            {StatusData[scheduleInfo.status].title}
          </Chip>
        </div>
        <div className=" flex items-center justify-between gap-4">
          <div className=" flex flex-col gap-4 w-full">
            <div className=" items-center">
              <div className=" flex flex-row items-start gap-2">
                <FaClock className=" text-lg" />
                <div className="text-sm flex-col items-center gap-1">
                  <div className="flex flec-row items-center gap-1">
                    {moment(scheduleInfo.time).format("YYYY-MM-DD HH:mm")}

                    <p>in</p>

                    <STag
                      onlyText
                      className="text-sm !text-blue-500"
                      tag={scheduleInfo.parent_permlink ?? scheduleInfo.tags[0]}
                    />
                  </div>

                  <div className="flex gap-0 items-center">
                    {"("}
                    <TimeAgoWrapper
                      created={moment(scheduleInfo.time).unix() * 1000}
                    />
                    {")"}
                  </div>
                </div>
              </div>
            </div>
            <div className=" flex flex-row justify-between gap-4">
              <div className=" flex flex-col gap-2">
                <h2 className="font-bold text-medium text-start ">
                  {scheduleInfo.title}
                </h2>
                <div className="line-clamp-3 text-start text-sm flex-1">
                  <BodyShort body={scheduleInfo.body} />
                </div>
              </div>

              {!!images?.length && (
                <CommentCover
                  className="max-h-36 max-w-36 self-center object-contain rounded-md"
                  thumbnail
                  targetUrl={targetUrl}
                  isNsfw={false}
                  src={proxifyImageUrl(images[0])}
                />
              )}
            </div>
            <div className="flex gap-4 items-center">
              <Button
                title="Save to draft and delete"
                size="sm"
                variant="flat"
                color="primary"
                isDisabled={isPending}
                isLoading={isDrafting}
                onPress={handleDraft}
                startContent={<RiDraftLine className=" text-xl" />}
              >
                Draft and Delete
              </Button>

              {dateTime && (
                <p className="text-default-500 text-sm flex flex-row items-center gap-2">
                  <button
                    disabled={isPending}
                    onClick={() => {
                      setDateTime(undefined);
                    }}
                  >
                    <IoClose className=" text-lg" />
                  </button>
                  {moment(dateTime.toAbsoluteString()).format(
                    "YYYY-MM-DD HH:mm:ss"
                  )}
                </p>
              )}
              {
                <div>
                  <Button
                    title="Post scheduling time"
                    startContent={<TbClockEdit className=" text-xl" />}
                    size="sm"
                    variant="flat"
                    color="warning"
                    isDisabled={isPending}
                    isLoading={isUpdating}
                    onPress={handleOnEdit}
                  >
                    {!dateTime ? "Change time" : "Update"}
                  </Button>
                </div>
              }

              <ConfirmationPopup
                triggerProps={{
                  title: "Delete",
                  size: "sm",
                  variant: "flat",
                  isDisabled: isPending,
                  isLoading: isDeleting,
                  color: "danger",
                  startContent: <MdDelete className=" text-xl" />,
                }}
                subTitle="Do you really delete this post?"
                onConfirm={handleDelete}
              />
            </div>
          </div>
        </div>
      </Card>
      <ScheduleModal
        isOpen={scheduleModal}
        onOpenChange={setScheduleModal}
        onDateTimeChange={setDateTime}
        startTime={parseZonedDateTime(
          parseAbsoluteToLocal(scheduleInfo.time).toString()
        )}
      />
    </div>
  );
}

export default ScheduleItemCard;
