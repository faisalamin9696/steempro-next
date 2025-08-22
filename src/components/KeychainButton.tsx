import React from "react";
import { Button, ButtonProps } from "@heroui/button";
import Image from "next/image";
import { getCredentials } from "@/utils/user";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";

const KeychainButton = (props: ButtonProps) => {
  const keychainImg = require("../../public/keychain2.svg");
  const credentials = getCredentials();
  const { isMobile } = useDeviceInfo();

  if (credentials?.keychainLogin) {
    return <div />;
  }
  return (
    <Button
      size="sm"
      className="rounded-full bg-[#4ca2f0]/50 p-0 md:pe-2"
      {...props}
      variant="solid"
      isIconOnly={isMobile}
    >
      <div className=" flex flex-row items-center gap-2">
        {!props?.isLoading && (
          <Image alt="keychain" src={keychainImg} height={30} width={30} />
        )}
        <p className="hidden md:flex">SteemKeychain</p>
      </div>
    </Button>
  );
};

export default KeychainButton;
