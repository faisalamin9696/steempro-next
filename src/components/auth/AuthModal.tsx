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
import PrivateKeyAuth from "./authType/PrivateKeyAuth";
import { BsQrCode } from "react-icons/bs";
import SteemAuthLogin from "./authType/SteemAuthLogin";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onLoginSuccess?: (auth: User) => void;
  addNew?: boolean;
  addMemo?: boolean;
  requestActive?: boolean;
  onActiveSuccess?: (key: string) => void;
  keyType: Keys;
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
    keyType,
  } = props;
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const [credentials, setCredentials] = useState(getCredentials());
  const [loginMethod, setLoginMethod] = useState<
    "password" | "keychain" | "mobile"
  >("keychain");
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
        size: "xl",
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
          <div className="font-bold">
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
              "Login"
            )}
          </div>
        )
      }
      body={(onClose) => (
        <div className=" flex flex-col gap-4">
          {!addMemo && !requestActive && (
            <Tabs
              aria-label="Options"
              classNames={{
                tabList: "gap-6 w-full relative rounded-none p-0",
                cursor: "w-full bg-primary-300",
                tab: " px-0 h-12",
              }}
              destroyInactiveTabPanel={false}
              color="default"
              variant="underlined"
              fullWidth
              onSelectionChange={(key) => setLoginMethod(key.toString() as any)}
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
              >
                <KeychainLogin
                  addNew={addNew}
                  onClose={onClose}
                  onSuccess={() => {}}
                  onLoginSuccess={onLoginSuccess}
                />
              </Tab>

              <Tab
                key="password"
                title={
                  <div className="flex items-center space-x-2">
                    <MdVpnKey size={24} />
                    <span>Private Key</span>
                  </div>
                }
              >
                <KeyLogin
                  addNew={addNew}
                  onClose={onClose}
                  onSuccess={() => {}}
                  onLoginSuccess={onLoginSuccess}
                />
              </Tab>
              {/* <Tab
                  key="mobile"
                  title={
                    <div className="flex items-center space-x-2">
                      <BsQrCode size={24} />
                      <span>SteemAuth</span>
                    </div>
                  }
                /> */}
            </Tabs>
          )}

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
          ) : (
            requestActive && (
              <PrivateKeyAuth
                type={keyType}
                onClose={onClose}
                onActiveSuccess={onActiveSuccess}
              />
            )
          )}
        </div>
      )}
    />
  );
}
