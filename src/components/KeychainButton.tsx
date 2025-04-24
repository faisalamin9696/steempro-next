import React from "react";
import { Button, ButtonProps } from "@heroui/button";
import Image from "next/image";
import { getCredentials } from "@/libs/utils/user";

const KeychainButton = (props: ButtonProps) => {
  const keuchainImg = require("../../public/keychain2.svg");
  const credentials = getCredentials();

  if (credentials?.keychainLogin) {
    return <div />;
  }
  return (
    <Button
      size="sm"
      className=" rounded-full p-0 pe-2 bg-[#4ca2f0]/50"
      {...props}
      variant="solid"
    >
      <div className=" flex flex-row items-center gap-2">
        {!props?.isLoading && (
          <Image alt="keychain" src={keuchainImg} height={30} width={30} />
        )}
        <p className="hidden sm:flex">SteemKeychain</p>
        <p className="flex sm:hidden">Keychain</p>
      </div>
    </Button>
  );
};

export default KeychainButton;
