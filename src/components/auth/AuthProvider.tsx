"use client";

import { useSession } from "next-auth/react";
import React, { createContext, useContext, useState } from "react";
import {
  getCredentials,
  getSessionKey,
  getSessionToken,
  saveSessionKey,
  sessionKey,
} from "@/utils/user";
import AuthModal from "./AuthModal";
import { useDisclosure } from "@heroui/modal";

// Define the type for your context value
interface AuthContextType {
  credentials?: User;
  authenticateUser: (addNew?: boolean, onlyMemo?: boolean) => void;
  isAuthorized: (memo?: boolean, key?: string) => boolean;
  isAuthorizedActive: (key?: string) => boolean;
  isLogin: () => boolean;
  setCredentials: React.Dispatch<React.SetStateAction<User | undefined>>;
  authenticateUserActive: (isKeychain?: boolean) => User | undefined;
}

// Create the context with an initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a custom hook to access the context
export const useLogin = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useLogin must be used within a AuthProvider");
  }
  return context;
};

interface Props {
  children: React.ReactNode;
}
// Create a provider component
export const AuthProvider = (props: Props) => {
  let { children } = props;
  const { status, data: session } = useSession();
  const authDisclosure = useDisclosure();
  let [credentials, setCredentials] = useState<User | undefined>(
    getCredentials()
  );
  const [addNew, setAddNew] = useState(false);
  const [addMemo, setAddMemo] = useState(false);
  const [requestActive, setRequestActive] = useState(false);
  const [activeKey, setActiveKey] = useState("");

  // useEffect(() => {
  //     setCredentials(getCredentials());
  // }, []);

  function isLogin() {
    return (
      status === "authenticated" ||
      (status === "loading" &&
        (!!sessionKey || !!getSessionToken(credentials?.username)))
    );
  }

  function isAuthorized(memo?: boolean, key?: string) {
    credentials = getCredentials();

    if (key) {
      setActiveKey("");
      return true;
    }

    if (memo) {
      if (!credentials?.memo || !isLogin()) return false;
    }

    if (credentials?.keychainLogin) return true;

    if (isLogin() && credentials?.type === "ACTIVE" && !sessionKey) {
      return false;
    }
    const token = getSessionToken(session?.user?.name ?? credentials?.username);
    return isLogin() && (!!sessionKey || !!token);
  }

  function isAuthorizedActive(key?: string) {
    credentials = getCredentials();

    if (key) {
      if (activeKey) setActiveKey("");
      return true;
    }
    if (credentials?.keychainLogin) return true;

    if (isLogin() && key) {
      return true;
    }
    if (isLogin() && credentials?.type === "ACTIVE" && !sessionKey) {
      return false;
    }

    if (isLogin() && !key) {
      return false;
    }
    const token = getSessionToken(session?.user?.name ?? credentials?.username);
    return isLogin() && (!!sessionKey || !!token);
  }

  function authenticateUser(addNew?: boolean, onlyMemo?: boolean) {
    if (requestActive) setRequestActive(false);
    if (addNew) {
      setAddNew(true);
      authDisclosure.onOpen();
    }

    credentials = getCredentials();

    if (onlyMemo && !credentials?.memo && isLogin()) {
      setAddMemo(true);
      authDisclosure.onOpen();
    }
    if (credentials?.keychainLogin) {
      return true;
    }

    if (credentials?.passwordless) {
      saveSessionKey("steemcn");
      return true;
    }

    // if active key and not session login as for password
    if (credentials?.type === "ACTIVE" && !sessionKey) {
      authDisclosure.onOpen();
      return;
    }

    const token = getSessionToken(session?.user?.name ?? credentials?.username);

    if (isLogin() && !!token) return;

    if (!isLogin() || (isLogin() && !sessionKey)) {
      authDisclosure.onOpen();
      return;
    }
  }

  function authenticateUserActive(isKeychain?: boolean) {
    if (!isLogin()) {
      setRequestActive(false);
      authDisclosure.onOpen();
      return;
    }

    if (isKeychain) return { ...credentials, keychainLogin: true } as User;

    if (credentials?.keychainLogin) {
      return { ...credentials, key: "keychain", type: "POSTING" } as User;
    }
    // if active key and not session login as for password
    if (credentials?.type !== "ACTIVE" && !activeKey) {
      setRequestActive(true);
      authDisclosure.onOpen();
      return;
    }

    if (activeKey) {
      return { ...credentials, key: activeKey } as User;
    }

    // if active key and not session login as for password
    if (credentials?.type === "ACTIVE" && !sessionKey) {
      authDisclosure.onOpen();
      return;
    }

    const token = getSessionToken(session?.user?.name ?? credentials?.username);

    if (isLogin() && !token && credentials?.type === "ACTIVE") {
      return getCredentials(
        getSessionKey(session?.user?.name ?? credentials?.username)
      );
    }

    if (isLogin() && !!token)
      return getCredentials(
        getSessionKey(session?.user?.name ?? credentials?.username)
      );
  }

  return (
    <AuthContext.Provider
      value={{
        authenticateUser,
        authenticateUserActive,
        credentials,
        isAuthorized,
        isLogin,
        setCredentials: setCredentials,
        isAuthorizedActive,
      }}
    >
      {children}

      {authDisclosure.isOpen && (
        <AuthModal
          onActiveSuccess={(key) => {
            if (requestActive) setRequestActive(false);
            setActiveKey(key);
          }}
          requestActive={requestActive}
          addMemo={addMemo}
          addNew={addNew}
          isOpen={authDisclosure.isOpen}
          onOpenChange={(isOpen) => {
            setAddNew(isOpen);
            setAddMemo(isOpen);
            authDisclosure.onClose();
          }}
          onLoginSuccess={(user) => {
            setCredentials(user);
            if (addNew) setAddNew(false);
            if (addMemo) setAddMemo(false);
          }}
        />
      )}
    </AuthContext.Provider>
  );
};
