import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { empty_profile } from '@/libs/constants/Placeholders';
import { logoutHandler, saveLoginHandler } from '@/libs/redux/reducers/LoginReducer';
import { getCredentials, sessionKey } from '@/libs/utils/user';
import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import AuthModal from './AuthModal';
import { SessionProvider, useSession } from "next-auth/react"

interface LoginDialogContextType {
    isDialogOpen: boolean;
    authenticateUser: () => void;
    closeAuthentication: () => void;
    isAuthorized: boolean;
    isLoggedIn: boolean;
    credentials?: User;
}

const LoginDialogContext = createContext<LoginDialogContextType>({
    isDialogOpen: false,
    authenticateUser: () => { },
    closeAuthentication: () => { },
    isAuthorized: false,
    isLoggedIn: false,
    credentials: undefined,
});

export const LoginDialogProvider = ({ children, data }:
    { children: React.ReactNode, data?: AccountExt }) => {
    const { data: session, status } = useSession();
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const dispatch = useAppDispatch();


    useEffect(() => {
        if (data) {
            dispatch(saveLoginHandler(data));
        }
    }, []);

    // useEffect(() => {
    //     if (session?.user?.name) {
    //         dispatch(saveLoginHandler({ ...loginInfo, ...loginInfo, login: true }));
    //     } else {
    //         dispatch(logoutHandler());
    //     }
    // }, [status]);

    const isLoggedIn = useMemo(() => status === 'authenticated', [session]);
    const isLocked = isLoggedIn && !sessionKey;

    const authenticateUser = () => {
        if (!isLoggedIn || !sessionKey) setDialogOpen(true);
        else onSuccess(session?.user as User);
    };

    const closeAuthentication = () => {
        setDialogOpen(false);
    };

    const onSuccess = (user?: User) => {
        setIsAuthorized(true);
    };

    const contextValue: LoginDialogContextType = {
        isDialogOpen,
        authenticateUser,
        closeAuthentication,
        isAuthorized,
        isLoggedIn,
        credentials: { username: session?.user?.name, key: '' } as User,
    };

    return (
        <LoginDialogContext.Provider value={contextValue}>
            {children}
            {isDialogOpen && (
                <AuthModal
                    open={isDialogOpen}
                    onClose={closeAuthentication}
                    onLoginSuccess={() => onSuccess(session?.user as User)}
                    isLocked={isLocked}
                />
            )}
        </LoginDialogContext.Provider>
    );
};

export const useLogin = (): LoginDialogContextType => {
    const context = useContext(LoginDialogContext);
    if (!context) {
        throw new Error('useLogin must be used within a LoginDialogProvider');
    }
    return context;
};
