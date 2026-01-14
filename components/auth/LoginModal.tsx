import SModal from "../ui/SModal";
import { ModalProps, Tab, Tabs } from "@heroui/react";
import PrivateKeyLogin from "./PrivateKeyLogin";
import KeychainLogin from "./KeychainLogin";
import { KeySquare } from "lucide-react";
import Image from "next/image";

interface Props extends Pick<ModalProps, "isOpen" | "onOpenChange"> {
  onLoginSuccess: () => void;
}

function LoginModal(props: Props) {
  const { onLoginSuccess } = props;
  return (
    <SModal title={"Login"} {...props} placement="center">
      {(onClose) => (
        <Tabs color="primary">
          <Tab
            title={
              <div className="flex flex-row items-center gap-2">
                <Image
                  height={20}
                  width={20}
                  src="/keychain.svg"
                  alt="Keychain"
                />
                <p>Keychain</p>
              </div>
            }
          >
            <KeychainLogin onSuccess={onLoginSuccess} />
          </Tab>
          <Tab
            title={
              <div className="flex flex-row items-center gap-2">
                <KeySquare size={20} />
                <p>Private Key</p>
              </div>
            }
          >
            <PrivateKeyLogin onSuccess={onLoginSuccess} />
          </Tab>
        </Tabs>
      )}
    </SModal>
  );
}

export default LoginModal;
