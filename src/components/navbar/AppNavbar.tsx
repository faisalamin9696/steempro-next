"use client";

import React, { useMemo, useState } from "react";
import { Navbar, NavbarBrand, NavbarContent } from "@nextui-org/navbar";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import { Button } from "@nextui-org/button";
import { Badge } from "@nextui-org/badge";
import { LuPencilLine } from "react-icons/lu";
import { useLogin } from "../auth/AuthProvider";
import { useAppDispatch, useAppSelector } from "@/libs/constants/AppFunctions";
import {
  getCredentials,
  getSessionKey,
  getSessionToken,
  removeCredentials,
  removeSessionToken,
  saveSessionKey,
  sessionKey,
} from "@/libs/utils/user";
import { getResizedAvatar } from "@/libs/utils/image";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import AccountsModal from "../auth/AccountsModal";
import AppDrawer from "./components/Drawer";
import NotificationsModal from "../NotificationsModal";
import {
  FaCoins,
  FaEdgeLegacy,
  FaLock,
  FaRegBell,
  FaUnlock,
  FaUserCircle,
  FaWallet,
} from "react-icons/fa";
import Link from "next/link";
import { Avatar } from "@nextui-org/avatar";
import { toast } from "sonner";
import SearchModal from "../SearchModal";
import { MdSearch } from "react-icons/md";
import { Input } from "@nextui-org/input";
import "./style.scss";
import { PiUserSwitchFill } from "react-icons/pi";
import { keysColorMap } from "../auth/AccountItemCard";
import {
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { IoFlash, IoLogOut } from "react-icons/io5";
import { logoutHandler } from "@/libs/redux/reducers/LoginReducer";
import { addCommentHandler } from "@/libs/redux/reducers/CommentReducer";

export default function AppNavbar() {
  const { authenticateUser, isAuthorized, credentials, setCredentials } =
    useLogin();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const { data: session, status } = useSession();
  const [isPopOpen, setIsPopOpen] = React.useState(false);
  const [isAccOpen, setIsAccOpen] = React.useState(false);
  const [notificationPopup, setNotificationPopup] = useState(false);
  const dispatch = useAppDispatch();
  const [isLocked, setLocked] = useState(
    status === "authenticated" &&
      !sessionKey &&
      !getSessionToken(session.user?.name)
  );
  const [searchModal, setSearchModal] = useState(false);
  const { isOpen, onOpenChange } = useDisclosure();

  // validate the local storage auth
  useMemo(() => {
    const credentials = getCredentials();
    if (status === "authenticated") {
      if (!sessionKey && !getSessionToken(session.user?.name)) {
        setLocked(true);
      } else {
        setLocked(false);
      }
      if (!credentials?.username) {
        signOut();
      }
    }

    if (status === "unauthenticated" && !!credentials?.username) {
      signIn("credentials", {
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

  function handleLogout() {
    authenticateUser();
    if (!isAuthorized()) {
      return;
    }

    const credentials = getCredentials(getSessionKey(session?.user?.name));
    if (!credentials?.key) {
      toast.error("Invalid credentials");
      return;
    }

    removeCredentials(credentials);
    dispatch(logoutHandler());
    signOut();
    toast.success(`${credentials.username} logged out successfully`);
  }

  return (
    <Navbar
      className="shadow-xl w-full h-16  !px-0 !p-0"
      shouldHideOnScroll={false}
    >
      <NavbarContent justify="start" className=" !grow-0">
        <AppDrawer
          onAccountSwitch={() => setIsAccOpen(!isAccOpen)}
          handleLogout={onOpenChange}
        />
      </NavbarContent>

      <NavbarBrand className="">
        <Link href={"/"} className="">
          <Image
            className="hidden sm:block"
            src={"/logo-default.png"}
            alt="logo"
            priority
            height={40}
            width={150}
            style={{ height: "auto" }}
          />
        </Link>
        <Link href={"/"} className="hidden max-sm:block max-xs:hidden">
          <Image
            priority
            className="hidden max-sm:block"
            src={"/logo192.png"}
            alt="logo"
            height={40}
            width={40}
          />
        </Link>
      </NavbarBrand>

      <NavbarContent as="div" className="items-center z-0 " justify="end">
        <div className="flex flex-row gap-2 items-center ">
          <Input
            radius="full"
            className="hidden 1md:block"
            classNames={{
              base: "max-w-full sm:max-w-[10rem] h-8",
              mainWrapper: "h-full ",
              input: "text-tiny",
              inputWrapper:
                "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
            }}
            placeholder="Search"
            size="sm"
            isReadOnly
            onClick={() => setSearchModal(true)}
            endContent={<MdSearch size={20} />}
            type="search"
          />

          <Button
            size="sm"
            isIconOnly
            radius="lg"
            variant="light"
            className="1md:hidden"
            onClick={(e) => {
              setSearchModal(true);
            }}
          >
            <MdSearch className="text-xl text-default-600 " />
          </Button>

          <Button
            as={Link}
            size="sm"
            isIconOnly
            radius="lg"
            variant="light"
            href="/submit"
            className="hover:bg-foreground/10 transition-all delay-100 rounded-full p-1"
          >
            <LuPencilLine className="text-xl text-default-600" />
          </Button>

          <Badge
            size="sm"
            content={
              loginInfo.unread_count > 99
                ? "99+"
                : loginInfo.unread_count > 0 && loginInfo.unread_count
            }
            className="opacity-80"
            color="primary"
          >
            <Button
              onClick={() => setNotificationPopup(true)}
              radius="lg"
              isIconOnly
              variant="light"
              size="sm"
            >
              <FaRegBell className="text-xl text-default-600" />
            </Button>
          </Badge>

          {status !== "authenticated" && (
            <Button
              isIconOnly={status !== "unauthenticated"}
              radius="lg"
              variant="flat"
              color="success"
              onClick={handleLogin}
              size="sm"
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
                <Button
                  className="ms-2"
                  radius="full"
                  variant="light"
                  isIconOnly
                >
                  <Avatar
                    src={getResizedAvatar(session?.user?.name ?? "")}
                    className="shadow-lg cursor-pointer bg-foreground-900/40"
                    isBordered
                    size="sm"
                    color={
                      credentials?.type
                        ? keysColorMap[credentials.type]
                        : undefined
                    }
                  />
                </Button>
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
                      <p> {loginInfo.upvote_mana_percent?.toLocaleString()}%</p>
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
                    size="sm"
                    variant="light"
                    className="w-full justify-start items-center px-1"
                    as={Link}
                    href={`/@${session?.user?.name}`}
                    onClick={handleItemClick}
                    startContent={<FaUserCircle className="text-xl" />}
                  >
                    Profile
                  </Button>

                  <Button
                    size="sm"
                    variant="light"
                    className="w-full justify-start items-center px-1"
                    as={Link}
                    href={`/@${session?.user?.name}/wallet`}
                    onClick={handleItemClick}
                    startContent={<FaWallet className="text-xl" />}
                  >
                    Wallet
                  </Button>

                  <Button
                    className="w-full justify-start items-center px-1"
                    size="sm"
                    variant="light"
                    onClick={() => {
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
                    size="sm"
                    variant="light"
                    onClick={() => {
                      setIsAccOpen(!isAccOpen);
                      handleItemClick();
                    }}
                    startContent={<PiUserSwitchFill className="text-xl" />}
                  >
                    Switch/Add Account
                  </Button>

                  <Button
                    className="w-full justify-start items-center px-1 text-foreground"
                    size="sm"
                    variant="light"
                    color="danger"
                    onClick={() => {
                      onOpenChange();
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

        {searchModal && (
          <SearchModal isOpen={searchModal} onOpenChange={setSearchModal} />
        )}

        {isAccOpen && (
          <AccountsModal
            isOpen={isAccOpen}
            onOpenChange={setIsAccOpen}
            handleSwitchSuccess={(user) => {
              if (user) setCredentials(user);
            }}
          />
        )}

        {notificationPopup && (
          <NotificationsModal
            isOpen={notificationPopup}
            onOpenChange={setNotificationPopup}
            username={session?.user?.name}
          />
        )}
      </NavbarContent>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="sm"
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
                <Button color="primary" variant="light" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  onClick={() => {
                    onOpenChange();
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
    </Navbar>
  );
}
