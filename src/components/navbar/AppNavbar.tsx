"use client";

import { useDisclosure } from "@heroui/modal";

import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";

import Image from "next/image";
import React, { useMemo, useState } from "react";
import {
  FaRegBell,
  FaUserCircle,
  FaWallet,
  FaUnlock,
  FaLock,
  FaPlus,
} from "react-icons/fa";
import { MdSearch } from "react-icons/md";
import { BorderColorMap } from "../auth/AccountItemCard";
import { useAppSelector } from "@/constants/AppFunctions";
import {
  sessionKey,
  getSessionToken,
  getCredentials,
  saveSessionKey,
  removeSessionToken,
} from "@/utils/user";
import { signIn, signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { useLogin } from "../auth/AuthProvider";
import AppDrawer from "./components/Drawer";
import NotificationsModal from "../NotificationsModal";
import SAvatar from "../ui/SAvatar";
import { twMerge } from "tailwind-merge";
import SLink from "../ui/SLink";
import { mutate } from "swr";
import { SearchModal } from "../SearchModal";
import LogoutButton from "../LogoutButton";
import { PiUserSwitchFill } from "react-icons/pi";
import AccountsModal from "../auth/AccountsModal";
import { FiLogIn } from "react-icons/fi";
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
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [isPopOpen, setIsPopOpen] = React.useState(false);
  const accountDisclosure = useDisclosure();
  const notiDisclosure = useDisclosure();
  // const crateDisclosure = useDisclosure();
  const searchDisclosure = useDisclosure();
  const [isLocked, setLocked] = useState(
    isAuthenticated && !sessionKey && !getSessionToken(session.user?.name)
  );
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

  return (
    <nav className="z-50 sticky top-0 flex-no-wrap flex w-full items-center justify-between py-2 shadow-md dark:shadow-white/5 lg:flex-wrap lg:justify-start h-16 bg-transparent backdrop-blur-md">
      <div className="flex w-full flex-wrap items-center justify-between px-4">
        {/* <!-- Hamburger button for mobile view --> */}
        <div className=" flex flex-row gap-2 items-center">
          <AppDrawer />
          <SLink href={"/"} className="hidden lg:block">
            <Image
              src={"/logo-default.png"}
              alt="logo"
              priority
              height={30}
              width={150}
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
        <div className="relative flex items-center gap-3">
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

          <div className="flex flex-row gap-3 items-center">
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

            <Button
              as={SLink}
              href={"/submit"}
              className="hidden md:flex"
              radius="full"
              color="primary"
              variant="flat"
              startContent={<FaPlus />}
            >
              Create
            </Button>

            {isAuthenticated && (
              <div className="hidden md:block">
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
                    "z-0",
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
                    radius="full"
                    isIconOnly
                    size="md"
                  >
                    <FaRegBell size={24} className="text-default-600" />
                  </Button>
                </Badge>
              </div>
            )}

            {!isAuthenticated && (
              <Button
                className="hidden md:flex"
                isIconOnly={status !== "unauthenticated"}
                radius="full"
                variant="flat"
                color="success"
                onPress={handleLogin}
                size="md"
                isDisabled={status === "loading"}
                isLoading={status === "loading"}
                startContent={<FiLogIn />}
              >
                Login
              </Button>
            )}

            {isAuthenticated && (
              <div>
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
                      <Button
                        size="md"
                        variant="light"
                        className="w-full justify-start items-center"
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
                        className="w-full justify-start items-center"
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
                            className="w-full justify-start items-center"
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
                        className="w-full justify-start items-center"
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
                      <LogoutButton />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </div>
        <SearchModal
          isOpen={searchDisclosure.isOpen}
          onOpenChange={searchDisclosure.onOpenChange}
        />

        <NotificationsModal
          isOpen={notiDisclosure.isOpen}
          onOpenChange={notiDisclosure.onOpenChange}
          username={session?.user?.name ?? "null"}
        />
      </div>

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
