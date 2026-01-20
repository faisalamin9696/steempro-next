"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { proxifyImageUrl } from "@/utils/proxifyUrl";
import SAvatar from "@/components/ui/SAvatar";
import Reputation from "@/components/post/Reputation";
import { useAppSelector } from "@/hooks/redux/store";
import { useDeviceInfo } from "@/hooks/redux/useDeviceInfo";
import Link from "next/link";
import LogoutButton from "../ui/LogoutButton";
import BackgroundImage from "../BackgroundImage";
import {
  CalendarSearch,
  ChartCandlestick,
  Compass,
  DatabaseZap,
  House,
  Info,
  Landmark,
  Receipt,
  Settings,
  ShieldUser,
  Users,
  Zap,
} from "lucide-react";
import ManageAccountsButton from "../auth/ManageAccountsButton";
import { motion } from "framer-motion";
import ThemeSwitch from "@/components/ThemeSwitch";

const iconSize = 20;

function SDrawerContent() {
  const loginData = useAppSelector((s) => s.loginReducer.value);
  const { data: session, status } = useSession();
  const pathname = usePathname()?.replace(
    /\b(trending|payout|created|hot)\b/g,
    ""
  );
  const isAuthenticated = status === "authenticated";
  const isLogin = !!session?.user?.name;
  const { isMobile } = useDeviceInfo();

  const { name, posting_json_metadata } = loginData;
  const profile = JSON.parse(posting_json_metadata || "{}")?.profile ?? {};
  const displayName = profile.name || name;
  const coverImg = profile.cover_image
    ? proxifyImageUrl(profile.cover_image, "1024x720")
    : undefined;

  const sections = [
    {
      group: "Discover",
      items: [
        { title: "Home", href: "/", icon: House },
        { title: "Explore", href: `/popular`, icon: Compass, login: true },
        { title: "Communities", href: `/communities`, icon: Users },
      ],
    },
    {
      group: "Blockchain",
      items: [
        { title: "Market", href: `/market`, icon: ChartCandlestick },
        { title: "Witnesses", href: `/witnesses`, icon: Landmark },
        { title: "Proposals", href: `/proposals`, icon: Receipt },
        { title: "Schedules", href: `/schedules`, icon: CalendarSearch },
      ],
    },
    {
      group: "App",
      items: [
        { title: "Settings", href: `/settings`, icon: Settings },
        { title: "Privacy", href: `/privacy-policy`, icon: ShieldUser },
        { title: "About", href: `/about`, icon: Info },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] bg-background/5 p-4 gap-4">
      {/* Scrollable menu */}
      <div className="flex flex-col flex-1 overflow-y-auto scrollbar-hide space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <p className="px-4 text-[10px] font-bold text-default-500 uppercase tracking-widest opacity-80">
              {section.group}
            </p>
            <div className="flex flex-col gap-1">
              {section.items.map((item, i) => {
                const { icon: Icon } = item;
                if (item.login && !isLogin) return null;

                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname?.startsWith(item.href);

                return (
                  <Link
                    key={i}
                    href={item.href}
                    className="relative block group outline-none"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-pill"
                        className="absolute inset-0 bg-primary/10 rounded-xl"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                    <div
                      className={twMerge(
                        "relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200",
                        !isActive &&
                          "hover:bg-default/50 text-default-600 hover:text-foreground",
                        isActive && "text-primary font-medium"
                      )}
                    >
                      <Icon
                        size={iconSize}
                        className={twMerge(
                          "transition-transform group-hover:scale-110",
                          isActive && "opacity-80"
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      <span className="text-sm">{item.title}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col gap-3 mt-auto pb-0">
        {isAuthenticated && (
          <div className="relative group rounded-2xl overflow-hidden border border-default-100 bg-background/50 backdrop-blur-xl shadow-sm transition-all hover:shadow-md hover:border-default-200">
            <div className="absolute inset-0 h-16">
              <BackgroundImage
                src={coverImg}
                overlay={!coverImg}
                className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                overlayClass="bg-gradient-to-b from-transparent to-background"
              />
              <div className="absolute inset-0 bg-linear-to-t from-background via-background/80 to-transparent" />
            </div>

            <div className="relative pt-6 px-3 pb-3 flex flex-col gap-3">
              <div className="flex items-end justify-between px-1 gap-2">
                <SAvatar
                  username={name}
                  size="md"
                  className="ring-4 ring-background z-10 shadow-sm"
                />
                <ManageAccountsButton
                  variant="light"
                  size="sm"
                  radius="full"
                  className="text-default-500 hover:text-foreground hover:bg-default/60 h-8 px-3 min-w-0 font-medium text-xs mb-1"
                  title="Manage"
                />
                <ThemeSwitch mode="icon" className="mb-1" />
              </div>

              <div className="space-y-0.5 px-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm truncate text-foreground/90">
                    {displayName}
                  </span>
                  <Reputation
                    value={loginData.reputation}
                    className="text-[9px] h-4 px-1.5 bg-default/10 border border-default/20 text-default-500"
                  />
                </div>
                <Link
                  href={`/@${name}`}
                  className="block text-xs text-default-400 hover:text-primary transition-colors w-fit"
                >
                  @{name}
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="flex items-center gap-2 bg-default/5 hover:bg-default/10 transition-colors p-2 rounded-xl border border-default/10">
                  <div className="p-1.5 rounded-lg bg-warning/10 text-warning">
                    <Zap size={14} className="fill-current" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-default-500 font-medium uppercase tracking-wider leading-none mb-0.5">
                      VP
                    </span>
                    <span className="text-xs font-bold font-mono">
                      {loginData.upvote_mana_percent}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-default/5 hover:bg-default/10 transition-colors p-2 rounded-xl border border-default/10">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <DatabaseZap size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-default-500 font-medium uppercase tracking-wider leading-none mb-0.5">
                      RC
                    </span>
                    <span className="text-xs font-bold font-mono">
                      {loginData.rc_mana_percent}%
                    </span>
                  </div>
                </div>
              </div>

              {!isMobile && (
                <div className="pt-1">
                  <LogoutButton
                    className="h-9 text-xs font-medium border-default-200/50"
                    color="danger"
                    variant="flat"
                    fullWidth
                  >
                    Sign Out
                  </LogoutButton>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SDrawerContent;
