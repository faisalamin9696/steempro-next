'use client';

import { store } from '@/libs/redux/store';
import { NextUIProvider } from '@nextui-org/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next13-progressbar';
import { Provider as ReduxProvider } from "react-redux";
import React, { useEffect, useState } from "react";
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { compress, decompress } from 'lz-string';
import { AuthProvider } from "@/components/useLogin";
import AppNavbar from '@/components/navbar/AppNavbar';
import { ThemeProvider } from 'next-themes'
import LoadingCard from '@/components/LoadingCard';
import { SessionProvider } from 'next-auth/react';
import { SWRConfig } from 'swr';
import { fetchSds } from '@/libs/constants/AppFunctions';
import { firebaseConfig } from '@/libs/firebase/firebase.config';
import { initializeApp } from "firebase/app";
import {
    signInAnonymously, getAuth
} from "firebase/auth";
import { toast } from 'sonner';
import { Next13ProgressBar } from 'next13-progressbar';


interface Props {
    children: React.ReactNode;
    data: AccountExt,
    globalData: SteemProps;
}
export function Providers(props: Props) {
    const { children } = props;

    initializeApp(firebaseConfig);

    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const auth = getAuth();



    useEffect(() => {

       
        try {
            if (!auth.currentUser)
                signInAnonymously(auth);


        } catch (error) {
            // failed silently
        }

    }, [])


    const client = new QueryClient({
        //Query client configurations go here...
        defaultOptions: {
            queries: {
                retry: 3,
                refetchOnWindowFocus: false,
                gcTime: 1000 * 60 * 60 * 24 * 4, // 4 days

            },

        },
    });



    persistQueryClient({
        queryClient: client,
        persister: createSyncStoragePersister({
            storage: typeof window !== 'undefined' ? window.localStorage : undefined,
            serialize: data => compress(JSON.stringify(data)),
            deserialize: data => JSON.parse(decompress(data)),
        }),
        maxAge: Infinity,
    });


    useEffect(() => {
        setIsMounted(true);
    }, []);
    return (<>
        <ReduxProvider store={store}>
            <QueryClientProvider client={client}>
                <ThemeProvider attribute="class"  >
                    <NextUIProvider navigate={router.push}>
                        {isMounted ? <SessionProvider>
                            <SWRConfig
                                value={{
                                    refreshInterval: 10 * 60 * 1000,
                                    fetcher: fetchSds,
                                    revalidateOnFocus: false,
                                    errorRetryCount: 3,
                                    onError: (error, key) => {
                                        if (error.status !== 403 && error.status !== 404) {
                                            toast.error(error);
                                        }
                                    },
                                    dedupingInterval: 10000,
                                    loadingTimeout: 20000,
                                    // revalidateOnMount: false
                                }}


                            >
                                <AuthProvider {...props}>
                                    <AppNavbar />
                                    {children}
                                </AuthProvider>
                            </SWRConfig>
                        </SessionProvider> : <LoadingCard />}
                    </NextUIProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </ReduxProvider>
        <Next13ProgressBar height="4px"
            color="#ED4D5E"
            options={{ showSpinner: false }} showOnShallow />

    </>
    )
}