import { useSession } from 'next-auth/react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import AuthModal from './AuthModal';
import { getCredentials, sessionKey } from '@/libs/utils/user';
import { fetchSds, useAppDispatch } from '@/libs/constants/AppFunctions';
import { saveLoginHandler } from '@/libs/redux/reducers/LoginReducer';
import useSWR from 'swr';

// Define the type for your context value
type AuthContextType = {
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


type Props = {
    data?: AccountExt;
    children: React.ReactNode;
}
// Create a provider component
export const AuthProvider = (props: Props) => {
    const { data, children } = props;
    const { data: session, status } = useSession();
    const [openAuth, setOpenAuth] = useState(false);
    const [credentials, setCredentials] = useState<User>();
    const [isNew, setIsNew] = useState(false);
    const dispatch = useAppDispatch();

    const URL = `/accounts_api/getAccountExt/${session?.user?.name}/${session?.user?.name}`
    const { data: accountExt } = useSWR(!!session?.user?.name && !data ? URL : undefined, fetchSds);
    if (!data && accountExt) {
        dispatch(saveLoginHandler(accountExt));
    }

    useEffect(() => {
        if (data) {
            dispatch(saveLoginHandler(data));
        }
        setCredentials(getCredentials());
    }, [])


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
                    onClose={() => setOpenAuth(false)}
                    onLoginSuccess={(user) => {
                        setCredentials(user);
                        setIsNew(false);
                    }}
                />
            )}
        </AuthContext.Provider>
    );
};