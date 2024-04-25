"sue client";

import { WitnessAccount, DefaultNotificationFilters } from '@/libs/constants/AppConstants';
import { fetchSds, useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { saveLoginHandler } from '@/libs/redux/reducers/LoginReducer';
import { saveSteemGlobals } from '@/libs/redux/reducers/SteemGlobalReducer';
import { getAuthorExt } from '@/libs/steem/sds';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next13-progressbar';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import useSWR from 'swr';

const defFilter = DefaultNotificationFilters;
const filter = {
    "mention": { "exclude": defFilter.mention.status, "minSP": defFilter.mention.minSp, "minReputation": defFilter.mention.minRep },
    "vote": { "exclude": defFilter.vote.status, "minVoteAmount": defFilter.vote.minVote, "minReputation": defFilter.vote.minRep, "minSP": defFilter.vote.minSp },
    "follow": { "exclude": defFilter.follow.status, "minSP": defFilter.follow.minSp, "minReputation": defFilter.follow.minRep },
    "resteem": { "exclude": defFilter.resteem.status, "minSP": defFilter.resteem.minSp, "minReputation": defFilter.resteem.minRep },
    "reply": { "exclude": defFilter.reply.status, "minSP": defFilter.reply.minSp, "minReputation": defFilter.reply.minRep }
};

let isPinged = false;

export default function AppWrapper({ children }: { children: React.ReactNode }) {

    const { data: session, status } = useSession();
    const [username, setUsername] = useState<string | undefined | null>(session?.user?.name);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const loginInfo = useAppSelector(state => state.loginReducer.value);


    function pingForWitnessVote() {
        if (!isPinged) {
            toast(`Vote for witness (${WitnessAccount})`, {
                action: { label: 'Vote', onClick: () => { router.push('/witnesses'); } },
                closeButton: false, duration: 10000,
            });
            isPinged = true;
        }
    };

    // gettting login user from session
    useEffect(() => {
        if (status === 'authenticated' && session.user?.name)
            setUsername(session.user.name);

        // let timeout;
        // if (status === 'unauthenticated')
        //     timeout = setTimeout(() => {
        //         pingForWitnessVote();
        //     }, 5000);

        // return () => clearTimeout(timeout);

    }, [status]);


    useEffect(() => {

        if (!!session?.user?.name) {
            if (session.user.name !== username) {
                setUsername(session.user.name);
            }
        }

    }, [session?.user?.name, username]);


    const { data: globalData } = useSWR(`/steem_requests_api/getSteemProps`, fetchSds<SteemProps>, {
        shouldRetryOnError: true,
        refreshInterval: 600000, // 10 minutes
        errorRetryInterval: 5000
    });


    const { data: accountData } = useSWR(username && [username], getAuthorExt, {
        shouldRetryOnError: true,
        refreshInterval: 300000, // 10 minutes
        errorRetryInterval: 3000
    });

    const URL = `/notifications_api/getFilteredUnreadCount/${loginInfo?.name}/${JSON.stringify(filter)}`;

    const { data: unreadData } = useSWR(!!loginInfo?.name && URL, fetchSds<number>, {
        shouldRetryOnError: true,
        refreshInterval: 300000, // 10 minutes
        errorRetryInterval: 10000
    });



    // saving the fetched data in redux state
    useEffect(() => {

        if (accountData) {
            dispatch(saveLoginHandler({ ...accountData, unread_count: loginInfo?.name === username ? (loginInfo?.unread_count ?? 0) : 0 }));
            // if (!accountData.witness_votes.includes(WitnessAccount))
            //     pingForWitnessVote();
        }
        if (globalData)
            dispatch(saveSteemGlobals(globalData));

    }, [globalData, accountData]);



    useEffect(() => {
        if (unreadData) {
            dispatch(saveLoginHandler({ ...loginInfo, unread_count: unreadData ?? 0 }));
        }

    }, [unreadData]);

    return (
        <div>
            {children}
        </div>
    )
}
