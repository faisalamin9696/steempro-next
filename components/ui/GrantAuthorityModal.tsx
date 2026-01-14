"use client";

import { Alert, Button } from "@heroui/react";
import SModal from "./SModal";
import { ModalProps } from "@heroui/modal";
import { Shield } from "lucide-react";

interface Props extends Pick<ModalProps, "isOpen" | "onOpenChange"> {
  onConfirm: () => void;
  isPending?: boolean;
}

export default function GrantAuthorityModal({
  onConfirm,
  isPending,
  ...props
}: Props) {
  return (
    <SModal
      {...props}
      title="Grant Scheduling Permission"
      description="To schedule your post, you need to grant 'steempro.com' permission to post on your behalf."
    >
      {(onClose) => (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 text-sm text-muted-foreground">
            <Alert
              color="success"
              variant="faded"
              icon={<Shield size={20} />}
              description={
                <p>
                  <strong>Your keys are safe.</strong> This is a one-time grant
                  that adds 'steempro.com' as an authorized account for posting
                  only.
                </p>
              }
            />

            <p>
              You can remove this permission at any time through your account
              settings. Removing it will cause any future scheduled posts to
              fail.
            </p>
          </div>

          <div className="flex flex-row gap-2 self-end">
            <Button variant="light" onPress={onClose} isDisabled={isPending}>
              Cancel
            </Button>
            <Button color="primary" onPress={onConfirm} isLoading={isPending}>
              Grant Permission
            </Button>
          </div>
        </div>
      )}
    </SModal>
  );
}
