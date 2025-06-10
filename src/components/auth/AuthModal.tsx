import React, { useEffect, useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { useAppSelector } from "@/constants/AppFunctions";
import { getCredentials, sessionKey, getSessionToken } from "@/utils/user";
import { useSession } from "next-auth/react";
import SAvatar from "../SAvatar";
import SLink from "../SLink";
import { Tab, Tabs } from "@heroui/tabs";
import Image from "next/image";
import { MdVpnKey } from "react-icons/md";
import KeychainLogin from "./authType/KeychainLogin";
import MemoLogin from "./authType/MemoLogin";
import KeyLogin from "./authType/KeyLogin";
import UnlockAcccount from "./authType/UnlockAccount";

interface Props {
  open: boolean;
  onClose: () => void;
  onLoginSuccess?: (auth: User) => void;
  addNew?: boolean;
  addMemo?: boolean;
}

export default function AuthModal(props: Props) {
  let { open, onLoginSuccess, addNew, onClose, addMemo } = props;
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const [credentials, setCredentials] = useState(getCredentials());
  const [useKeychain, setUseKeychain] = React.useState(true);
  const { data: session, status } = useSession();
  const isLocked =
    (status === "authenticated" &&
      !credentials?.passwordless &&
      !sessionKey &&
      !credentials?.keychainLogin) ||
    (credentials?.type === "ACTIVE" && !getSessionToken(session?.user?.name));

  useEffect(() => {
    setCredentials(getCredentials());
  }, [session?.user?.name]);

  return (
    <Modal
      className=" mt-4"
      scrollBehavior="inside"
      placement="top-center"
      size="md"
      backdrop={"opaque"}
      isOpen={open}
      hideCloseButton
      isDismissable={false}
      onClose={onClose}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="text-xl flex flex-col gap-1">
              {isLocked && !addNew && !addMemo ? (
                <div className=" flex flex-col gap-2">
                  <p>Unlock your account</p>
                  <div className="text-small text-default-500 items-center flex flex-row gap-1">
                    <p>to continue to</p>
                    <div className="flex items-center gap-2">
                      <SLink
                        className=" underline hover:text-blue-500"
                        href={`/@${loginInfo.name}`}
                      >
                        {loginInfo.name}
                      </SLink>
                      <SAvatar
                        username={loginInfo.name}
                        className="shadow-lg cursor-pointer bg-foreground-900/40"
                        size="xs"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className=" flex flex-col gap-1">
                  <div className=" flex flex-row gap-2 justify-between border-b border-default-200 dark:border-default-100 pb-4">
                    <p className="font-bold">
                      {addMemo ? (
                        <div className="flex items-center gap-2">
                          <p>SteemPro Chat</p>

                          <SAvatar
                            onlyImage
                            username={loginInfo.name}
                            className="shadow-lg cursor-pointer bg-foreground-900/40"
                            size="xs"
                          />
                        </div>
                      ) : (
                        "Log in"
                      )}
                    </p>
                  </div>

                  {!addMemo && (
                    <Tabs
                      aria-label="Options"
                      classNames={{
                        tabList: "gap-6 w-full relative rounded-none p-0",
                        cursor: "w-full bg-primary-300",
                        tab: " px-0 h-12",
                      }}
                      color="default"
                      variant="underlined"
                      fullWidth
                      onSelectionChange={(key) =>
                        setUseKeychain(key === "keychain")
                      }
                    >
                      <Tab
                        key="keychain"
                        title={
                          <div className="flex items-center space-x-2">
                            <Image
                              alt="keychain"
                              src={"/keychain_transparent.svg"}
                              height={38}
                              width={38}
                            />

                            <span>Keychain</span>
                          </div>
                        }
                      />
                      <Tab
                        key="password"
                        title={
                          <div className="flex items-center space-x-2">
                            <MdVpnKey size={24} />
                            <span>Private Key</span>
                          </div>
                        }
                      />
                    </Tabs>
                  )}
                </div>
              )}
            </ModalHeader>

            <ModalBody>
              <div className=" flex flex-col gap-4">
                {addMemo ? (
                  <MemoLogin
                    onClose={onClose}
                    onSuccess={() => {}}
                    onLoginSuccess={onLoginSuccess}
                  />
                ) : isLocked && !addNew && !addMemo ? (
                  <UnlockAcccount
                    onClose={onClose}
                    onSuccess={() => {}}
                    onLoginSuccess={onLoginSuccess}
                  />
                ) : useKeychain ? (
                  <KeychainLogin
                    addNew={addNew}
                    onClose={onClose}
                    onSuccess={() => {}}
                    onLoginSuccess={onLoginSuccess}
                  />
                ) : (
                  <KeyLogin
                    addNew={addNew}
                    onClose={onClose}
                    onSuccess={() => {}}
                    onLoginSuccess={onLoginSuccess}
                  />
                )}
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
