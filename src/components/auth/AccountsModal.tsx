import { Button } from "@heroui/button";
import React from "react";
import { useLogin } from "./AuthProvider";
import AvailableAccountList from "./AvailableAccountList";
import SModal from "../ui/SModal";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  handleSwitchSuccess?: (User?: User) => void;
}

export default function AccountsModal(props: Props) {
  const { handleSwitchSuccess, isOpen, onOpenChange } = props;
  const { authenticateUser } = useLogin();
  const { t } = useLanguage();

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modalProps={{
        scrollBehavior: "inside",
        hideCloseButton: true,
        placement: "top-center",
        size:'xl'
      }}
      title={() => t("auth.accounts")}
      body={() => (
        <AvailableAccountList
          switchText={t("auth.switch")}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center"
          handleSwitchSuccess={(user) => {
            onOpenChange(false);
            handleSwitchSuccess && handleSwitchSuccess(user);
          }}
        />
      )}
      footer={(onClose) => (
        <>
          <Button color="danger" variant="light" onPress={onClose}>
            {t("common.cancel")}
          </Button>
          <Button color="primary" onPress={() => { onClose(); authenticateUser(true); }}>
            {t("auth.add_account")}
          </Button>
        </>
      )}
    />
  );
}
