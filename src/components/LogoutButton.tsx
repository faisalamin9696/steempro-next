import { Button } from "@heroui/button";
import { useDisclosure } from "@heroui/modal";
import React, { useState } from "react";
import { IoLogOut } from "react-icons/io5";
import SModal from "./ui/SModal";
import { signOut, useSession } from "next-auth/react";
import { useLogin } from "./auth/AuthProvider";
import { getCredentials, getSessionKey, removeCredentials } from "@/utils/user";
import { toast } from "sonner";
import { logoutHandler } from "@/hooks/redux/reducers/LoginReducer";
import { AsyncUtils } from "@/utils/async.utils";
import { useAppDispatch } from "@/constants/AppFunctions";
import { twMerge } from "tailwind-merge";

function LogoutButton({
  onPress,
  iconSize,
  className,
  variant,
}: {
  onPress?: () => void;
  iconSize?: number;
  className?: string;
  variant?:
    | "light"
    | "flat"
    | "solid"
    | "bordered"
    | "faded"
    | "shadow"
    | "ghost"
    | undefined;
}) {
  const logoutDisclosure = useDisclosure();
  const { data: session, status } = useSession();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const { authenticateUser, isAuthorized, credentials, setCredentials } =
    useLogin();
  const dispatch = useAppDispatch();

  async function handleLogout() {
    authenticateUser();
    if (!isAuthorized()) {
      return;
    }

    setLogoutLoading(true);

    const credentials = getCredentials(getSessionKey(session?.user?.name));
    if (!credentials?.key) {
      toast.error("Invalid credentials");
      setLogoutLoading(false);
      return;
    }

    removeCredentials(credentials);
    dispatch(logoutHandler());
    // simulate for two seconds
    await AsyncUtils.sleep(2);
    await signOut();
    setLogoutLoading(false);
    toast.success(`${credentials.username} logged out successfully`);
  }

  return (
    <>
      <Button
        className={twMerge(
          "w-full justify-start items-center text-foreground",
          className
        )}
        size="md"
        variant={variant ?? "light"}
        color="danger"
        onPress={() => {
          logoutDisclosure.onOpen();
          onPress?.();
        }}
        startContent={<IoLogOut size={iconSize ?? 20} />}
      >
        Logout
      </Button>

      <SModal
        isOpen={logoutDisclosure.isOpen}
        onOpenChange={logoutDisclosure.onOpenChange}
        modalProps={{ hideCloseButton: true, isDismissable: !logoutLoading }}
        title={() => "Confirmation"}
        subTitle={() => (
          <p>Do you really want to logout {session?.user?.name}?</p>
        )}
        footer={(onClose) => (
          <>
            <Button
              color="default"
              isDisabled={logoutLoading}
              variant="light"
              onPress={onClose}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              isLoading={logoutLoading}
              className="text-white"
              onPress={() => {
                handleLogout();
              }}
            >
              Logout
            </Button>
          </>
        )}
        body={(onClose) => <></>}
      />
    </>
  );
}

export default LogoutButton;
