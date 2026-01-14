import { Button, ButtonProps } from "@heroui/button";
import { useAccountsContext } from "../auth/AccountsContext";
import { UserCog, Users } from "lucide-react";
import { twMerge } from "tailwind-merge";

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
  const { manageAccounts } = useAccountsContext();
  return (
    <>
      <Button
        title="Manage Accounts"
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
        {title ?? "Manage Accounts"}
      </Button>
    </>
  );
}

export default ManageAccountsButton;
