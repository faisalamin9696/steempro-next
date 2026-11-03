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
  /**
   * Login finished. `announced` = the panel already showed its own success
   * toast (SteemAuth: "Signed in as @… / Your phone keeps this session"), so
   * the caller must NOT add a generic "Login success" on top of it — the two
   * stacked toasts buried the meaningful one.
   */
  onLoginSuccess: (announced: boolean) => void;
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
  /** The panel toasted its own success — suppress the generic one. */
  selfAnnounced?: boolean;
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
    // Shows "Signed in as @… / Your phone keeps this session" itself.
    selfAnnounced: true,
  },
];

function LoginModal({ onLoginSuccess, ...modalProps }: Props) {
  // `onLoginSuccess` is destructured out on purpose: spreading it into SModal
  // would forward it through Modal down to a DOM element, where React warns
  // "Unknown event handler property" (and ignores it). Only modal props spread.
  return (
    <SModal title={"Login"} {...modalProps} placement="center">
      {() => (
        <Tabs color="primary">
          {LOGIN_METHODS.map(({ key, label, icon, Panel, selfAnnounced }) => (
            <Tab
              key={key}
              title={
                <div className="flex flex-row items-center gap-2">
                  {icon}
                  <p>{label}</p>
                </div>
              }
            >
              <Panel onSuccess={() => onLoginSuccess(!!selfAnnounced)} />
            </Tab>
          ))}
        </Tabs>
      )}
    </SModal>
  );
}

export default LoginModal;
