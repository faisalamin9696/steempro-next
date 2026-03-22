import { Button, ButtonProps } from "@heroui/button";
import { useAccountsContext } from "../auth/AccountsContext";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props extends Omit<ButtonProps, "onPress"> {
  onPress?: () => void;
  iconSize?: number;
}

function LogoutButton({ onPress, iconSize = 20, ...props }: Props) {
  const t = useTranslations("Common");
  const { manageLogout } = useAccountsContext();

  return (
    <Button
      variant="flat"
      color="danger"
      onPress={() => {
        onPress?.();
        manageLogout();
      }}
      startContent={<LogOut size={iconSize} />}
      className="text-default-900 hover:text-danger"
      {...props}
    >
      {!props.isIconOnly && t("logout")}
    </Button>
  );
}

export default LogoutButton;
