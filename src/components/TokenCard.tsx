import { Dropdown, DropdownTrigger } from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { FaSortDown } from "react-icons/fa";
import { BsInfoCircle } from "react-icons/bs";
import Image from "next/image";

interface TokenCardProps {
  title: string;
  description?: string | React.ReactNode;
  shortDesc?: string;
  endContent?: React.ReactNode;
  actionContent?: React.ReactNode;
  symbol?: string;
  tokenKey: SteemTokens;
  iconSrc?: string;
  handleInfoClick?: (key: SteemTokens) => void;
}

export const TokenCard = (props: TokenCardProps) => {
  const {
    title,
    tokenKey,
    description,
    endContent,
    actionContent,
    symbol,
    iconSrc,
    shortDesc,
    handleInfoClick,
  } = props;

  function handleInfo() {
    handleInfoClick && handleInfoClick(tokenKey);
  }

  return (
    <Card shadow="sm" key={tokenKey} className="px-2  dark:bg-foreground/10">
      <CardBody className=" justify-between flex flex-row max-lg:flex-col  gap-4">
        <div className="flex flex-col items-start gap-2 max-lg:flex-col w-full">
          <div className="flex flex-col gap-2 items-start">
            <div className="flex flex-row gap-1 items-center">
              <div className=" flex flex-row gap-2 items-start">
                {iconSrc && (
                  <Image alt="" width={35} height={35} src={iconSrc} />
                )}
                <div className=" space-y-1">
                  <div className="flex flex-row items-center gap-1">
                    <p className="text-md font-bold">{title}</p>

                    <Button
                      radius="full"
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={handleInfo}
                    >
                      <BsInfoCircle className="text-sm" />
                    </Button>
                  </div>
                  <p className="text-sm text-default-400">{shortDesc}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="py-6 flex flex-col justify-between items-start  w-full">
            <div className="flex flex-row gap-2 items-start w-full justify-end">
              <div className="text-sm">{endContent}</div>

              {symbol && <p className="text-sm">{symbol}</p>}

              {actionContent ? (
                <Dropdown
                  size="sm"
                  // showArrow
                  classNames={{
                    // base: "before:bg-default-200", // change arrow background
                    content:
                      "py-1 px-1 border border-default-200 bg-gradient-to-br from-white to-default-200 dark:from-default-50 dark:to-black",
                  }}
                >
                  <DropdownTrigger>
                    <Button
                      className="min-w-0 min-h-0 w-6 h-6 items-start"
                      radius="full"
                      size="sm"
                      isIconOnly
                      variant="light"
                    >
                      <FaSortDown className="text-medium " />
                    </Button>
                  </DropdownTrigger>
                  {actionContent}
                </Dropdown>
              ) : null}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
