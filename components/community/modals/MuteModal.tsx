"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import SModal from "@/components/ui/SModal";

interface MuteModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onMute: (note: string) => Promise<void>;
  isPending?: boolean;
}

const MuteModal = ({
  isOpen,
  onOpenChange,
  onMute,
  isPending = false,
}: MuteModalProps) => {
  const [note, setNote] = useState("");

  const handleMute = async () => {
    if (!note.trim()) return;
    await onMute(note);
    setNote("");
  };

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      title={"Mute Post"}
      description={
        "Provide a reason for muting this post. This note is required."
      }
    >
      {(onClose) => (
        <div className="flex flex-col gap-6">
          <Input
            label="Mute Note"
            placeholder="Enter reason..."
            value={note}
            onValueChange={setNote}
            isRequired
            autoFocus
            isDisabled={isPending}
          />

          <div className="flex flex-row gap-2 self-end">
            <Button
              variant="light"
              onPress={() => {
                setNote("");
                onClose();
              }}
              isDisabled={isPending}
            >
              Cancel
            </Button>
            <Button
              color="warning"
              onPress={handleMute}
              isLoading={isPending}
              isDisabled={!note.trim()}
            >
              Mute Post
            </Button>
          </div>
        </div>
      )}
    </SModal>
  );
};

export default MuteModal;
