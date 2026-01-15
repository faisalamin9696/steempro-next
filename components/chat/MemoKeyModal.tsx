"use client";

import React, { useState } from "react";
import SModal from "../ui/SModal";
import { Input, Button, Alert } from "@heroui/react";
import { Lock, Key } from "lucide-react";
import { steemApi } from "@/libs/steem";
import { toast } from "sonner";
import secureLocalStorage from "react-secure-storage";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
  onSuccess: (memoKey: string) => void;
}

function MemoKeyModal({ isOpen, onOpenChange, username, onSuccess }: Props) {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleValidateAndSave = async () => {
    if (!key) {
      toast.error("Please enter your private memo key");
      return;
    }

    setLoading(true);
    try {
      const type = await steemApi.detectKeyAuthority(username, key);
      if (type === "memo" || type === "active" || type === "owner") {
        // Active and Owner keys can also act as memo keys if needed,
        // but typically we want the memo key.
        // Some users might use active key for everything.
        // For chat, memo key is standard.

        secureLocalStorage.setItem(`chat_memo_key_${username}`, key);
        toast.success("Memo key validated and saved securely.");
        onSuccess(key);
        onOpenChange(false);
      } else {
        toast.error(
          "The provided key is not a valid Memo, Active, or Owner key for this account."
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to validate key");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Secure Chat Setup"
      size="sm"
    >
      {() => (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="p-3 rounded-full bg-primary/10">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <p className="text-sm text-balance">
              To encrypt and decrypt your messages, we need your{" "}
              <strong>Private Memo Key</strong>.
            </p>
          </div>

          <Alert
            color="warning"
            variant="faded"
            description="Your key is stored locally on your device in secure storage and never sent to our servers."
          />

          <Input
            label="Private Memo Key"
            placeholder="5K..."
            value={key}
            onValueChange={setKey}
            type="password"
            autoFocus
            startContent={<Key size={18} className="text-default-400" />}
            onKeyDown={(e) => e.key === "Enter" && handleValidateAndSave()}
          />

          <div className="flex justify-end gap-2 mt-2">
            <Button variant="flat" onPress={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleValidateAndSave}
              isLoading={loading}
            >
              Verify & Save
            </Button>
          </div>
        </div>
      )}
    </SModal>
  );
}

export default MemoKeyModal;
