'use client';

import { useSession } from 'next-auth/react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import AuthModal from './AuthModal';
import { getCredentials, getSessionToken, sessionKey } from '@/libs/utils/user';
import secureLocalStorage from 'react-secure-storage';

// Define the type for your context value
interface AuthContextType {
    credentials?: User;
    authenticateUser: (isNew?: boolean) => void;
    isAuthorized: () => boolean;
    isLogin: () => boolean;
};

// Create the context with an initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a custom hook to access the context
export const useLogin = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useLogin must be used within a AuthProvider');
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
    const [credentials, setCredentials] = useState<User>();
    const [isNew, setIsNew] = useState(false);


    useEffect(() => {
        setCredentials(getCredentials());
    }, []);


    function isLogin() {
        return (status === 'authenticated' || (status === 'loading' && (!!sessionKey || !!secureLocalStorage.getItem('token'))))
    }

    function isAuthorized() {
        const token = getSessionToken(session?.user?.name);
        return isLogin() && (!!sessionKey || !!token)
    }


    function authenticateUser(isNew?: boolean) {
        if (isNew) {
            setIsNew(true);
            setOpenAuth(true);
        }

        const token = getSessionToken(session?.user?.name);

        if (isLogin() && (!sessionKey && (credentials?.type === 'POSTING' || credentials?.type === 'MEMO') && token))
            return

        if (!isLogin() || (isLogin() && !sessionKey)) {
            setOpenAuth(true);
            return
        }
    }


    return (
        <AuthContext.Provider
            value={{ authenticateUser, credentials, isAuthorized, isLogin }}>
            {children}

            {openAuth && (
                <AuthModal
                    isNew={isNew}
                    open={openAuth}
                    onClose={() => {
                        setOpenAuth(false);
                        setIsNew(false);
                    }}
                    onLoginSuccess={(user) => {
                        setCredentials(user);
                        if (isNew)
                            setIsNew(false);
                    }}
                />
            )}
        </AuthContext.Provider>
    );
};