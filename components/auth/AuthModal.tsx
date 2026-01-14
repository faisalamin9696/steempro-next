import { Button, ModalProps } from "@heroui/react";
import SModal from "../ui/SModal";
import { AccountsList } from "./AccountsList";
import { useState } from "react";
import LoginModal from "./LoginModal";
import { useAccountsContext } from "./AccountsContext";
import { Plus, UserCog } from "lucide-react";

interface Props extends Pick<ModalProps, "isOpen" | "onOpenChange"> {}

function AuthModal(props: Props) {
  const { accounts } = useAccountsContext();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isPending } = useAccountsContext();

  return (
    <>
      <SModal
        scrollBehavior="inside"
        title={"Authentication"}
        description={
          "Manage unlimited accounts and switch between them with one click."
        }
        hideCloseButton={isPending}
        isDismissable={!isPending}
        placement="center"
        size="2xl"
        {...props}
      >
        {(onClose) => (
          <div className="flex flex-col gap-2">
            <div className="flex flex-row flex-wrap items-start justify-between gap-2">
              <div className="flex flex-row items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <UserCog size={24} />
                </div>

                <div className="flex flex-col">
                  <p className="text-xl font-bold">Connected Accounts</p>
                  <p className="text-sm text-muted">
                    {accounts.length} accounts connected
                  </p>
                </div>
              </div>
              <Button
                startContent={!isPending && <Plus />}
                color="primary"
                variant="flat"
                onPress={() => setShowLoginModal(true)}
                isLoading={isPending}
                className="max-sm:h-8 max-sm:rounded-lg max-sm:px-3! w-auto text-xs"
              >
                Add Account
              </Button>
            </div>

            <div className="mt-4">
              <AccountsList />
            </div>
          </div>
        )}
      </SModal>

      <LoginModal
        isOpen={showLoginModal}
        onOpenChange={setShowLoginModal}
        onLoginSuccess={() => setShowLoginModal(false)}
      />
    </>
  );
}

export default AuthModal;
