import {
  useDisclosure,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";

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
import { MdSearch } from "react-icons/md";
import { PiUserSwitchFill } from "react-icons/pi";
import { BorderColorMap } from "../auth/AccountItemCard";
import { useAppSelector, useAppDispatch } from "@/libs/constants/AppFunctions";
import { logoutHandler } from "@/libs/redux/reducers/LoginReducer";
import {
  sessionKey,
  getSessionToken,
  getCredentials,
  saveSessionKey,
  removeSessionToken,
  getSessionKey,
  removeCredentials,
} from "@/libs/utils/user";
import { signIn, signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { useLogin } from "../auth/AuthProvider";
import AppDrawer from "./components/Drawer";
import AccountsModal from "../auth/AccountsModal";
import NotificationsModal from "../NotificationsModal";
import SearchModal from "../SearchModal";
import SAvatar from "../SAvatar";
import { twMerge } from "tailwind-merge";
import SLink from "../SLink";
import { AsyncUtils } from "@/libs/utils/async.utils";

function AppNavbar() {
  const { authenticateUser, isAuthorized, credentials, setCredentials } =
    useLogin();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const { data: session, status } = useSession();
  const [isPopOpen, setIsPopOpen] = React.useState(false);
  const accountDisclosure = useDisclosure();
  const notiDisclosure = useDisclosure();
  const searchDisclosure = useDisclosure();
  const dispatch = useAppDispatch();
  const [isLocked, setLocked] = useState(
    status === "authenticated" &&
      !sessionKey &&
      !getSessionToken(session.user?.name)
  );
  const logoutDisclosure = useDisclosure();
  const [logoutLoading, setLogoutLoading] = useState(false);

  // validate the local storage auth
  useMemo(async () => {
    const credentials = getCredentials();
    if (status === "authenticated") {
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

            {status === "authenticated" && (
              <Badge
                size="sm"
                content={loginInfo.unread_count ? "" : undefined}
                // content={
                //   loginInfo.unread_count > 99
                //     ? "99+"
                //     : loginInfo.unread_count > 0 && loginInfo.unread_count
                // }
                className="opacity-80 z-0"
                color="primary"
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

            {status !== "authenticated" && (
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

            {status === "authenticated" && (
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
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <div className=" flex flex-col gap-1 px-2 py-2">
                    <div className="flex justify-between gap-2 w-full">
                      <div
                        title="Voting power"
                        className="flex items-center gap-1 bg-foreground/10 px-1 rounded-lg"
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
                        className="flex items-center gap-1 bg-foreground/10 px-1 rounded-lg"
                      >
                        <p className=" text-tiny opacity-80">
                          <FaCoins />
                        </p>
                        <p>{loginInfo.rc_mana_percent?.toLocaleString()}%</p>
                      </div>
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
                      Profile
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
          onClose={searchDisclosure.onClose}
        />

        {accountDisclosure.isOpen && (
          <AccountsModal
            isOpen={accountDisclosure.isOpen}
            onClose={accountDisclosure.onClose}
            handleSwitchSuccess={(user) => {
              if (user) setCredentials(user);
            }}
          />
        )}
        <NotificationsModal
          onOpen={notiDisclosure.isOpen}
          onClose={notiDisclosure.onClose}
          username={session?.user?.name ?? ""}
        />
      </div>

      {logoutDisclosure.isOpen && (
        <Modal
          isOpen={logoutDisclosure.isOpen}
          onClose={logoutDisclosure.onClose}
          size="md"
          hideCloseButton
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Confirmation
                </ModalHeader>
                <ModalBody>
                  <p>Do you really want to logout {loginInfo.name}?</p>
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="danger"
                    isLoading={logoutLoading}
                    isDisabled={logoutLoading}
                    onPress={() => {
                      handleLogout();
                    }}
                  >
                    Logout
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </nav>
  );
}

export default AppNavbar;
