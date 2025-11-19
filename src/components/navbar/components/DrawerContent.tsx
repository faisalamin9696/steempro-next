import SLink from "@/components/ui/SLink";
import ThemeSwitch from "@/components/ThemeSwitch";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import React from "react";
import { AiFillProject, AiOutlineProject } from "react-icons/ai";
import { HiOutlineUserGroup, HiUserGroup } from "react-icons/hi2";
import { IoFlash, IoHome, IoHomeOutline } from "react-icons/io5";
import {
  MdAreaChart,
  MdOutlineAreaChart,
  MdOutlinePolicy,
  MdOutlineRefresh,
  MdPolicy,
} from "react-icons/md";
import {
  RiCalendar2Fill,
  RiCalendar2Line,
  RiGroup2Fill,
  RiGroup2Line,
  RiInformation2Fill,
  RiInformation2Line,
  RiSettings2Fill,
  RiSettings2Line,
  RiToolsFill,
  RiToolsLine,
  RiUserStarFill,
  RiUserStarLine,
} from "react-icons/ri";
import { twMerge } from "tailwind-merge";
import { useAppSelector } from "@/constants/AppFunctions";
import { proxifyImageUrl } from "@/utils/proxifyUrl";
import SAvatar from "@/components/ui/SAvatar";
import Reputation from "@/components/Reputation";
import LogoutButton from "@/components/LogoutButton";
import { FaCoins } from "react-icons/fa";
import { refreshData } from "../AppNavbar";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { PiUserSwitchFill } from "react-icons/pi";
import AccountsModal from "@/components/auth/AccountsModal";
import { useLogin } from "@/components/auth/AuthProvider";
import { useDisclosure } from "@heroui/modal";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";

