import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/constants/AppFunctions";
import { getCredentials, sessionKey, getSessionToken } from "@/utils/user";
import { useSession } from "next-auth/react";
import SAvatar from "../ui/SAvatar";
import SLink from "../ui/SLink";
import { Tab, Tabs } from "@heroui/tabs";
import Image from "next/image";
import { MdVpnKey } from "react-icons/md";
import KeychainLogin from "./authType/KeychainLogin";
import MemoLogin from "./authType/MemoLogin";
import KeyLogin from "./authType/KeyLogin";
import UnlockAcccount from "./authType/UnlockAccount";
import SModal from "../ui/SModal";
import ActiveKeyAuth from "./authType/ActiveKeyAuth";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onLoginSuccess?: (auth: User) => void;
  addNew?: boolean;
  addMemo?: boolean;
  requestActive?: boolean;
  onActiveSuccess?: (key: string) => void;
}

export default function AuthModal(props: Props) {
  let {
    isOpen,
    onLoginSuccess,
    addNew,
    onOpenChange,
    addMemo,
    requestActive,
    onActiveSuccess,
  } = props;
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const [credentials, setCredentials] = useState(getCredentials());
  const [useKeychain, setUseKeychain] = React.useState(true);
  const { data: session, status } = useSession();
  const isLocked =
    !!requestActive && credentials?.type !== "ACTIVE"
      ? false
      : (status === "authenticated" &&
          !credentials?.passwordless &&
          !sessionKey &&
          !credentials?.keychainLogin) ||
        (credentials?.type === "ACTIVE" &&
          !getSessionToken(session?.user?.name));

  useEffect(() => {
    setCredentials(getCredentials());
  }, [session?.user?.name]);

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modalProps={{
        scrollBehavior: "inside",
        isDismissable: false,
        hideCloseButton: true,
        size: "md",
        backdrop: requestActive || isLocked || addMemo ? "blur" : "opaque",
        placement: "top-center",
      }}
      title={() =>
        (isLocked && !addNew && !addMemo) || (requestActive && isLocked) ? (
          <div className=" flex flex-col gap-2">
            <p>Unlock your account</p>
            <div className="text-sm text-default-500 items-center flex flex-row gap-1">
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
                ) : requestActive ? (
                  "Sign Transaction"
                ) : (
                  "Log in"
                )}
              </p>
            </div>

            {!addMemo && !requestActive && (
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
                onSelectionChange={(key) => setUseKeychain(key === "keychain")}
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
        )
      }
      body={(onClose) => (
        <div className=" flex flex-col gap-4">
          {addMemo ? (
            <MemoLogin
              onClose={onClose}
              onSuccess={() => {}}
              onLoginSuccess={onLoginSuccess}
            />
          ) : (isLocked && !addNew && !addMemo) ||
            (requestActive && isLocked) ? (
            <UnlockAcccount
              onClose={onClose}
              onSuccess={() => {}}
              onLoginSuccess={onLoginSuccess}
            />
          ) : requestActive ? (
            <ActiveKeyAuth
              onClose={onClose}
              onActiveSuccess={onActiveSuccess}
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
      )}
    />
  );
}
