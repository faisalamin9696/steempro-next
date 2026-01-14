"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Badge } from "@heroui/badge";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { twMerge } from "tailwind-merge";
import { mutate } from "swr";
import { useAppSelector } from "@/hooks/redux/store";
import SAvatar from "../ui/SAvatar";
import SDrawer from "./SDrawer";
import SPopover from "../ui/SPopover";
import { Chip, Spinner } from "@heroui/react";
import LogoutButton from "../ui/LogoutButton";
import { useAccountsContext } from "../auth/AccountsContext";
import {
  Bell,
  DatabaseZap,
  LogIn,
  Plus,
  RotateCw,
  Search,
  User,
  Wallet,
  Zap,
} from "lucide-react";
import ManageAccountsButton from "../auth/ManageAccountsButton";
import { useState } from "react";
import SearchModal from "../search/SearchModal";
import BackgroundImage from "../BackgroundImage";

export async function refreshData(username?: string | null) {
  mutate("globals");
  if (!username) return;
  mutate(`account-${username}`);
  mutate(`unread-chat-${username}`);
  mutate(`unread-notification-count-${username}`);
}

function SNavbar() {
  const { data: session, status } = useSession();
  const isAuth = status === "authenticated";
  const [isSearchModal, setIsSearchModal] = useState(false);

  // Optimize selector to only pick what we need?
  // Redux useSelector with object equality check might be better if performance is critical,
  // but simpler here:
  const { unread_notifications_count, unread_count_chat, isLoadingAccount } =
    useAppSelector((s) => s.commonReducer.values);

  const unreadCount = unread_notifications_count + unread_count_chat;
  const loginData = useAppSelector((state) => state.loginReducer.value);
  const { manageAccounts, current } = useAccountsContext();

  return (
    <>
      <nav className="sticky top-0 z-50 h-16 flex items-center px-4 border-b border-default-100/50 bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <SDrawer />

          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-default.png"
              alt="SteemPro"
              priority
              height={32}
              width={140}
              className="hidden md:block w-auto h-8"
            />

            <Image
              src="/steempro-logo.svg"
              alt="SteemPro"
              priority
              height={32}
              width={32}
              className="md:hidden w-8 h-8"
            />
          </Link>
        </div>

        {/* RIGHT */}
        <div className="ml-auto flex items-center gap-2 md:gap-3">
          {/* Search Trigger */}
          <div
            className="hidden 1md:flex items-center gap-2 px-3 py-2 rounded-full bg-default-100/50 hover:bg-default-200/50 text-muted cursor-pointer transition-colors w-64 group"
            onClick={() => setIsSearchModal(true)}
          >
            <Search size={18} className="group-hover:text-foreground" />
            <span className="text-sm">Search...</span>
          </div>

          <Button
            isIconOnly
            variant="light"
            radius="full"
            className="1md:hidden text-muted"
            onPress={() => setIsSearchModal(true)}
          >
            <Search size={22} />
          </Button>

          {/* Create Button (Desktop) */}
          <div className="hidden md:flex">
            <Button
              as={Link}
              href="/submit"
              radius="full"
              color="primary"
              variant="shadow"
              className="font-medium shadow-primary/20"
              startContent={<Plus size={18} />}
            >
              Create
            </Button>
          </div>

          {/* Notifications */}
          {isAuth && (
            <div className="hidden md:flex">
              <Badge
                size="sm"
                shape="circle"
                placement="top-right"
                color="primary"
                content={unreadCount > 0 ? "" : undefined}
                showOutline={unreadCount > 0}
                classNames={{ badge: "right-2 top-2" }}
                className={twMerge(
                  "z-0"
                  // commonData.unread_count_chat > 0 &&
                  //   "border-green-400 animate-pulse border-2"
                )}
              >
                <Button
                  variant="light"
                  radius="md"
                  isIconOnly
                  size="md"
                  as={Link}
                  href={`/@${session?.user?.name}/notifications`}
                >
                  <Bell size={20} />
                </Button>
              </Badge>
            </div>
          )}

          {/* Authentication */}
          {!isAuth ? (
            <Button
              className="hidden md:flex font-medium"
              radius="full"
              variant="flat"
              color="primary"
              startContent={<LogIn size={18} />}
              isLoading={status === "loading"}
              isDisabled={status === "loading"}
              onPress={manageAccounts}
            >
              Login
            </Button>
          ) : (
            <SPopover
              placement="bottom-end"
              shouldCloseOnBlur={false}
              trigger={
                <SAvatar
                  username={session?.user?.name ?? ""}
                  className="cursor-pointer transition-transform hover:scale-105"
                  size="sm"
                  showLink={false}
                  isBordered
                  color={
                    current?.loginMethod === "keychain"
                      ? "primary"
                      : current?.type === "active"
                      ? "success"
                      : current?.type === "posting"
                      ? "warning"
                      : "default"
                  }
                />
              }
            >
              {(onClose) => (
                <div className="w-52 p-1">
                  {/* Popover Header Stats */}
                  <div className="flex items-center justify-between gap-1 mb-2 p-1">
                    <div className="flex gap-2">
                      <Chip
                        size="sm"
                        variant="flat"
                        classNames={{
                          base: "bg-warning/10 border-warning/20 border text-warning h-7",
                          content:
                            "flex gap-1 items-center px-1 font-mono font-bold",
                        }}
                      >
                        <Zap size={14} className="fill-current" />
                        {loginData.upvote_mana_percent}%
                      </Chip>
                      <Chip
                        size="sm"
                        variant="flat"
                        classNames={{
                          base: "bg-primary/10 border-primary/20 border text-primary h-7",
                          content:
                            "flex gap-1 items-center px-1 font-mono font-bold",
                        }}
                      >
                        <DatabaseZap size={14} />
                        {loginData.rc_mana_percent}%
                      </Chip>
                    </div>

                    <Button
                      title="Refresh"
                      variant="flat"
                      isIconOnly
                      radius="full"
                      onPress={() => refreshData(session?.user?.name)}
                      className="w-7 h-7 min-w-0"
                    >
                      {isLoadingAccount ? (
                        <Spinner size="sm" color="current" />
                      ) : (
                        <RotateCw size={14} />
                      )}
                    </Button>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Button
                      as={Link}
                      variant="light"
                      className="justify-start h-10 px-3 data-[hover=true]:bg-default/60"
                      href={`/@${session?.user?.name}`}
                      onPress={onClose}
                      startContent={<User size={18} className="text-muted" />}
                    >
                      Profile
                    </Button>

                    <Button
                      as={Link}
                      variant="light"
                      className="justify-start h-10 px-3 data-[hover=true]:bg-default/60"
                      href={`/@${session?.user?.name}/wallet`}
                      onPress={onClose}
                      startContent={<Wallet size={18} className="text-muted" />}
                    >
                      Wallet
                    </Button>

                    <ManageAccountsButton
                      variant="light"
                      className="justify-start h-10 px-3 data-[hover=true]:bg-default/60 "
                      onPress={onClose}
                      iconSize={18}
                      iconClass="text-muted"
                    />

                    <div className="my-1 border-t border-default-100/50" />

                    <LogoutButton
                      variant="light"
                      className="justify-start h-10 px-3 text-danger data-[hover=true]:bg-danger/10"
                      onPress={onClose}
                    />
                  </div>
                </div>
              )}
            </SPopover>
          )}
        </div>
      </nav>

      <SearchModal
        isOpen={isSearchModal}
        onOpenChange={setIsSearchModal}
        onClose={() => setIsSearchModal(false)}
      />
    </>
  );
}

export default SNavbar;
