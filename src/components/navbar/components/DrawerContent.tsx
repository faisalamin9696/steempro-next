import SLink from "@/components/ui/SLink";
import ThemeSwitch from "@/components/ThemeSwitch";
import { GitHubLink } from "@/constants/AppConstants";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import React from "react";
import { useTranslation } from "@/utils/i18n";
import { AiFillProject, AiOutlineProject } from "react-icons/ai";
import { HiOutlineUserGroup, HiUserGroup } from "react-icons/hi2";
import { IoHome, IoHomeOutline } from "react-icons/io5";
import { MdAreaChart, MdOutlineAreaChart, MdOutlinePolicy, MdPolicy } from "react-icons/md";
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
function DrawerContent() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const pathname = usePathname()?.replaceAll(
    /\b(?:trending|payout|created|hot)\b/g,
    ""
  );
  const menuItems = [
    {
      title: t('sidebar.home'),
      href: "/",
      unFocusedIcon: <IoHomeOutline size={iconSize} />,
      focusedIcon: <IoHome size={iconSize} />,
      belowContent: session?.user?.name ? null : <Divider className=" my-2" />,
    },

    {
      title: t('sidebar.explore'),
      href: `/@${session?.user?.name}/friends`,
      unFocusedIcon: <RiGroup2Line size={iconSize} />,
      focusedIcon: <RiGroup2Fill size={iconSize} />,
      loginRequired: true,
    },
    {
      title: t('sidebar.schedules'),
      href: `/schedules`,
      unFocusedIcon: <RiCalendar2Line size={iconSize} />,
      focusedIcon: <RiCalendar2Fill size={iconSize} />,
      loginRequired: true,
      belowContent: <Divider className=" my-2" />,
    },
    {
      title: t('sidebar.communities'),
      href: `/communities`,
      unFocusedIcon: <HiOutlineUserGroup size={iconSize} />,
      focusedIcon: <HiUserGroup size={iconSize} />,
    },

    {
      title: t('sidebar.witnesses'),
      href: `/witnesses`,
      unFocusedIcon: <RiUserStarLine size={iconSize} />,
      focusedIcon: <RiUserStarFill size={iconSize} />,
    },
    {
      title: t('sidebar.proposals'),
      href: `/proposals`,
      unFocusedIcon: <AiOutlineProject size={iconSize} />,
      focusedIcon: <AiFillProject size={iconSize} />,
    },
    {
      title: t('sidebar.market'),
      href: `/market`,
      unFocusedIcon: <MdOutlineAreaChart  size={iconSize} />,
      focusedIcon: <MdAreaChart size={iconSize} />,
    },

    {
      title: t('sidebar.settings'),
      href: `/settings`,
      unFocusedIcon: <RiSettings2Line size={iconSize} />,
      focusedIcon: <RiSettings2Fill size={iconSize} />,
    },

    {
      title: t('sidebar.tools'),
      href: `/tools`,
      unFocusedIcon: <RiToolsLine size={iconSize} />,
      focusedIcon: <RiToolsFill size={iconSize} />,
      belowContent: <Divider className=" my-2" />,
    },

    {
      title: t('sidebar.github'),
      href: GitHubLink,
      unFocusedIcon: <RiGithubLine size={iconSize} />,
      focusedIcon: <RiGithubFill size={iconSize} />,
      externalLink: true,
    },
    // {
    //   title: t('sidebar.discord'),
    //   href: DiscordServerLink,
    //   unFocusedIcon: <RiDiscordLine size={iconSize} />,
    //   focusedIcon: <RiDiscordFill size={iconSize} />,
    //   externalLink: true,
    // },
    {
      title: t('sidebar.privacy_policy'),
      href: `/policy`,
      unFocusedIcon: <MdOutlinePolicy size={iconSize} />,
      focusedIcon: <MdPolicy size={iconSize} />,
    },
    {
      title: t('sidebar.about'),
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
                variant={isFocused ? "flat" : "light"}
                className={twMerge(
                  "w-full justify-start gap-4",
                  isFocused && " font-semibold"
                )}
                as={SLink}
                target={item.externalLink ? "_blank" : undefined}
                href={item.href}
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
