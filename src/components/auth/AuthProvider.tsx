"use client";

import { useSession } from "next-auth/react";
import React, { createContext, useContext, useState } from "react";
import AuthModal from "./AuthModal";
import { getCredentials, getSessionToken, sessionKey } from "@/libs/utils/user";
import AuthModal2 from "./AuthModal2";

// Define the type for your context value
interface AuthContextType {
  credentials?: User;
  authenticateUser: (isNew?: boolean) => void;
  isAuthorized: () => boolean;
  isLogin: () => boolean;
  setCredentials: React.Dispatch<React.SetStateAction<User | undefined>>;
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
  const [openAuth, setOpenAuth] = useState(false);
  let [credentials, setCredentials] = useState<User | undefined>(
    getCredentials()
  );
  const [isNew, setIsNew] = useState(false);

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

  function isAuthorized() {
    credentials = getCredentials();

    if (credentials?.keychainLogin) return true;

    if (isLogin() && credentials?.type === "ACTIVE" && !sessionKey) {
      return false;
    }
    const token = getSessionToken(session?.user?.name ?? credentials?.username);
    return isLogin() && (!!sessionKey || !!token);
  }

  function authenticateUser(isNew?: boolean) {
    if (isNew) {
      setIsNew(true);
      setOpenAuth(true);
    }

    credentials = getCredentials();

    if (credentials?.keychainLogin) {
      return true;
    }

    // if active key and not session login as for password
    if (credentials?.type === "ACTIVE" && !sessionKey) {
      setOpenAuth(true);
      return;
    }

    const token = getSessionToken(session?.user?.name ?? credentials?.username);

    if (isLogin() && !!token) return;

    if (!isLogin() || (isLogin() && !sessionKey)) {
      setOpenAuth(true);
      return;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        authenticateUser,
        credentials,
        isAuthorized,
        isLogin,
        setCredentials: setCredentials,
      }}
    >
      {children}

      {openAuth && (
        <AuthModal2
          isNew={isNew}
          open={openAuth}
          onClose={() => {
            setOpenAuth(false);
            setIsNew(false);
          }}
          onLoginSuccess={(user) => {
            setCredentials(user);
            if (isNew) setIsNew(false);
          }}
        />
      )}
    </AuthContext.Provider>
  );
};
