import type { ComponentType } from "react";
import SModal from "../ui/SModal";
import { Tab, Tabs } from "@heroui/tabs";
import { ModalProps } from "@heroui/modal";
import PrivateKeyLogin from "./PrivateKeyLogin";
import KeychainLogin from "./KeychainLogin";
import SteemAuthLogin from "./SteemAuthLogin";
import { KeySquare, Smartphone } from "lucide-react";
import Image from "next/image";

interface Props extends Pick<ModalProps, "isOpen" | "onOpenChange"> {
  onLoginSuccess: () => void;
}

/**
 * How a user may sign in, as one declarative list.
 *
 * Each method is a peer: same tab shape, same `onSuccess` contract, same
 * place in the UI. SteemAuth sits beside Keychain and Private Key rather than
 * bolted on beside them — and adding a fourth way in means one entry here,
 * not another hand-written `<Tab>` block.
 *
 * Ordering is deliberate: Keychain first (fastest — one extension click),
 * Private Key second (the always-available fallback), SteemAuth third
 * (passwordless, requires the phone).
 */
interface LoginMethod {
  key: string;
  label: string;
  icon: React.ReactNode;
  Panel: ComponentType<{ onSuccess: () => void }>;
}

const LOGIN_METHODS: LoginMethod[] = [
  {
    key: "keychain",
    label: "Keychain",
    icon: <Image height={20} width={20} src="/keychain.svg" alt="Keychain" />,
    Panel: KeychainLogin,
  },
  {
    key: "private-key",
    label: "Private Key",
    icon: <KeySquare size={20} />,
    Panel: PrivateKeyLogin,
  },
  {
    key: "steemauth",
    label: "SteemAuth",
    icon: <Smartphone size={20} />,
    Panel: SteemAuthLogin,
  },
];

function LoginModal(props: Props) {
  const { onLoginSuccess } = props;
  return (
    <SModal title={"Login"} {...props} placement="center">
      {() => (
        <Tabs color="primary">
          {LOGIN_METHODS.map(({ key, label, icon, Panel }) => (
            <Tab
              key={key}
              title={
                <div className="flex flex-row items-center gap-2">
                  {icon}
                  <p>{label}</p>
                </div>
              }
            >
              <Panel onSuccess={onLoginSuccess} />
            </Tab>
          ))}
        </Tabs>
      )}
    </SModal>
  );
}

export default LoginModal;
