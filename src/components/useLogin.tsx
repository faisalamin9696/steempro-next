'use client';

import { useSession } from 'next-auth/react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import AuthModal from './AuthModal';
import { getCredentials, sessionKey } from '@/libs/utils/user';

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
    const { status } = useSession();
    const [openAuth, setOpenAuth] = useState(false);
    const [credentials, setCredentials] = useState<User>();
    const [isNew, setIsNew] = useState(false);


    useEffect(() => {
        setCredentials(getCredentials());
    }, []);


    function isLogin() {
        return (status === 'authenticated' || (status === 'loading' && !!sessionKey))
    }

    function isAuthorized() {
        return isLogin() && !!sessionKey
    }


    function authenticateUser(isNew?: boolean) {
        if (isNew) {
            setIsNew(true);
            setOpenAuth(true);
        }

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