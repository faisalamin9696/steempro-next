import "./style.scss";
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
    <Card isBlurred className="card column bg-transparent grid row-auto">
      <CardBody className="card items-center flex-col">
        <SAvatar size="xl" username={username} loadSize="large" quality={75} />

        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center">
            <h3 className="mt-2 font-bold">{username}</h3>
            <p className=" font-light">{firstHeading}</p>
            <p className=" mt-2 font-extralight text-default-600 ">
              {secondHeading}
            </p>
          </div>
          <Button
            as={SLink}
            className="contact-button"
            radius="full"
            size="sm"
            href={props.href ?? `/@${username}`}
          >
            Contact
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export { AboutCard as AboutItem };
