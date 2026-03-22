"use client";

import { useAppSelector } from "@/hooks/redux/store";
import { Button } from "@heroui/button";
import { Copy, ShieldCheck, Key, Check } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import RecoveryUpdateModal from "../wallet/RecoveryUpdateModal";
import SCard from "../ui/SCard";
import LoginAlertCard from "../ui/LoginAlertCard";
import { useTranslations } from "next-intl";

interface KeyRowProps {
  label: string;
  value: string;
}

const KeyRow = ({ label, value }: KeyRowProps) => {
  const t = useTranslations("SecuritySettings");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(t("publicKeys.copied", { label }));
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1 py-3 group">
      <div className="flex justify-between items-center ">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider">
          {label}
        </span>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={handleCopy}
          color={copied ? "success" : "primary"}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-sm font-mono break-all bg-default-100 p-2 rounded-lg flex-1">
          {value}
        </p>
      </div>
    </div>
  );
};

export default function SecuritySettings() {
  const t = useTranslations("SecuritySettings");
  const loginData = useAppSelector((s) => s.loginReducer.value);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!loginData.name) {
    return <LoginAlertCard text={t("loginAlert")} />;
  }

  const postingKey = loginData.posting_key_auths?.[0]?.[0] || "";
  const activeKey = loginData.active_key_auths?.[0]?.[0] || "";
  const ownerKey = loginData.owner_key_auths?.[0]?.[0] || "";
  const memoKey = loginData.memo_key || "";

  return (
    <div className="space-y-6">
      <SCard
        title={t("publicKeys.title")}
        icon={Key}
        className="card"
        iconColor="primary"
        iconSize="sm"
        description={t("publicKeys.description")}
      >
        <div className="flex flex-col divide-y divide-divider">
          <KeyRow label={t("publicKeys.posting")} value={postingKey} />
          <KeyRow label={t("publicKeys.active")} value={activeKey} />
          <KeyRow label={t("publicKeys.owner")} value={ownerKey} />
          <KeyRow label={t("publicKeys.memo")} value={memoKey} />
        </div>
      </SCard>

      <SCard
        title={t("recovery.title")}
        icon={ShieldCheck}
        className="card"
        iconColor="success"
        iconSize="sm"
        description={t("recovery.description")}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 card rounded-xl">
            <div>
              <p className="text-xs text-muted uppercase font-semibold">
                {t("recovery.current")}
              </p>
              <p className="font-semibold text-lg text-primary">
                @{loginData.recovery_account}
              </p>
            </div>
            <Button
              color="primary"
              variant="flat"
              onPress={() => setIsModalOpen(true)}
            >
              {t("recovery.change")}
            </Button>
          </div>

          <p className="text-sm text-muted">
            {t.rich("recovery.note", {
              b: (chunks) => <b>{chunks}</b>,
            })}
          </p>
        </div>
      </SCard>

      <RecoveryUpdateModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        currentRecovery={loginData.recovery_account}
      />
    </div>
  );
}
