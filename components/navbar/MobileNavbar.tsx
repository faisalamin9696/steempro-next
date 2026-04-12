"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  Bell,
  House,
  User,
  Wallet,
  ChevronsUp,
  Plus,
  LogIn,
  Video,
  FileText,
} from "lucide-react";
import { Badge } from "@heroui/badge";
import SPopover from "../ui/SPopover";
import { Button } from "@heroui/button";
import { twMerge } from "tailwind-merge";
import { useAppSelector } from "@/hooks/redux/store";

import { motion, AnimatePresence } from "framer-motion";
import { useAccountsContext } from "../auth/AccountsContext";

const ICON_SIZE = 20;

export function MobileNavbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isAuth = status === "authenticated";
  const username = session?.user?.name;
  const { manageAccounts } = useAccountsContext();

  const [showScrollUp, setShowScrollUp] = useState(false);

  const commonData = useAppSelector((s) => s.commonReducer.values);
  const unreadCount =
    commonData.unread_notifications_count + commonData.unread_count_chat;

  useEffect(() => {
    const handleScroll = () => setShowScrollUp(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = (e: React.MouseEvent) => {
    if (showScrollUp) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const navItems = useMemo(
    () => [
      {
        label: "Home",
        href: showScrollUp ? "" : "/",
        icon: showScrollUp ? ChevronsUp : House,
        onClick: showScrollUp ? scrollToTop : undefined,
        active:
          pathname === "/" ||
          pathname === "/trending" ||
          pathname === "/popular" ||
          pathname === "/created" ||
          pathname === "/hot" ||
          pathname === "/payout",
        key: "home",
      },
      {
        label: "Activity",
        href: isAuth ? `/@${username}/notifications` : "",
        onClick: (e: React.MouseEvent) => {
          if (!isAuth) {
            e.preventDefault();
            manageAccounts();
          }
        },
        icon: Bell,
        active: pathname?.includes(`/@${username}/notifications`),
        badge: isAuth && unreadCount > 0,
        key: "notifications",
      },
      {
        label: "",
        href: "/submit",
        icon: Plus,
        active: pathname === "/submit",
        key: "create",
        className: "",
      },
      {
        label: "Wallet",
        href: isAuth ? `/@${username}/wallet` : "",
        onClick: (e: React.MouseEvent) => {
          if (!isAuth) {
            e.preventDefault();
            manageAccounts();
          }
        },
        icon: Wallet,
        active: pathname?.includes(`/@${username}/wallet`),
        key: "wallet",
      },
      {
        label: !isAuth ? "Login" : "Account",
        href: isAuth ? `/@${username}` : "",
        onClick: (e: React.MouseEvent) => {
          if (!isAuth) {
            e.preventDefault();
            manageAccounts();
          }
        },
        icon: isAuth ? User : LogIn,
        className: isAuth ? "" : "text-primary hover:text-primary/90",
        active:
          !!username &&
          pathname.startsWith(`/@${username}`) &&
          !pathname?.includes(`/@${username}/wallet`) &&
          !pathname?.includes(`/@${username}/notifications`),
        key: "profile",
      },
    ],
    [pathname, showScrollUp, isAuth, username, unreadCount, manageAccounts],
  );

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-41 bg-background/80 backdrop-blur-2xl border-t border-default-200/50 pointer-events-none">
      <nav className="flex items-center justify-around p-1.5 gap-0.5 mx-auto max-w-full pointer-events-auto relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;
          const isCreate = item.key === "create";

          return isCreate ? (
            <SPopover
              key={item.key}
              placement="top"
              trigger={
                <div
                  className={twMerge(
                    "relative flex-1 flex flex-col items-center justify-center py-1 transition-all duration-300 rounded-xl cursor-pointer",
                    isActive
                      ? "text-primary"
                      : "text-default-400 hover:text-default-700",
                    "flex-[0_0_auto] mx-4 active:scale-95",
                  )}
                >
                  <motion.div
                    className={twMerge(
                      "relative flex items-center justify-center transition-all duration-300 rounded-full w-9 h-9 bg-primary text-primary-foreground shadow-lg shadow-primary/20",
                    )}
                  >
                    <Plus size={24} strokeWidth={3} />
                  </motion.div>
                </div>
              }
            >
              {(onClose) => (
                <div className="w-48 p-1 flex flex-col gap-1">
                  <Button
                    as={Link}
                    href="/submit"
                    variant="light"
                    className="justify-start h-11"
                    onPress={onClose}
                    startContent={
                      <FileText size={18} className="text-primary" />
                    }
                  >
                    Create Post
                  </Button>
                  <Button
                    as={Link}
                    href="/shorts/submit"
                    variant="light"
                    className="justify-start h-11"
                    onPress={onClose}
                    startContent={
                      <Video size={18} className="text-secondary" />
                    }
                  >
                    Create Short
                  </Button>
                </div>
              )}
            </SPopover>
          ) : (
            <Link
              key={item.key}
              href={item.href}
              onClick={(e) => {
                if (item.href === "") e.preventDefault();
                item.onClick?.(e);
              }}
              className={twMerge(
                "relative flex-1 flex flex-col items-center justify-center py-1.5 transition-all duration-300 rounded-xl",
                isActive
                  ? "text-primary"
                  : "text-default-400 hover:text-default-700",
                isCreate ? "flex-[0_0_auto] mx-4" : "active:scale-95",
                item.className,
              )}
            >
              <motion.div
                className={twMerge(
                  "relative flex items-center justify-center transition-all duration-300 rounded-full",
                  isCreate
                    ? "w-7 h-7 bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "h-6 w-6",
                )}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={
                      item.key === "home"
                        ? showScrollUp
                          ? "up"
                          : "house"
                        : isActive
                          ? "active"
                          : "inactive"
                    }
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="flex items-center"
                  >
                    {item.badge ? (
                      <Badge
                        size="sm"
                        shape="circle"
                        placement="top-right"
                        color="primary"
                        content={unreadCount > 0 ? "" : undefined}
                        showOutline={true}
                        classNames={{
                          badge: "-right-0.5 top-0.5 min-w-0",
                        }}
                      >
                        <Icon
                          size={isCreate ? 24 : ICON_SIZE}
                          strokeWidth={isActive ? 2.5 : 2}
                          fill={isActive && !isCreate ? "currentColor" : "none"}
                          className={
                            isActive && !isCreate ? "fill-primary/10" : ""
                          }
                        />
                      </Badge>
                    ) : (
                      <Icon
                        size={isCreate ? 22 : ICON_SIZE}
                        strokeWidth={isActive || isCreate ? 2.5 : 2}
                        fill={isActive && !isCreate ? "currentColor" : "none"}
                        className={
                          isActive && !isCreate ? "fill-primary/10" : ""
                        }
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
              {isActive && !isCreate && (
                <motion.div
                  layoutId="activeTabMobileGlow"
                  className="absolute inset-x-1 inset-y-0.5 bg-primary/10 rounded-2xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.2 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
