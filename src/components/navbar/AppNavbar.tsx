"use client";

import { useDisclosure } from "@heroui/modal";

import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { Divider } from "@heroui/divider";

import Image from "next/image";
import React, { useMemo, useState } from "react";
import {
  FaRegBell,
  FaCoins,
  FaUserCircle,
  FaWallet,
  FaUnlock,
  FaLock,
} from "react-icons/fa";
import { IoFlash, IoLogOut } from "react-icons/io5";
import { LuPencilLine } from "react-icons/lu";
import { MdOutlineRefresh, MdSearch } from "react-icons/md";
import { PiUserSwitchFill } from "react-icons/pi";
import { BorderColorMap } from "../auth/AccountItemCard";
import { useAppSelector, useAppDispatch } from "@/constants/AppFunctions";
import { logoutHandler } from "@/hooks/redux/reducers/LoginReducer";
import {
  sessionKey,
  getSessionToken,
  getCredentials,
  saveSessionKey,
  removeSessionToken,
  getSessionKey,
  removeCredentials,
} from "@/utils/user";
import { signIn, signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { useLogin } from "../auth/AuthProvider";
import AppDrawer from "./components/Drawer";
import AccountsModal from "../auth/AccountsModal";
import NotificationsModal from "../NotificationsModal";
import SAvatar from "../ui/SAvatar";
import { twMerge } from "tailwind-merge";
import SLink from "../ui/SLink";
import { AsyncUtils } from "@/utils/async.utils";
import { Spinner } from "@heroui/spinner";
import { mutate } from "swr";
import SModal from "../ui/SModal";
import { SearchModal } from "../SearchModal";
// import Lottie from "lottie-react";
// import giftAnimation from "@/assets/gift_anim.json";

export async function refreshData(username?: string | null) {
  mutate("/steem_requests_api/getSteemProps");
  if (username) {
    mutate([username, "null"]);
    mutate(`unread-chat-${username}`);
    mutate(`unread-notification-count-${username}`);
  }
}

function AppNavbar() {
  const { authenticateUser, isAuthorized, credentials, setCredentials } =
    useLogin();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [isPopOpen, setIsPopOpen] = React.useState(false);
  const accountDisclosure = useDisclosure();
  const notiDisclosure = useDisclosure();
  // const crateDisclosure = useDisclosure();

  const searchDisclosure = useDisclosure();
  const dispatch = useAppDispatch();
  const [isLocked, setLocked] = useState(
    isAuthenticated && !sessionKey && !getSessionToken(session.user?.name)
  );
  const logoutDisclosure = useDisclosure();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const commonData = useAppSelector((state) => state.commonReducer.values);

  // validate the local storage auth
  useMemo(async () => {
    const credentials = getCredentials();
    if (isAuthenticated) {
      if (!sessionKey && !getSessionToken(session.user?.name)) {
        setLocked(true);
      } else {
        setLocked(false);
      }
      if (!credentials?.username) {
        await signOut();
      }
    }

    if (status === "unauthenticated" && !!credentials?.username) {
      await signIn("credentials", {
        username: credentials.username,
        redirect: false,
      });
    }
  }, [status, isAuthorized()]);

  function handleLogin() {
    authenticateUser();
  }

  function handleUnlock() {
    if (isLocked) {
      authenticateUser();
      if (isAuthorized()) {
        setLocked(false);
      }
    } else {
      saveSessionKey("");
      setLocked(true);
      toast.success("Locked");
      removeSessionToken(credentials?.username);
    }
  }

  function handleItemClick() {
    if (isPopOpen) setIsPopOpen(false);
  }

  async function handleLogout() {
    authenticateUser();
    if (!isAuthorized()) {
      return;
    }

    setLogoutLoading(true);

    const credentials = getCredentials(getSessionKey(session?.user?.name));
    if (!credentials?.key) {
      toast.error("Invalid credentials");
      setLogoutLoading(false);
      return;
    }

    removeCredentials(credentials);
    dispatch(logoutHandler());
    // simulate for two seconds
    await AsyncUtils.sleep(2);
    await signOut();
    setLogoutLoading(false);
    toast.success(`${credentials.username} logged out successfully`);
  }

  return (
    <nav className="z-50 sticky top-0 flex-no-wrap flex w-full items-center justify-between py-2 shadow-md dark:shadow-white/5 lg:flex-wrap lg:justify-start h-16 bg-transparent backdrop-blur-md">
      <div className="flex w-full flex-wrap items-center justify-between px-4">
        {/* <!-- Hamburger button for mobile view --> */}
        <div className=" flex flex-row gap-2 items-center">
          <AppDrawer
            onAccountSwitch={accountDisclosure.onOpen}
            handleLogout={logoutDisclosure.onOpen}
          />
          <SLink href={"/"} className="hidden lg:block">
            <Image
              src={"/logo-default.png"}
              alt="logo"
              priority
              height={40}
              width={160}
              style={{ height: "auto" }}
            />
          </SLink>
          <SLink href={"/"} className="block lg:hidden">
            <Image
              priority
              src={"/logo192.png"}
              alt="logo"
              height={40}
              width={40}
            />
          </SLink>
        </div>
        {/* <!-- Right elements --> */}
        <div className="relative flex items-center">
          <div className="flex flex-row gap-4 items-center">
            <Input
              radius="full"
              className="hidden 1md:block"
              classNames={{
                inputWrapper:
                  "text-default-500 bg-default-400/20 dark:bg-default-500/20",
              }}
              placeholder="Search"
              size="md"
              isReadOnly
              endContent={
                <MdSearch onClick={searchDisclosure.onOpen} size={20} />
              }
              type="search"
              onClick={searchDisclosure.onOpen}
            />
            <Button
              size="sm"
              isIconOnly
              radius="md"
              variant="light"
              className="1md:hidden"
              onPress={searchDisclosure.onOpen}
            >
              <MdSearch size={24} className="text-default-600 " />
            </Button>

            {/* {isAuthenticated && (
              <Button
                size="sm"
                variant="light"
                isIconOnly
                onPress={crateDisclosure.onOpen}
              >
                <Lottie style={{ height: 40 }} animationData={giftAnimation} />
              </Button>
            )} */}

            <Button
              as={SLink}
              size="sm"
              isIconOnly
              radius="md"
              variant="light"
              href="/submit"
            >
              <LuPencilLine size={24} className="text-default-600" />
            </Button>
            {isAuthenticated && (
              <Badge
                size="sm"
                content={
                  commonData.unread_count + commonData.unread_count_chat > 0
                    ? ""
                    : undefined
                }
                showOutline={
                  commonData.unread_count + commonData.unread_count_chat > 0
                }
                // content={
                //   loginInfo.unread_count > 99
                //     ? "99+"
                //     : loginInfo.unread_count > 0 && loginInfo.unread_count
                // }
                className={twMerge(
                  " z-0",
                  commonData.unread_count_chat > 0 &&
                    "border-green-400 animate-pulse border-[2px]"
                )}
                color={"primary"}
                shape="circle"
                placement="top-right"
              >
                <Button
                  variant="light"
                  onPress={notiDisclosure.onOpen}
                  radius="md"
                  isIconOnly
                  size="sm"
                >
                  <FaRegBell size={24} className="text-default-600" />
                </Button>
              </Badge>
            )}
            {!isAuthenticated && (
              <Button
                isIconOnly={status !== "unauthenticated"}
                radius="lg"
                variant="flat"
                color="success"
                onPress={handleLogin}
                size="md"
                isDisabled={status === "loading"}
                isLoading={status === "loading"}
              >
                Login
              </Button>
            )}
            {isAuthenticated && (
              <Popover
                placement="top"
                color="default"
                shouldCloseOnBlur={false}
                isOpen={isPopOpen}
                onOpenChange={(open) => setIsPopOpen(open)}
              >
                <PopoverTrigger>
                  <div className="z-0">
                    <SAvatar
                      onlyImage
                      borderColor={
                        credentials?.type
                          ? BorderColorMap[credentials.type]
                          : undefined
                      }
                      username={session?.user?.name ?? ""}
                      className={twMerge(
                        "shadow-lg cursor-pointer bg-foreground-900/40 border-2 p-[1px]"
                      )}
                      size="sm"
                      loadSize="medium"
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <div className=" flex flex-col gap-1 px-2 py-2">
                    <div className="flex justify-between gap-2 w-full">
                      <div
                        title="Voting power"
                        className="flex items-center gap-1 bg-foreground/10 px-1 rounded-full"
                      >
                        <p className=" text-tiny opacity-80">
                          <IoFlash />
                        </p>
                        <p>
                          {loginInfo.upvote_mana_percent?.toLocaleString()}%
                        </p>
                      </div>

                      <div
                        title="Resource credits"
                        className="flex items-center gap-1 bg-foreground/10 px-1 rounded-full"
                      >
                        <p className=" text-tiny opacity-80">
                          <FaCoins />
                        </p>
                        <p>{loginInfo.rc_mana_percent?.toLocaleString()}%</p>
                      </div>

                      <Button
                        className=" min-h-0 min-w-0 w-6 h-6"
                        onPress={() => refreshData(session?.user?.name)}
                        isIconOnly
                        size="sm"
                        radius="full"
                      >
                        {commonData.isLoadingAccount ? (
                          <Spinner size="sm" color="current" />
                        ) : (
                          <MdOutlineRefresh size={18} />
                        )}
                      </Button>
                    </div>

                    <Divider className=" mt-2" />
                    <Button
                      size="md"
                      variant="light"
                      className="w-full justify-start items-center px-1"
                      as={SLink}
                      href={`/@${session?.user?.name}`}
                      onPress={handleItemClick}
                      startContent={<FaUserCircle className="text-xl" />}
                    >
                      Profile{" "}
                      <span className=" text-default-500">
                        ({session?.user?.name})
                      </span>
                    </Button>

                    <Button
                      size="md"
                      variant="light"
                      className="w-full justify-start items-center px-1"
                      as={SLink}
                      href={`/@${session?.user?.name}/wallet`}
                      onPress={handleItemClick}
                      startContent={<FaWallet className="text-xl" />}
                    >
                      Wallet
                    </Button>

                    {!credentials?.passwordless &&
                      !credentials?.keychainLogin && (
                        <Button
                          className="w-full justify-start items-center px-1"
                          size="md"
                          variant="light"
                          onPress={() => {
                            handleUnlock();
                            handleItemClick();
                          }}
                          startContent={
                            isLocked ? (
                              <FaUnlock className="text-xl" />
                            ) : (
                              <FaLock className="text-xl" />
                            )
                          }
                        >
                          {isLocked ? "Unlock" : "Lock"} Account
                        </Button>
                      )}
                    <Button
                      className="w-full justify-start items-center px-1"
                      size="md"
                      variant="light"
                      onPress={() => {
                        accountDisclosure.onOpen();
                        handleItemClick();
                      }}
                      startContent={<PiUserSwitchFill className="text-xl" />}
                    >
                      Switch/Add Account
                    </Button>

                    <Button
                      className="w-full justify-start items-center px-1 text-foreground"
                      size="md"
                      variant="light"
                      color="danger"
                      onPress={() => {
                        logoutDisclosure.onOpen();
                        handleItemClick();
                      }}
                      startContent={<IoLogOut className="text-xl" />}
                    >
                      Logout
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
        <SearchModal
          isOpen={searchDisclosure.isOpen}
          onOpenChange={searchDisclosure.onOpenChange}
        />

        {accountDisclosure.isOpen && (
          <AccountsModal
            isOpen={accountDisclosure.isOpen}
            onOpenChange={accountDisclosure.onOpenChange}
            handleSwitchSuccess={(user) => {
              if (user) {
                setCredentials(user);
              }
            }}
          />
        )}
        <NotificationsModal
          isOpen={notiDisclosure.isOpen}
          onOpenChange={notiDisclosure.onOpenChange}
          username={session?.user?.name ?? "null"}
        />
      </div>

      <SModal
        isOpen={logoutDisclosure.isOpen}
        onOpenChange={logoutDisclosure.onOpenChange}
        modalProps={{ hideCloseButton: true, isDismissable: !logoutLoading }}
        title={() => "Confirmation"}
        subTitle={() => (
          <p>Do you really want to logout {session?.user?.name}?</p>
        )}
        footer={(onClose) => (
          <>
            <Button
              color="default"
              isDisabled={logoutLoading}
              variant="light"
              onPress={onClose}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              isLoading={logoutLoading}
              className="text-white"
              onPress={() => {
                handleLogout();
              }}
            >
              Logout
            </Button>
          </>
        )}
        body={(onClose) => <></>}
      />

      {/* <SModal
        modalProps={{
          size: "2xl",
          scrollBehavior: "inside",
          hideCloseButton: true,
          placement: "center",
          backdrop: "blur",
        }}
        shouldDestroy
        isOpen={crateDisclosure.isOpen}
        onOpenChange={crateDisclosure.onOpenChange}
        body={() => <CrateCard />}
        footer={(onClose) => (
          <Button color="danger" variant="flat" onPress={onClose}>
            Cancel
          </Button>
        )}
      /> */}
    </nav>
  );
}

export default AppNavbar;
