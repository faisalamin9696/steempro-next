import { Button, ButtonProps } from "@heroui/button";
import { useAccountsContext } from "../auth/AccountsContext";
import { LogOut } from "lucide-react";

interface Props extends Omit<ButtonProps, "onPress"> {
  onPress?: () => void;
}

function LogoutButton({ onPress, ...props }: Props) {
  const { manageLogout } = useAccountsContext();

  return (
    <Button
      variant="flat"
      color="danger"
      onPress={() => {
        onPress?.();
        manageLogout();
      }}
      startContent={<LogOut size={20} />}
      className="text-default-900 hover:text-danger"
      {...props}
    >
      Logout
    </Button>
  );
}

export default LogoutButton;
