"use client";

import { memo, useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import SDrawerContent from "./SDrawerContent";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useDeviceInfo } from "@/hooks/redux/useDeviceInfo";
import { ArrowLeft, Menu } from "lucide-react";

export default memo(function SDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const { isLargeScreen } = useDeviceInfo();

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
    if (isLargeScreen && isOpen) {
      setIsOpen(false);
    }
  }, [isLargeScreen]);

  return (
    <div className="relative">
      <button
        className="fixed inset-0 z-10 bg-black/30 h-screen transition-opacity"
        style={{
          visibility: isOpen ? "visible" : "hidden",
          opacity: isOpen ? 1 : 0,
        }}
        onClick={toggleDrawer}
      ></button>

      {/* Drawer button */}

      <div className="xl:hidden me-2">
        <Button
          aria-label={"Drawer Button"}
          size="sm"
          isIconOnly
          variant="light"
          onPress={toggleDrawer}
        >
          <Menu className="text-xl" />
        </Button>
      </div>
      {/* Drawer content */}
      <div
        style={{
          visibility: isOpen ? "visible" : "hidden",
          opacity: isOpen ? 1 : 0,
        }}
        className={twMerge(`fixed z-50 top-0 left-0 h-max w-72 rounded-r-2xl bg-background  transition-transform duration-300 
            ${isOpen ? "translate-x-0" : "-translate-x-full"}`)}
      >
        <div className=" flex flewx-row items-center justify-between p-2 pl-4 h-16 ">
          <Link href={"/"}>
            <Image
              src={"/logo-default.png"}
              alt="logo"
              priority
              height={30}
              width={150}
            />
          </Link>

          <Button
            variant="light"
            isIconOnly
            onPress={toggleDrawer}
            radius="md"
            size="sm"
            className="2lg:hidden text-muted"
          >
            <ArrowLeft size={20} />
          </Button>
        </div>
        <SDrawerContent />
      </div>
    </div>
  );
});
