"use client";

import { store } from "@/libs/redux/store";
import { NextUIProvider } from "@nextui-org/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next13-progressbar";
import { Provider as ReduxProvider } from "react-redux";
import React, { useEffect, useState } from "react";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { compress, decompress } from "lz-string";
import { AuthProvider } from "@/components/AuthProvider";
import AppNavbar from "@/components/navbar/AppNavbar";
import { ThemeProvider } from "next-themes";
import LoadingCard from "@/components/LoadingCard";
import { SWRConfig } from "swr";
import { fetchSds } from "@/libs/constants/AppFunctions";
import { firebaseConfig } from "@/libs/firebase/firebase.config";
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { Next13ProgressBar } from "next13-progressbar";
import AppWrapper from "@/components/wrappers/AppWrapper";
import { supabase } from "@/libs/supabase";

interface Props {
  children: React.ReactNode;
}
export function Providers(props: Props) {
  const { children } = props;

  let app;
  let analytics;
  if (typeof window != undefined) {
    app = initializeApp(firebaseConfig);
    analytics = isSupported().then((yes) => (yes ? getAnalytics(app) : null));
  }

  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    try {
      async () => {
        const { data } = await supabase.auth.getUser();
        const uid = data.user?.id;

        if (!uid) await supabase.auth.signInAnonymously();
      };
    } catch (error) {
      // failed silently
    }
  }, []);

  const client = new QueryClient({
    //Query client configurations go here...
    defaultOptions: {
      queries: {
        retry: 3,
        refetchOnWindowFocus: false,
        retryDelay: 5000,
        refetchOnReconnect: true,
        gcTime: 1000 * 60 * 60 * 24 * 4, // 4 days
      },
    },
  });

  persistQueryClient({
    queryClient: client,
    persister: createSyncStoragePersister({
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      serialize: (data) => compress(JSON.stringify(data)),
      deserialize: (data) => JSON.parse(decompress(data)),
    }),
    maxAge: 1000 * 60 * 60 * 24 * 1, // 1 day,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // useEffect(() => {
  //   const loadScript = async () => {
  //     const response_1 = await fetch("/static/script_1.js");
  //     const scriptContent_1 = await response_1.text();

  //     const response_2 = await fetch("/static/script_2.js");
  //     const scriptContent_2 = await response_2.text();

  //     const script1: HTMLScriptElement = document.createElement("script");
  //     script1.src =
  //       "https://fundingchoicesmessages.google.com/i/pub-4510618528305465?ers=1";
  //     script1.async = true;
  //     script1.nonce = "5RbzTXlClMTfa0ge67HxzA";

  //     const script2: HTMLScriptElement = document.createElement("script");
  //     script2.nonce = "5RbzTXlClMTfa0ge67HxzA";
  //     script2.innerHTML = scriptContent_1;

  //     const script3: HTMLScriptElement = document.createElement("script");
  //     script3.innerHTML = scriptContent_2;

  //     document.head.appendChild(script1);
  //     document.head.appendChild(script2);
  //     document.head.appendChild(script3);

  //     return () => {
  //       document.head.removeChild(script1);
  //       document.head.removeChild(script2);
  //     };
  //   };

  //   loadScript();
  // }, []);

  return (
    <>
      <ReduxProvider store={store}>
        <QueryClientProvider client={client}>
          <ThemeProvider attribute="class">
            <NextUIProvider navigate={router.push}>
              {isMounted ? (
                <SWRConfig
                  value={{
                    refreshInterval: 10 * 60 * 1000,
                    fetcher: fetchSds,
                    revalidateOnFocus: false,
                    errorRetryCount: 3,
                    shouldRetryOnError: true,
                    // onError: (error, key) => {
                    //     if (error.status !== 403 && error.status !== 404) {
                    //         toast.error(error);
                    //     }
                    // },
                    dedupingInterval: 10000,
                    loadingTimeout: 20000,
                    // revalidateOnMount: false
                  }}
                >
                  <AuthProvider>
                    <AppWrapper>
                      <AppNavbar />
                      {children}
                    </AppWrapper>
                  </AuthProvider>
                </SWRConfig>
              ) : (
                <LoadingCard />
              )}
            </NextUIProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ReduxProvider>
      <Next13ProgressBar
        height="4px"
        color="#ED4D5E"
        options={{ showSpinner: false }}
        showOnShallow
      />
    </>
  );
}
