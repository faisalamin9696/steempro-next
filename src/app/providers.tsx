"use client";

import { store } from "@/hooks/redux/store";
import { HeroUIProvider } from "@heroui/system";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import React, { useEffect, useState } from "react";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { compress, decompress } from "lz-string";
import { AuthProvider } from "@/components/auth/AuthProvider";
import LoadingCard from "@/components/LoadingCard";
import { SWRConfig } from "swr";
import { fetchSds } from "@/constants/AppFunctions";
import { Next13ProgressBar } from "next13-progressbar";
import AppWrapper from "@/components/wrappers/AppWrapper";
import { supabase } from "@/libs/supabase";
import PiwikPro from "@piwikpro/react-piwik-pro";
import DrawerContent from "@/components/navbar/components/DrawerContent";
import AppNavbar from "@/components/navbar/AppNavbar";
import { ThemeProvider } from "next-themes";
import { initFirebase } from "@/utils/helper/firabase";
import { useRouter } from "next/navigation";
import { cleanupCommentDrafts } from "@/utils/draft";
import MobileNavbar from "@/components/navbar/MobileNavbar";

interface Props {
  children: React.ReactNode;
}
export function Providers(props: Props) {
  const { children } = props;

  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    try {
      initFirebase();
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
        gcTime: 1000 * 60 * 60 * 24 * 4, // 4 days,
        staleTime: 1000 * 60 * 5,
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
    cleanupCommentDrafts();
    PiwikPro.initialize(
      "70c8840a-d55a-4a1f-a3af-d1a06b46a5dc",
      "https://steempro.piwik.pro"
    );
  }, []);

  return (
    <>
      <ReduxProvider store={store}>
        <QueryClientProvider client={client}>
          <ThemeProvider attribute="class">
            <HeroUIProvider navigate={router.push}>
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
                      <div className="w-full">
                        <AppNavbar />
                        <MobileNavbar />
                        <div className="w-full flex flex-row pb-20 md:pb-0">
                          <div className="flex-col hidden z-10 shadow-md dark:shadow-white/5 w-72 2lg:block sticky h-full-minus-64 top-16 pb-4">
                            <DrawerContent />
                          </div>
                          <div className="w-full">{children}</div>
                        </div>
                      </div>
                    </AppWrapper>
                  </AuthProvider>
                </SWRConfig>
              ) : (
                <LoadingCard />
              )}
            </HeroUIProvider>
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
