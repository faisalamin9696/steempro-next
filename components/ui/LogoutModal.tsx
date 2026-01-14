import { Button } from "@heroui/button";
import { ModalProps } from "@heroui/modal";
import SModal from "./SModal";
import { useAccountsContext } from "../auth/AccountsContext";
import { useState } from "react";
import { toast } from "sonner";

interface Props extends Pick<ModalProps, "isOpen" | "onOpenChange"> {}

function LogoutModal(props: Props) {
  const { current, logout } = useAccountsContext();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    try {
      setIsPending(true);
      await logout();
    } catch (error: any) {
      toast.error("Error", {
        description: error?.message ?? "Something went wrong",
      });
      console.error(error);
    } finally {
      setIsPending(false);
    }
  }
  return (
    <SModal
      title={"Logout"}
      description={`Do you really want to logout from @${current?.username}?`}
      {...props}
      closeButton={!isPending}
      isDismissable={!isPending}
    >
      {(onClose) => (
        <div className="flex flex-row gap-2 self-end">
          <Button onPress={onClose} variant="flat">
            Cancel
          </Button>
          <Button
            isLoading={isPending}
            onPress={handleLogout}
            variant="solid"
            color="danger"
          >
            Logout
          </Button>
        </div>
      )}
    </SModal>
  );
}

export default LogoutModal;
