import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { twMerge } from "tailwind-merge";

function PageHeader({
  title,
  description,
  titleClass,
  descriptionClass,
  iconClass = "",
  icon: Icon,
  color = "primary",
  iconSize = 24,
  size = "md",
  titleEndContent,
}: {
  title: string | React.ReactNode;
  description?: string;
  titleClass?: string;
  descriptionClass?: string;
  icon?: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  color?: "primary" | "warning" | "danger" | "success" | "secondary";
  iconSize?: number;
  iconClass?: string;
  size?: "sm" | "md" | "lg";
  titleEndContent?: React.ReactNode;
}) {
  const iconClassColors =
    color === "primary"
      ? "bg-primary/10 text-primary border-primary/20"
      : color === "warning"
      ? "bg-warning/10 text-warning border-warning/20"
      : color === "danger"
      ? "bg-danger/10 text-danger border-danger/20"
      : color === "success"
      ? "bg-success/10 text-success border-success/20"
      : "bg-secondary/10 text-secondary border-secondary/20";
  return (
    <div className="flex flex-row items-center gap-2 w-full">
      {Icon && (
        <div
          className={twMerge(
            "p-3 rounded-lg border",
            iconClassColors,
            iconClass,
            size === "sm" ? "p-2" : size === "lg" ? "p-4" : "p-3"
          )}
        >
          <Icon size={iconSize} />
        </div>
      )}
      <div className="flex flex-row items-center gap-2 justify-between grow">
        <div className="flex flex-col">
          <h1
            className={twMerge(
              "text-2xl font-bold tracking-tight text-foreground",
              titleClass,
              size === "sm"
                ? "text-medium"
                : size === "lg"
                ? "text-3xl"
                : "text-2xl"
            )}
          >
            {title}
          </h1>
          {description && (
            <p
              className={twMerge(
                "text-sm text-muted opacity-80 max-w-lg",
                descriptionClass
              )}
            >
              {description}
            </p>
          )}
        </div>

        {titleEndContent && titleEndContent}
      </div>
    </div>
  );
}

export default PageHeader;
