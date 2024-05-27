import "./style.scss";
import VanillaTilt from "vanilla-tilt";
import { useEffect, useRef } from "react";
import { useDeviceInfo } from "@/libs/utils/useDeviceInfo";
import Link from "next/link";
import { Button } from "@nextui-org/button";
import { IconType } from "react-icons";

interface Props {
  title: string;
  description: string;
  Icon: IconType;
  href: string;
  buttonText: string;
  target?: string;
}
const ToolsItemCard = (props: Props): JSX.Element => {
  const { title, description, Icon, href, buttonText, target } = props;
  const cardRef = useRef<HTMLElement | undefined | any>();
  const { isDesktop } = useDeviceInfo();

  useEffect(() => {
    if (isDesktop && cardRef && cardRef.current)
      VanillaTilt.init(cardRef.current);
  }, []);

  return (
    <div
      className=" flex flex-col items-center relative gap-4 bg-foreground/10 p-4 rounded-md"
      ref={cardRef}
      data-tilt-speed="600"
      data-tilt
      data-tilt-max="5"
      data-tilt-perspective="600"
      data-tilt-glare
      data-tilt-max-glare={0.25}
    >
      <Icon className=" text-8xl opacity-5 absolute right-4" />

      <p className="text-lg font-bold">{title}</p>

      <p className="text-sm font-light">{description}</p>

      <Button
        target={target}
        radius="full"
        variant="flat"
        color="primary"
        size="md"
        as={Link}
        href={href}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default ToolsItemCard;