const iconSize = 24;
function DrawerContent() {
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const commonData = useAppSelector((state) => state.commonReducer.values);
  const { data: session, status } = useSession();
  const pathname = usePathname()?.replaceAll(
    /\b(?:trending|payout|created|hot)\b/g,
    ""
  );
  const { setCredentials } = useLogin();
  const accountDisclosure = useDisclosure();
  const isAuthenticated = status === "authenticated";
  const { isMobile } = useDeviceInfo();

  const menuItems = [
    {
      title: "Home",
      href: "/",
      unFocusedIcon: <IoHomeOutline size={iconSize} />,
      focusedIcon: <IoHome size={iconSize} />,
      belowContent:
        isMobile || session?.user?.name ? null : <Divider className=" my-2" />,
      children: isMobile ? <></> : null,
    },

    {
      title: "Explore",
      href: `/@${session?.user?.name}/friends`,
      unFocusedIcon: <RiGroup2Line size={iconSize} />,
      focusedIcon: <RiGroup2Fill size={iconSize} />,
      loginRequired: true,
    },
    {
      title: "Schedules",
      href: `/schedules`,
      unFocusedIcon: <RiCalendar2Line size={iconSize} />,
      focusedIcon: <RiCalendar2Fill size={iconSize} />,
      loginRequired: true,
      belowContent: session?.user?.name ? null : <Divider className=" my-2" />,
    },

    {
      children: <LogoutButton iconSize={iconSize} />,
      loginRequired: true,
      belowContent: <Divider className=" my-2" />,
    },
    {
      title: "Communities",
      href: `/communities`,
      unFocusedIcon: <HiOutlineUserGroup size={iconSize} />,
      focusedIcon: <HiUserGroup size={iconSize} />,
    },

    {
      title: "Witnesses",
      href: `/witnesses`,
      unFocusedIcon: <RiUserStarLine size={iconSize} />,
      focusedIcon: <RiUserStarFill size={iconSize} />,
    },
    {
      title: "Proposals",
      href: `/proposals`,
      unFocusedIcon: <AiOutlineProject size={iconSize} />,
      focusedIcon: <AiFillProject size={iconSize} />,
    },
    {
      title: "Market",
      href: `/market`,
      unFocusedIcon: <MdOutlineAreaChart size={iconSize} />,
      focusedIcon: <MdAreaChart size={iconSize} />,
    },

    {
      title: "Settings",
      href: `/settings`,
      unFocusedIcon: <RiSettings2Line size={iconSize} />,
      focusedIcon: <RiSettings2Fill size={iconSize} />,
    },

    {
      title: "Tools",
      href: `/tools`,
      unFocusedIcon: <RiToolsLine size={iconSize} />,
      focusedIcon: <RiToolsFill size={iconSize} />,
      belowContent: <Divider className=" my-2" />,
    },
    {
      title: "Privacy Policy",
      href: `/privacy-policy`,
      unFocusedIcon: <MdOutlinePolicy size={iconSize} />,
      focusedIcon: <MdPolicy size={iconSize} />,
    },
    {
      title: "About",
      href: `/about`,
      unFocusedIcon: <RiInformation2Line size={iconSize} />,
      focusedIcon: <RiInformation2Fill size={iconSize} />,
    },
  ];

  const posting_json_metadata = JSON.parse(
    loginInfo?.posting_json_metadata || "{}"
  );

  const cover_picture = proxifyImageUrl(
    posting_json_metadata?.profile?.cover_image ?? "",
    "1024x720"
  );

  return (
    <div className="scrollbar-thin flex flex-col pb-2 pt-2 justify-between overflow-auto h-full-minus-64">
      <div className="flex flex-col ">
        {isAuthenticated && (
          <div className={"pb-4 overflow-x-hidden relative p-2 rounded-md"}>
            <div>
              <div
                className={`bg-center bg-cover bg-no-repeat bg-[#3e4146]/50 h-16 rounded-md`}
                style={{ backgroundImage: `url(${cover_picture})` }}
              >
                <div className="absolute inset-0 h-16 bg-background/20 rounded-md m-2"></div>
              </div>
            </div>

            <div className="ps-2 pe-2 z-10 flex flex-row gap-4 absolute top-2">
              <SAvatar
                size="sm"
                username={loginInfo.name}
                className="bg-background shadow-none border-1 border-gray-600"
              />

              <div className="flex flex-row items-start justify-between w-full gap-2 py-2">
                <div className="flex flex-col gap-1 items-start font-semibold text-sm mb-0">
                  <p>
                    {posting_json_metadata?.profile?.name ?? loginInfo.name}
                  </p>

                  {loginInfo?.name && (
                    <div className=" flex flex-row items-center gap-1">
                      <SLink
                        href={`/@${loginInfo.name}`}
                        className=" font-normal text-xs hover:underline"
                      >
                        @{loginInfo.name}
                      </SLink>

                      <Reputation
                        reputation={loginInfo.reputation}
                        className=" font-semibold"
                        variant="solid"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-row justify-between items-center gap-2 w-full pt-4 pb-3">
              <Button
                variant="solid"
                title="Switch/Add account"
                className="flex items-center my-0 min-h-0 h-6 px-2"
                size="sm"
                radius="full"
                color="primary"
                onPress={() => {
                  accountDisclosure.onOpen();
                }}
              >
                <div className="flex flex-row gap-2 items-center">
                  <PiUserSwitchFill size={18} />
                  <p>Switch</p>
                </div>
              </Button>

              <Chip
                variant="flat"
                title="Voting power"
                className="flex items-center"
                size="sm"
              >
                <div className="flex flex-row gap-2">
                  <IoFlash size={16} />

                  <p>{loginInfo.upvote_mana_percent?.toLocaleString()}%</p>
                </div>
              </Chip>

              <Chip
                size="sm"
                variant="flat"
                title="Resource credits"
                className="flex items-center"
              >
                <div className="flex flex-row gap-2">
                  <FaCoins size={16} />
                  <p>{loginInfo.rc_mana_percent?.toLocaleString()}%</p>
                </div>
              </Chip>

              <Button
                variant="flat"
                className=" min-h-0 min-w-0 h-6 w-6"
                onPress={() => refreshData(session?.user?.name)}
                isIconOnly
                size="sm"
                radius="full"
                color="primary"
              >
                {commonData.isLoadingAccount ? (
                  <Spinner size="sm" color="current" />
                ) : (
                  <MdOutlineRefresh size={18} />
                )}
              </Button>
            </div>
          </div>
        )}
        <div className=" flex flex-col gap-2 px-4">
          {menuItems.map((item, index) => {
            const isLogin = !!session?.user?.name;
            const isFocused = item.href === pathname;

            if (item.loginRequired && !isLogin) {
              return <></>;
            }

            if (item?.children)
              return (
                <div className=" flex flex-col" key={index}>
                  {item.children}
                  {item.belowContent}
                </div>
              );
            return (
              <div className=" flex flex-col" key={index}>
                <Button
                  radius="sm"
                  variant={isFocused ? "flat" : "light"}
                  className={twMerge(
                    "w-full justify-start",
                    isFocused && " font-semibold"
                  )}
                  as={SLink}
                  href={item.href}
                  startContent={
                    isFocused ? item.focusedIcon : item.unFocusedIcon
                  }
                >
                  {item.title}
                </Button>

                {item.belowContent}
              </div>
            );
          })}
        </div>
      </div>

      <div className="hidden 2lg:block px-4">
        <ThemeSwitch />
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
    </div>
  );
}

export default DrawerContent;
