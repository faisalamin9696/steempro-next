// import "./style.scss";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import SAvatar from "@/components/ui/SAvatar";
import SLink from "./ui/SLink";

interface Props {
  username: string;
  firstHeading: string;
  secondHeading: string;
  imageSize?: string;
  imageQuality?: "small" | "large" | "medium";
  href?: string;
}
const AboutCard = (props: Props): React.ReactNode => {
  const { username, firstHeading, secondHeading, imageSize, imageQuality } =
    props;

  return (
    <Card className="grid row-auto px-4 py-2">
      <CardBody className="items-center flex-col">
        <SAvatar size="xl" username={username} loadSize="large" quality={75} />

        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex flex-col items-center gap-1">
            <h3 className="mt-2 font-bold">{username}</h3>
            <p className=" font-normal text-sm text-default-500">
              {firstHeading}
            </p>
            {/* <p className=" mt-2 font-light text-default-600 ">
              {secondHeading}
            </p> */}
          </div>
          <Button
            color="primary"
            as={SLink}
            radius="full"
            className="w-full"
            size="sm"
            href={props.href ?? `/@${username}`}
            variant="flat"
          >
            Contact
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export { AboutCard as AboutItem };
