"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectItem,
} from "@heroui/select";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Role } from "@/utils/community";
import SModal from "@/components/ui/SModal";

interface RoleTitleModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onUpdate: (role: string, title: string) => Promise<void>;
  currentRole: string;
  currentTitle: string;
  observerRole: string;
  username: string;
  isPending?: boolean;
}

const RoleTitleModal = ({
  isOpen,
  onOpenChange,
  onUpdate,
  currentRole,
  currentTitle,
  observerRole,
  username,
  isPending = false,
}: RoleTitleModalProps) => {
  const [role, setRole] = useState(currentRole || "guest");
  const [title, setTitle] = useState(currentTitle || "");

  useEffect(() => {
    if (isOpen) {
      setRole(currentRole || "guest");
      setTitle(currentTitle || "");
    }
  }, [isOpen, currentRole, currentTitle]);

  const observerLevel = Role.level(observerRole);

  const availableRoles = Role.LEVELS.map((r) => ({
    label: r.charAt(0).toUpperCase() + r.slice(1),
    value: r,
    isDisabled: Role.level(r) >= observerLevel,
  }));

  const handleUpdate = async () => {
    await onUpdate(role, title);
  };

  return (
    <SModal
      title={`Update Role & Title for ${username}`}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      {(onClose) => (
        <div className="flex flex-col gap-6">
          {
            <Select
              label="Community Role"
              placeholder="Select a role"
              selectedKeys={[role]}
              onSelectionChange={(keys) =>
                setRole(Array.from(keys)[0] as string)
              }
              isDisabled={Role.level(observerRole) <= Role.level(currentRole)}
              isLoading={isPending}
              disabledKeys={availableRoles
                .filter((item) => item.isDisabled)
                .map((item) => item.value)}
            >
              {availableRoles.map((item) => (
                <SelectItem
                  key={item.value}
                  description={
                    item.isDisabled ? "Insufficient permissions" : undefined
                  }
                >
                  {item.label}
                </SelectItem>
              ))}
            </Select>
          }
          <Input
            label="User Title"
            placeholder="Enter title (e.g. Moderator)"
            value={title}
            onValueChange={setTitle}
            isDisabled={isPending}
          />

          <div className="flex flex-row gap-2 self-end">
            <Button variant="light" onPress={onClose} isDisabled={isPending}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleUpdate}
              isLoading={isPending}
            >
              Update
            </Button>
          </div>
        </div>
      )}
    </SModal>
  );
};

export default RoleTitleModal;
