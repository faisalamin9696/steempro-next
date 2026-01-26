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
  isMuted: boolean;
}

const MuteModal = ({
  isOpen,
  onOpenChange,
  onMute,
  isPending = false,
  isMuted,
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
      title={isMuted ? "Unmute post/comment" : "Mute post/comment"}
      description={`Provide a reason for ${isMuted ? "unmuting" : "muting"} this post/comment. This note is required.`}
    >
      {(onClose) => (
        <div className="flex flex-col gap-6">
          <Input
            label={`${isMuted ? "Unmute" : "Mute"} Note`}
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
              {isMuted ? "Unmute" : "Mute"}
            </Button>
          </div>
        </div>
      )}
    </SModal>
  );
};

export default MuteModal;
