import { Card, CardBody, CardHeader, CardProps } from "@heroui/react";
import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { twMerge } from "tailwind-merge";
import PageHeader from "./PageHeader";

interface Props extends Omit<CardProps, "children" | "title"> {
  title?: string | React.ReactNode;
  titleClass?: string;
  children: React.ReactNode;
  icon?: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  iconClass?: string;
  iconSize?: "sm" | "md" | "lg";
  description?: string;
  iconColor?: "primary" | "warning" | "danger" | "success" | "secondary";
  titleEndContent?: React.ReactNode;
}
function SCard({
  title,
  titleClass,
  children,
  icon: Icon,
  iconClass,
  iconSize = "md",
  description,
  iconColor,
  titleEndContent,
  ...props
}: Props) {
  return (
    <Card {...props}>
      <CardHeader
        className={twMerge("flex items-center gap-2", props.classNames?.header)}
      >
        <PageHeader
          title={title}
          description={description}
          titleClass={titleClass}
          icon={Icon}
          iconClass={iconClass}
          size={iconSize}
          color={iconColor}
          titleEndContent={titleEndContent}
        />
      </CardHeader>
      <CardBody className={twMerge(props.classNames?.body)}>
        {children}
      </CardBody>
    </Card>
  );
}

export default SCard;
