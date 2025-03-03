import "./style.scss";
import { Button } from "@heroui/button";
import { IconType } from "react-icons";
import SLink from "./SLink";

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

  return (
    <div
      className=" flex flex-col items-center relative gap-4 bg-white/50 dark:bg-foreground/10 p-4 rounded-lg"
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
        color="default"
        size="md"
        as={SLink}
        href={href}
      >
        {buttonText}
      </Button>
    </div>
  );
};

export default ToolsItemCard;
