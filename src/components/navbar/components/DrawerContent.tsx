import SLink from "@/components/SLink";
import ThemeSwitch from "@/components/ThemeSwitch";
import { DiscordServerLink, GitHubLink } from "@/libs/constants/AppConstants";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import React from "react";
import { AiFillProject, AiOutlineProject } from "react-icons/ai";
import { FaMoneyCheck, FaMoneyCheckAlt } from "react-icons/fa";
import { HiOutlineUserGroup, HiUserGroup } from "react-icons/hi2";
import { IoHome, IoHomeOutline } from "react-icons/io5";
import { MdOutlinePolicy, MdPolicy } from "react-icons/md";
import {
  RiCalendar2Fill,
  RiCalendar2Line,
  RiDiscordFill,
  RiDiscordLine,
  RiGithubFill,
  RiGithubLine,
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

const iconSize = 24;
function DrawerContent({ toggleDrawer }: { toggleDrawer: () => void }) {
  const { data: session } = useSession();
  const pathname = usePathname()?.replaceAll(
    /\b(?:trending|payout|created|hot)\b/g,
    ""
  );
  const menuItems = [
    {
      title: "Home",
      href: "/",
      unFocusedIcon: <IoHomeOutline size={iconSize} />,
      focusedIcon: <IoHome size={iconSize} />,
      belowContent: session?.user?.name ? null : <Divider className=" my-2" />,
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
      title: "GitHub",
      href: GitHubLink,
      unFocusedIcon: <RiGithubLine size={iconSize} />,
      focusedIcon: <RiGithubFill size={iconSize} />,
      externalLink: true,
    },
    {
      title: "Discord",
      href: DiscordServerLink,
      unFocusedIcon: <RiDiscordLine size={iconSize} />,
      focusedIcon: <RiDiscordFill size={iconSize} />,
      externalLink: true,
    },
    {
      title: "Privacy Policy",
      href: `/policy`,
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

  return (
    <div className="scrollbar-thin flex flex-col px-4 py-4 pb-2 justify-between overflow-auto h-full-minus-64">
      <div className=" flex flex-col gap-2">
        {menuItems.map((item, index) => {
          const isLogin = !!session?.user?.name;
          const isFocused = item.href === pathname;

          if (item.loginRequired && !isLogin) {
            return <></>;
          }
          return (
            <div className=" flex flex-col" key={index}>
              <Button
                radius="sm"
                variant={isFocused ? "solid" : "light"}
                className={twMerge(
                  "w-full justify-start gap-4",
                  isFocused && " font-semibold"
                )}
                as={SLink}
                target={item.externalLink ? "_blank" : undefined}
                href={item.href}
                onPress={() => {
                  toggleDrawer();
                }}
                startContent={isFocused ? item.focusedIcon : item.unFocusedIcon}
              >
                {item.title}
              </Button>

              {item.belowContent}
            </div>
          );
        })}
      </div>

      <div className="hidden 2lg:block">
        <ThemeSwitch />
      </div>
    </div>
  );
}

export default DrawerContent;
