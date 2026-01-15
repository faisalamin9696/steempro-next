"use client";

import MarkdownViewer from "@/components/post/body/MarkdownViewer";
import MarkdownEditor from "@/components/submit/MarkdownEditor";
import { useEffect, useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import TagsInput from "@/components/submit/TagsInput";
import { Constants } from "@/constants";
import { ZonedDateTime } from "@internationalized/date";
import ScheduleButton from "@/components/ui/ScheduleButton";
import moment from "moment";
import { X } from "lucide-react";
import CommunitySelect from "@/components/ui/CommunitySelect";
import PublishButton from "@/components/submit/PublishButton";
import ClearButton from "@/components/ui/ClearButton";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";
import { useDraft } from "@/hooks/useDraft";
import { empty_community } from "@/constants/templates";
import PayoutTypeButton from "@/components/post/PayoutTypeButton";
import BeneficiariesButton from "@/components/submit/BeneficiariesButton";
import { readingTime } from "@/utils/reading-time-estimator";

const ICON_SIZE = 22;
function SubmitPage({
  isEdit,
  root,
  handleCancelEdit,
}: {
  isEdit?: boolean;
  root?: Post;
  handleCancelEdit?: () => void;
}) {
  let { ...draftData } = useDraft("post-editor");
  const [draft, setDraft] = useState(draftData.draft);
  const [scheduleTime, setScheduleTime] = useState<ZonedDateTime | null>();
  const [title, setTitle] = useState(isEdit ? root?.title || "" : draft.title);
  const [tags, setTags] = useState<string[]>(
    isEdit ? JSON.parse(root?.json_metadata || "{}")?.tags || [] : draft.tags
  );
  const [markdown, setMarkdown] = useState(
    isEdit ? root?.body || "" : draft.body
  );
  const rpm = readingTime(markdown);

  const [payoutType, setPayoutType] = useState(Constants.reward_types[1]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(
    isEdit
      ? (root?.beneficiaries || [])?.map((item) => ({
          account: item[0],
          weight: item[1],
        }))
      : draft.beneficiaries
  );
  const [community, setCommunity] = useState<Community | undefined>(
    isEdit
      ? root && empty_community(root?.category, root?.community)
      : draft?.community
  );
  const [isPending, setIsPending] = useState(false);

  const isComment = (root?.depth ?? 0) > 0;

  function clearForm() {
    setTitle("");
    setMarkdown("");
    setTags([]);
    setScheduleTime(undefined);
    setPayoutType(Constants.reward_types[1]);
    setCommunity(undefined);
    setBeneficiaries([]);
    draftData.clearDraft();
  }

  useEffect(() => {
    if (!isEdit) {
      const latestDraft = draftData.loadDraft();
      setDraft(latestDraft);
      loadDraft(latestDraft);
    }
  }, []);

  function loadDraft(data: DraftData) {
    setTitle(data.title);
    setMarkdown(data.body);
    setCommunity(data.community);
    setBeneficiaries(data.beneficiaries);
    setTags(data.tags);
  }

  return (
    <div
      className={twMerge(
        "flex w-full flex-col gap-2 pb-4",
        !isEdit && "1md:flex-row"
      )}
    >
      <div className="1md:w-full 1md:float-start 1md:sticky 1md:z-1 1md:self-start 1md:top-[80px]">
        <div className="flex flex-col gap-3 flex-1 lg:flex-1">
          {!isEdit && (
            <CommunitySelect
              initialCommunity={
                isEdit
                  ? root && empty_community(root?.category, root?.community)
                  : undefined
              }
              community={community}
              onSelectCommunity={(community) => {
                setCommunity(community);
                if (!isEdit) draftData.setCommunity(community);
              }}
              isDisabled={isPending}
            />
          )}
          {(!isEdit || root?.title) && (
            <Input
              size="lg"
              id="title"
              value={title}
              onValueChange={(title) => {
                setTitle(title);
                if (!isEdit) draftData.setTitle(title);
              }}
              placeholder="Enter your post title..."
              className="text-lg"
              classNames={{
                label: "text-muted",
                inputWrapper: "border border-border",
              }}
              isDisabled={isPending}
            />
          )}

          <MarkdownEditor
            value={markdown}
            onChange={(body) => {
              setMarkdown(body);
              if (!isEdit) draftData.setBody(body);
            }}
            insidePreview={isEdit}
            disabled={isPending}
            authors={
              root ? [root?.author, root?.parent_author, root?.root_author] : []
            }
          />

          {!isComment && (
            <TagsInput
              tags={tags}
              onChange={(_tags) => {
                setTags(_tags);
                if (!isEdit) draftData.setTags(_tags);
              }}
              isDisabled={isPending}
            />
          )}

          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex flex-row gap-2">
              <ClearButton onPress={clearForm} isDisabled={isPending} />

              {!isEdit && (
                <>
                  <BeneficiariesButton
                    beneficiaries={beneficiaries}
                    setBeneficiaries={(_beneficiaries) => {
                      setBeneficiaries(_beneficiaries);
                      if (!isEdit) draftData.setBeneficiaries(_beneficiaries);
                    }}
                    color="warning"
                    radius="md"
                    variant="flat"
                    iconSize={ICON_SIZE}
                    isDisabled={isPending}
                  />
                  <PayoutTypeButton
                    payoutType={payoutType}
                    setPayoutType={setPayoutType}
                    color="primary"
                    radius="md"
                    variant={"flat"}
                    iconSize={ICON_SIZE}
                    isDisabled={isPending}
                  />
                </>
              )}
            </div>

            <div className="flex flex-row gap-2">
              {!isEdit && !scheduleTime && (
                <ScheduleButton
                  startTime={scheduleTime}
                  onDateTimeChange={setScheduleTime}
                  radius="md"
                  color={"secondary"}
                  variant={"flat"}
                  isIconOnly
                  iconSize={ICON_SIZE}
                  isDisabled={isPending}
                />
              )}

              {isEdit && (
                <>
                  <Button variant="bordered" onPress={handleCancelEdit}>
                    Cancel
                  </Button>

                  <Button
                    variant="flat"
                    color="warning"
                    onPress={() => {
                      draftData.updateDraft({
                        title,
                        body: markdown,
                        tags,
                        beneficiaries: (root?.beneficiaries ?? []).map(
                          (item) => {
                            return { account: item[0], weight: item[1] };
                          }
                        ),
                        community:
                          root &&
                          empty_community(root?.category, root?.community),
                      });
                      toast.success("Saved", { description: "Draft updated" });
                    }}
                  >
                    Save Draft
                  </Button>
                </>
              )}
              <PublishButton
                scheduleTime={scheduleTime}
                title={title}
                body={markdown}
                tags={tags}
                community={community}
                beneficiaries={beneficiaries}
                payoutType={payoutType}
                isDisabled={!markdown}
                onPending={setIsPending}
                onPublished={(isSchedule) => {
                  if (isEdit) {
                    handleCancelEdit?.();
                    toast.success("Updated");
                  } else {
                    if (isSchedule) {
                      toast.success("Post scheduled successfully!");
                    } else toast.success("Published");
                    clearForm();
                  }
                }}
                buttonTitle={isEdit ? "Update" : undefined}
                comment={root as Post}
                root={root as Post}
                isEdit={isEdit}
              />
            </div>
          </div>
          <div className="flex flex-row items-end justify-end">
            {scheduleTime && (
              <Button
                size="sm"
                variant="light"
                onPress={() => setScheduleTime(null)}
              >
                <X size={20} />
                <p>
                  {moment(scheduleTime.toAbsoluteString()).format(
                    "YYYY-MM-DD HH:mm:ss"
                  )}
                </p>
              </Button>
            )}
          </div>
        </div>
      </div>
      {!isEdit && (
        <div className="flex flex-col w-full lg:max-w-[65ch] gap-2 self-start">
          <p className="text-base font-semibold text-muted">Preview</p>
          <div className="flex flex-col bg-default-100 p-4 rounded-xl gap-4">
            <div className="flex flex-row gap-2 justify-end">
              <p className="text-muted">{`${rpm.words} words, ~${rpm.text}`}</p>
            </div>
            <div className="flex flex-col items-center w-full">
              <MarkdownViewer body={markdown} className="w-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubmitPage;
