'use client';

import { store } from '@/libs/redux/store';
import { NextUIProvider } from '@nextui-org/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Provider as ReduxProvider } from "react-redux";
import React, { useEffect, useState } from "react";
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { compress, decompress } from 'lz-string';
import { LoginDialogProvider } from "@/components/useLogin";
import AppNavbar from '@/components/navbar/AppNavbar';
import { ThemeProvider } from 'next-themes'
import LoadingCard from '@/components/LoadingCard';
import { SessionProvider } from 'next-auth/react';
import { SWRConfig } from 'swr';
import { fetchSds } from '@/libs/constants/AppFunctions';


export function Providers({ children }:
    { children: React.ReactNode }) {

    const route = useRouter();
    const [isMounted, setIsMounted] = useState(false);


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
    return (
        <ReduxProvider store={store}>
            <QueryClientProvider client={client}>
                <ThemeProvider attribute="class"  >
                    <NextUIProvider navigate={route.push}>
                        {isMounted ? <SessionProvider>
                            <SWRConfig
                                value={{
                                    refreshInterval: 10 * 60 * 1000,
                                    fetcher: fetchSds,
                                    revalidateOnFocus: false
                                }}
                            >
                                <LoginDialogProvider>
                                    <AppNavbar />
                                    {children}
                                </LoginDialogProvider>
                            </SWRConfig>
                        </SessionProvider> : <LoadingCard />}
                    </NextUIProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </ReduxProvider>
    )
}