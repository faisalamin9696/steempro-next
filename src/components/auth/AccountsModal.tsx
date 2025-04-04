import { getAllCredentials } from "@/libs/utils/user";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import React, { useEffect, useState } from "react";
import { useLogin } from "./AuthProvider";
import AccountItemCard from "./AccountItemCard";
import { secureDecrypt } from "@/libs/utils/encryption";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  handleSwitchSuccess?: (User?: User) => void;
}

export default function AccountsModal(props: Props) {
  const { handleSwitchSuccess, isOpen, onClose } = props;
  const [accounts, setAccounts] = useState<User[]>();
  const [defaultAcc, setDefaultAcc] = useState<User>();
  const [isShow, setIsShow] = useState(true);
  const { authenticateUser } = useLogin();
  const STORAGE_KEY = "@secure.j.auth";

  useEffect(() => {
    const credentialsString = secureDecrypt(
      localStorage.getItem(STORAGE_KEY) ?? "",
      process.env.NEXT_PUBLIC_SECURE_LOCAL_STORAGE_HASH_KEY
    );
    const credentials = JSON.parse(credentialsString || `{}`) as User;
    if (!!credentials && credentials?.username) {
      setDefaultAcc(credentials);
      const allCredentials = getAllCredentials();

      // Find the index of the object with the username
      const index = allCredentials.findIndex(
        (account) =>
          account.username === credentials.username &&
          account.type === credentials.type
      );
      if (index !== -1) {
        const activeAccount = allCredentials.splice(index, 1)[0];
        allCredentials.unshift(activeAccount);
      }
      setAccounts(allCredentials);
    }

    const timeOut = setTimeout(() => {
      setIsShow(false);
    }, 1000);

    return () => clearTimeout(timeOut);
  }, []);

  return (
    <Modal
      placement="top-center"
      className=" mt-4"
      isOpen={isOpen}
      onOpenChange={onClose}
      scrollBehavior={"inside"}
      hideCloseButton
    >
      <ModalContent>
        {(onClose) => (
          <>
            {isShow ? (
              <Spinner className=" self-center m-auto p-4" />
            ) : (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Accounts
                </ModalHeader>
                <ModalBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
                    {accounts?.map((user) => {
                      return (
                        <AccountItemCard
                          key={`${user.username}-${user.type}`}
                          user={user}
                          defaultAccount={defaultAcc}
                          handleSwitchSuccess={(user) => {
                            handleSwitchSuccess && handleSwitchSuccess(user);
                            onClose();
                          }}
                        />
                      );
                    })}
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="primary"
                    onPress={() => {
                      onClose();
                      authenticateUser(true);
                    }}
                  >
                    Add Account
                  </Button>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
