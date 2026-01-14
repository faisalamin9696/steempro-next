"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import {
  Bell,
  House,
  PlusCircle,
  User,
  Wallet,
  ChevronUp,
  ChevronsUp,
  Plus,
  LogIn,
} from "lucide-react";
import { Badge } from "@heroui/badge";
import { twMerge } from "tailwind-merge";
import { useAppSelector } from "@/hooks/redux/store";

import { motion, AnimatePresence } from "framer-motion";
import { useAccountsContext } from "../auth/AccountsContext";

const ICON_SIZE = 22;

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
        href: showScrollUp ? "#" : "/",
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
        href: isAuth ? `/@${username}/notifications` : "#",
        onClick: (e: React.MouseEvent) => {
          if (!isAuth) {
            e.preventDefault();
            manageAccounts();
          }
        },
        icon: Bell,
        active: pathname?.includes("/notifications"),
        badge: isAuth && unreadCount > 0,
        key: "notifications",
      },
      {
        label: "Post",
        href: "/submit",
        icon: Plus,
        active: pathname === "/submit",
        key: "create",
        className: "bg-primary text-primary-foreground hover:bg-primary/90",
      },
      {
        label: "Wallet",
        href: isAuth ? `/@${username}/wallet` : "#",
        onClick: (e: React.MouseEvent) => {
          if (!isAuth) {
            e.preventDefault();
            manageAccounts();
          }
        },
        icon: Wallet,
        active: pathname?.includes("/wallet"),
        key: "wallet",
      },
      {
        label: "Account",
        href: isAuth ? `/@${username}` : "#",
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
          !pathname?.includes("/wallet") &&
          !pathname?.includes("/notifications"),
        key: "profile",
      },
    ],
    [pathname, showScrollUp, isAuth, username, unreadCount, manageAccounts]
  );

  return (
    <div className="md:hidden fixed bottom-2 left-0 right-0 z-40 px-2">
      <nav className="flex items-center justify-between p-1.5 gap-2 mx-auto max-w-sm bg-background/70 backdrop-blur-xl border border-default-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={(e) => {
                if (item.href === "#") e.preventDefault();
                item.onClick?.(e);
              }}
              className={twMerge(
                "relative flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl transition-all duration-300",
                isActive ? "text-primary" : "text-muted hover:text-default-800",
                item.className
              )}
            >
              <div className="relative h-6 w-6 flex items-center justify-center">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={
                      item.key === "home"
                        ? showScrollUp
                          ? "up"
                          : "house"
                        : "static"
                    }
                    initial={{
                      scale: 0.6,
                      opacity: 0,
                      //   rotate: item.key === "home" ? -30 : 0,
                    }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{
                      scale: 0.6,
                      opacity: 0,
                      //   rotate: item.key === "home" ? 30 : 0,
                    }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.badge ? (
                      <Badge
                        size="sm"
                        shape="circle"
                        placement="top-right"
                        color="primary"
                        content={unreadCount > 0 ? "" : undefined}
                        showOutline={unreadCount > 0}
                        classNames={{ badge: "-right-1 top-1" }}
                        className={twMerge(
                          "z-0"
                          // unreadCount > 0 &&
                          //   "border-green-400 animate-pulse border-2"
                        )}
                      >
                        <Icon
                          size={ICON_SIZE}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                      </Badge>
                    ) : (
                      <Icon size={ICON_SIZE} strokeWidth={isActive ? 2.5 : 2} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* <span
                className={twMerge(
                  "text-[10px] mt-0.5 font-bold tracking-tight transition-all duration-300",
                  isActive ? "text-primary" : "opacity-70"
                )}
              >
                {item.label}
              </span> */}

              {isActive && (
                <motion.div
                  layoutId="activeTabMobile"
                  className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
