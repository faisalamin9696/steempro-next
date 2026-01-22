import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { Chip } from "@heroui/chip";
import SAvatar from "../ui/SAvatar";
import { useAccountsContext } from "./AccountsContext";
import SModal from "../ui/SModal";
import { useState } from "react";
import { Check, Lock, LockOpen, Trash2 } from "lucide-react";
import Image from "next/image";
import moment from "moment";

const AccountCard = ({
  account,
  isActive,
  onSwitch,
  onRemove,
  isDisabled,
}: {
  account: LocalAccount;
  isActive: boolean;
  onSwitch: () => void;
  onRemove: () => void;
  isDisabled?: boolean;
}) => {
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  return (
    <Card
      className={`flex flex-col items-start p-3 hover:bg-content2/50 transition-all duration-300 cursor-pointer hover:border-primary/50 ${
        isActive ? "border-primary border-2 bg-primary/5" : "border-border"
      }`}
      onPress={onSwitch}
      isPressable
      fullWidth
      isDisabled={isDisabled}
      as={"div"}
    >
      <div className="flex flex-wrap items-start gap-4 justify-between w-full">
        <div className="flex items-start gap-4">
          <div className="relative">
            <SAvatar size={60} username={account.username} />
            {account.loginMethod === "keychain" && (
              <Chip
                color="primary"
                variant="solid"
                size="sm"
                className="absolute -bottom-1 -right-2"
              >
                <Image
                  height={18}
                  width={18}
                  src="/keychain.svg"
                  alt="Keychain"
                />
              </Chip>
            )}

            {account.loginMethod === "private-key" && account.encrypted && (
              <Chip color="primary" className="absolute -bottom-1 -right-1 ">
                <Lock size={18} />
              </Chip>
            )}

            {account.loginMethod === "private-key" && !account.encrypted && (
              <Chip color="warning" className="absolute -bottom-1 -right-1 ">
                <LockOpen size={18} />
              </Chip>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">@{account.username}</h3>
              {isActive && (
                <div className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-0.5 rounded-xl text-xs font-medium">
                  <Check className="h-3 w-3" />
                  Active
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-1 items-start">
              <p className="text-xs text-muted">
                Method:{" "}
                <span className="capitalize">
                  {account.type ?? account.loginMethod}
                </span>
              </p>
              <p className="text-xs text-muted">
                Security: {account.encrypted ? "Pin Protected" : "Standard"}
              </p>

              <p className="text-xs text-muted">
                Added: {moment(account.createdAt).fromNow()}
              </p>
            </div>
          </div>
        </div>

        {!isActive && (
          <Button
            isIconOnly
            color="danger"
            variant="light"
            size="md"
            onPress={() => setShowRemoveModal(true)}
            className="text-muted hover:text-danger"
            isDisabled={isDisabled}
          >
            <Trash2 size={20} />
          </Button>
        )}
        <SModal
          isOpen={showRemoveModal}
          onOpenChange={setShowRemoveModal}
          title="Remove Account"
          description={`Are you sure you want to remove @${account.username}? This action cannot be undone.`}
        >
          {(onClose) => (
            <div className="flex flex-row gap-2 self-end">
              <Button variant="flat" onPress={onClose}>
                Cancel
              </Button>

              <Button variant="solid" color="danger" onPress={onRemove}>
                Remove
              </Button>
            </div>
          )}
        </SModal>
      </div>
    </Card>
  );
};

export const AccountsList = () => {
  const { accounts, current, switchAccount, removeAccount, isPending } =
    useAccountsContext();

  if (accounts.length === 0) {
    return (
      <div className="rounded-xl p-8 text-center border border-dashed border-default-300 mt-4 text-muted">
        <p className="text-muted mb-2">No accounts connected</p>
        <p className="text-sm text-muted">Click "Add Account" to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {accounts.map((account) => (
        <AccountCard
          key={account.username}
          account={account}
          isDisabled={isPending}
          isActive={
            current?.username === account.username &&
            current.type === account.type
          }
          onSwitch={() => switchAccount(account.username, account.type)}
          onRemove={() => removeAccount(account.username, account.type)}
        />
      ))}
    </div>
  );
};
