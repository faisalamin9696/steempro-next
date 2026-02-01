import { Button, ButtonProps } from "@heroui/button";
import { useAccountsContext } from "../auth/AccountsContext";
import { LogOut } from "lucide-react";

interface Props extends Omit<ButtonProps, "onPress"> {
  onPress?: () => void;
  iconSize?: number;
}

function LogoutButton({ onPress, iconSize = 20, ...props }: Props) {
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
      {!props.isIconOnly && "Logout"}
    </Button>
  );
}

export default LogoutButton;
