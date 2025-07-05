"use client";

import React, { memo, useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { RxHamburgerMenu } from "react-icons/rx";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import { MdClose } from "react-icons/md";
import DrawerContent from "./DrawerContent";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import SLink from "@/components/ui/SLink";
import ThemeSwitch from "@/components/ThemeSwitch";
import { usePathname } from "next/navigation";

interface Props {
  onAccountSwitch?: () => void;
  handleLogout: () => void;
}

export default memo(function Drawer(props: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const { is2Large } = useDeviceInfo();

  const toggleDrawer = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    document.body.classList.toggle("overflow-hidden", newState);
  };

  useEffect(() => {
    let timeout = setTimeout(() => {
      if (isOpen) toggleDrawer();
    }, 250);
    return () => clearTimeout(timeout);
  }, [pathname]);

  useEffect(() => {
    if (is2Large && isOpen) {
      setIsOpen(false);
    }
  }, [is2Large]);

  return (
    <div className="relative">
      <button
        className="fixed inset-0 z-10 bg-black bg-opacity-50 h-[100vh] transition-opacity"
        style={{
          visibility: isOpen ? "visible" : "hidden",
          opacity: isOpen ? 1 : 0,
        }}
        onClick={toggleDrawer}
      ></button>

      {/* Drawer button */}

      <div className="2lg:hidden me-2">
        <Button size="sm" isIconOnly variant="light" onPress={toggleDrawer}>
          <RxHamburgerMenu className="text-xl" />
        </Button>
      </div>
      {/* Drawer content */}
      <div
        style={{
          visibility: isOpen ? "visible" : "hidden",
          opacity: isOpen ? 1 : 0,
        }}
        className={twMerge(`fixed z-50 top-0 left-0 h-[100vh] w-64 rounded-r-2xl bg-background  transition-transform duration-300 
            ${isOpen ? "translate-x-0" : "-translate-x-full"}`)}
      >
        <div className=" flex flewx-row items-center justify-between p-2 pl-4 h-16 ">
          <div className=" flex items-center gap-2 w-full justify-between">
            <div className="flex flex-row items-center  ">
              <SLink href={"/"} className="hidden 2lg:block">
                <Image
                  src={"/logo-default.png"}
                  alt="logo"
                  priority
                  height={40}
                  width={160}
                  style={{ height: "auto" }}
                />
              </SLink>

              <div className="flex flex-row items-center gap-2 2lg:hidden">
                <SLink href={"/"}>
                  <Image
                    priority
                    src={"/logo192.png"}
                    alt="logo"
                    height={40}
                    width={40}
                  />
                </SLink>
                <ThemeSwitch sm className="" />
              </div>
            </div>
          </div>

          <Button
            variant="light"
            isIconOnly
            onPress={toggleDrawer}
            radius="full"
            size="sm"
            className="2lg:hidden"
          >
            <MdClose className="text-lg" />
          </Button>
        </div>
        <DrawerContent />
      </div>
    </div>
  );
});
