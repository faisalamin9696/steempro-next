import React from "react";
import { Button, ButtonProps } from "@nextui-org/button";
import Image from "next/image";

const KeychainButton = (props: ButtonProps) => {
  const keuchainImg = require("../../public/keychain.png");
  return (
    <Button size="sm" className=" px-2" {...props}>
      <div className=" flex flex-row items-center gap-2">
        {!props?.isLoading && (
          <Image alt="keychain" src={keuchainImg} height={30} width={30} />
        )}
        SteemKeychain
      </div>
    </Button>
  );
};

export default KeychainButton;
