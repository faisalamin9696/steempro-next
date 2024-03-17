'use client';

import { useSession } from 'next-auth/react';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AuthModal from './AuthModal';
import { getCredentials, sessionKey } from '@/libs/utils/user';
import { fetchSds, useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { saveLoginHandler } from '@/libs/redux/reducers/LoginReducer';
import useSWR from 'swr';
import { saveSteemGlobals } from '@/libs/redux/reducers/SteemGlobalReducer';
import { WitnessAccount, defaultNotificationFilters } from '@/libs/constants/AppConstants';
import { toast } from 'sonner';
import { useRouter } from 'next13-progressbar';

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


const defFilter = defaultNotificationFilters;

const filter = {
    "mention": { "exclude": defFilter.mention.status, "minSP": defFilter.mention.minSp, "minReputation": defFilter.mention.minRep },
    "vote": { "exclude": defFilter.vote.status, "minVoteAmount": defFilter.vote.minVote, "minReputation": defFilter.vote.minRep, "minSP": defFilter.vote.minSp },
    "follow": { "exclude": defFilter.follow.status, "minSP": defFilter.follow.minSp, "minReputation": defFilter.follow.minRep },
    "resteem": { "exclude": defFilter.resteem.status, "minSP": defFilter.resteem.minSp, "minReputation": defFilter.resteem.minRep },
    "reply": { "exclude": defFilter.reply.status, "minSP": defFilter.reply.minSp, "minReputation": defFilter.reply.minRep }
};
interface Props {
    data: AccountExt;
    children: React.ReactNode;
    globalData: SteemProps;
}
// Create a provider component
export const AuthProvider = (props: Props) => {
    let { data, children, globalData } = props;
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            // window.location.reload();
        }
    });
    const [openAuth, setOpenAuth] = useState(false);
    const [credentials, setCredentials] = useState<User>();
    const [isNew, setIsNew] = useState(false);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const [loginUser, setLoginUser] = useState(loginInfo.name);

    const URL = `/notifications_api/getFilteredUnreadCount/${loginUser}/${JSON.stringify(filter)}`;
    const { data: unreadCount } = useSWR(loginUser && URL, fetchSds<number>, {
        shouldRetryOnError: true,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        refreshInterval: 300000 // 5 minutes
    });


    useMemo(() => {
        if (session?.user?.name && status === 'authenticated') {
            setLoginUser(session.user.name);
        } else {
            setLoginUser('');
        }

    }, [session?.user?.name, status]);

   


    useEffect(() => {

        if (!!loginUser && (loginUser === data?.name)) {
            data = { ...data, unread_count: unreadCount ?? 0 }
            dispatch(saveLoginHandler(data));
        } else {
            if (!!loginInfo.name)
                dispatch(saveLoginHandler({ ...loginInfo, unread_count: unreadCount ?? 0 }));
        }

    }, [unreadCount, data, loginUser]);


    useEffect(() => {
        // if (data) {
        //     dispatch(saveLoginHandler(data));
        // }

        const timeout = setTimeout(() => {
            if (!data?.witness_votes?.includes(WitnessAccount)) {
                toast(`Vote for witness (${WitnessAccount})`, {
                    action: {
                        label: 'Vote',

                        onClick: () => { router.push('/witnesses'); }
                    }, closeButton: false, duration: 60000
                });
            }
        }, 2000);

        if (globalData) {
            dispatch(saveSteemGlobals(globalData));
        }
        setCredentials(getCredentials());

        return () => clearTimeout(timeout);
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