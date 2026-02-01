import React from "react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import SModal from "../ui/SModal";
import { validateTags } from "@/utils/editor";
import { toast } from "sonner";
import { Alert } from "@heroui/react";

interface UnfinishedTagsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  pendingTag: string;
  tags: string[];
  setTags: (tags: string[]) => void;
  setPendingTag: (value: string) => void;
  onConfirm: (finalTags: string[]) => void;
  onDiscard: () => void;
}

const UnfinishedTagsModal = ({
  isOpen,
  onOpenChange,
  pendingTag,
  tags,
  setTags,
  setPendingTag,
  onConfirm,
  onDiscard,
}: UnfinishedTagsModalProps) => {
  const handleAddAndPublish = (onClose: () => void) => {
    const rawTag = pendingTag?.trim().toLowerCase();
    if (!rawTag) {
      onClose();
      onDiscard();
      return;
    }

    const newTagsList = rawTag.split(/[\s,]+/).filter((t) => t);
    const updatedTags = [...tags];
    let addedCount = 0;
    let invalidTags: string | null = "";
    for (const t of newTagsList) {
      if (!updatedTags.includes(t)) {
        invalidTags = validateTags([...updatedTags, t].join(" "));
        if (!invalidTags) {
          updatedTags.push(t);
          addedCount++;
        } else {
          toast.info(invalidTags);
          return;
        }
      }
    }

    if (addedCount > 0) {
      setTags(updatedTags);
      setPendingTag("");
      onClose();
      onConfirm(updatedTags);
    } else {
      toast.error(invalidTags || "No new valid tags were found to add.");
    }
  };

  const getPendingTags = () => {
    return pendingTag
      ?.trim()
      .split(/[\s,]+/)
      .filter((t) => t);
  };

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Unfinished Tags"
      className="max-w-md"
    >
      {(onClose) => (
        <div className="flex flex-col gap-6 py-2">
          <Alert
            color="default"
            title="Wait, you forgot something!"
            description="You typed some tags but didn't hit Enter to add them. They won't be saved if you publish now."
          />

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted px-1">
              Pending Tags
            </p>
            <div className="flex flex-wrap gap-2 p-3 bg-default-50 dark:bg-default-100/50 rounded-xl border border-border">
              {getPendingTags().map((t) => (
                <Chip
                  key={t}
                  variant="flat"
                  color="warning"
                  size="sm"
                  className="font-medium"
                >
                  #{t.toLowerCase()}
                </Chip>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="flat"
                color="danger"
                size="lg"
                startContent={<Trash2 size={18} className="shrink-0" />}
                onPress={() => {
                  onClose();
                  onDiscard();
                }}
              >
                Skip & Publish
              </Button>
              <Button
                color="success"
                variant="flat"
                size="lg"
                startContent={<Plus size={18} />}
                onPress={() => handleAddAndPublish(onClose)}
              >
                Add Tags & Publish
              </Button>
            </div>
          </div>
        </div>
      )}
    </SModal>
  );
};

export default UnfinishedTagsModal;
