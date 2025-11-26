"use client";

import { FaPlus } from "react-icons/fa";
import SLink from "../ui/SLink";
import { Card } from "@heroui/card";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@heroui/button";
import { useLogin } from "../auth/AuthProvider";
import { FiLogIn } from "react-icons/fi";
import { useEffect, useState } from "react";
import { TbHome, TbHomeFilled } from "react-icons/tb";
import { BsBell, BsBellFill, BsWallet, BsWalletFill } from "react-icons/bs";
import { RiArrowUpDoubleLine } from "react-icons/ri";
import { toast } from "sonner";
import { PiUser, PiUserFill } from "react-icons/pi";
import { Badge } from "@heroui/badge";
import { useAppSelector } from "@/constants/AppFunctions";
import { twMerge } from "tailwind-merge";

const MobileNavbar = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const homeLink = "/";
  const notificationsLink = `/@${session?.user?.name}/notifications`;
  const submitLink = `/submit`;
  const walletLink = `/@${session?.user?.name}/wallet`;
  const profileLink = `/@${session?.user?.name}`;
  const { authenticateUser } = useLogin();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const commonData = useAppSelector((state) => state.commonReducer.values);

  function handleLogin() {
    authenticateUser();
  }

  // Helper function to check if a link is active
  const isActive = (link: string) => {
    return pathname === link;
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Check initial scroll position
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <Card className="fixed bottom-0 left-0 right-0 flex-row rounded-none p-2 px-4 flex justify-around md:hidden z-40">
        <div className="flex flex-row w-full justify-between items-center">
          <Button
            as={showScrollTop ? undefined : SLink}
            onPress={() => showScrollTop && scrollToTop()}
            disableRipple
            size="sm"
            radius="full"
            href={homeLink}
            color={isActive(homeLink) ? "primary" : "default"}
            variant={isActive(homeLink) ? "flat" : "light"}
          >
            <div className="flex flex-col items-center transition-all duration-200 ease-in-out">
              {showScrollTop ? (
                <RiArrowUpDoubleLine size={24} />
              ) : isActive(homeLink) ? (
                <TbHomeFilled size={24} />
              ) : (
                <TbHome size={24} />
              )}
            </div>
          </Button>

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
            //   commonData.unread_count > 99
            //     ? "99+"
            //     : commonData.unread_count > 0 && commonData.unread_count
            // }
            classNames={{'badge':'right-4 top-2'}}
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
              as={isAuthenticated ? SLink : undefined}
              href={notificationsLink}
              color={isActive(notificationsLink) ? "primary" : "default"}
              variant={isActive(notificationsLink) ? "flat" : "light"}
              disableRipple
              size="sm"
              radius="full"
              onPress={() => {
                if (!isAuthenticated) toast.info("Login to continue");
              }}
            >
              <div className="flex flex-col items-center">
                {isActive(notificationsLink) ? (
                  <BsBellFill size={24} />
                ) : (
                  <BsBell size={24} />
                )}
                {/* <span className="text-xs">Notifications</span> */}
              </div>
            </Button>
          </Badge>

          <Button
            as={SLink}
            href={submitLink}
            className="mx-2"
            size="sm"
            radius="full"
            color="primary"
          >
            <FaPlus />
          </Button>

          <Button
            as={isAuthenticated ? SLink : undefined}
            href={walletLink}
            onPress={() => {
              if (!isAuthenticated) toast.info("Login to continue");
            }}
            color={isActive(walletLink) ? "primary" : "default"}
            variant={isActive(walletLink) ? "flat" : "light"}
            disableRipple
            size="sm"
            radius="full"
          >
            <div className="flex flex-col items-center">
              {isActive(walletLink) ? (
                <BsWalletFill size={24} />
              ) : (
                <BsWallet size={24} />
              )}
              {/* <span className="text-xs">Wallet</span> */}
            </div>
          </Button>

          {!isAuthenticated && (
            <Button
              onPress={handleLogin}
              color={"success"}
              variant={"flat"}
              disableRipple
              size="sm"
              radius="full"
            >
              <div className="flex flex-col items-center">
                <FiLogIn size={24} />
                {/* <span className="text-xs">Login</span> */}
              </div>
            </Button>
          )}

          {isAuthenticated && (
            <Button
              as={SLink}
              href={profileLink}
              color={isActive(profileLink) ? "primary" : "default"}
              variant={isActive(profileLink) ? "flat" : "light"}
              disableRipple
              size="sm"
              radius="full"
            >
              <div className="flex flex-col items-center">
                {isActive(profileLink) ? (
                  <PiUserFill size={24} />
                ) : (
                  <PiUser size={24} />
                )}
                {/* <span className="text-xs">Wallet</span> */}
              </div>
            </Button>
          )}

          {/* {isAuthenticated && (
            <SLink href={profileLink}>
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
            </SLink>
          )} */}
        </div>
      </Card>
    </>
  );
};

export default MobileNavbar;
