import { Button, ButtonProps } from "@heroui/button";
import { useAccountsContext } from "../auth/AccountsContext";
import { UserCog } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { useTranslations } from "next-intl";

interface Props extends Omit<ButtonProps, "title" | "onPress"> {
  title?: string | React.ReactNode;
  onPress?: () => void;
  iconSize?: number;
  iconClass?: string;
}
function ManageAccountsButton({
  title,
  iconSize = 20,
  onPress,
  iconClass,
  ...rest
}: Props) {
  const t = useTranslations("Auth");
  const { manageAccounts } = useAccountsContext();
  const label = title ?? t("manageAccounts");
  return (
    <>
      <Button
        title={typeof label === "string" ? label : undefined}
        startContent={
          <UserCog
            className={twMerge("shrink-0", iconClass)}
            size={iconSize ?? 20}
          />
        }
        {...rest}
        onPress={() => {
          manageAccounts();
          onPress?.();
        }}
      >
        {label}
      </Button>
    </>
  );
}

export default ManageAccountsButton;
