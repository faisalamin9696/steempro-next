"use client";

import { Suspense, useEffect, useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { SWRConfig } from "swr";
import { store } from "@/hooks/redux/store";
import { Next13ProgressBar, useRouter } from "next13-progressbar";
import AppWrapper from "@/components/wrappers/AppWrapper";
import { SessionProvider } from "next-auth/react";
import { HeroUIProvider } from "@heroui/system";
import SNavbar from "@/components/navbar/SNavbar";
import SDrawerContent from "@/components/navbar/SDrawerContent";
import { AccountsProvider } from "@/components/auth/AccountsContext";
import { MobileNavbar } from "@/components/navbar/MobileNavbar";
import { Session } from "next-auth";
import ScrollToTop from "@/components/ui/ScrollToTop";
import LoadingCard from "@/components/ui/LoadingCard";

function Providers({
  children,
  globals,
  session,
}: {
  children: React.ReactNode;
  globals: any;
  session: Session | null;
}) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <SessionProvider session={session}>
      <ScrollToTop />
      <ReduxProvider store={store}>
        <HeroUIProvider navigate={router.push}>
          <SWRConfig
            value={{
              refreshInterval: 10 * 60 * 1000,
              revalidateOnFocus: false,
              errorRetryCount: 3,
              shouldRetryOnError: true,
              dedupingInterval: 10000,
              loadingTimeout: 20000,
            }}
          >
            <AccountsProvider>
              <AppWrapper globals={globals}>
                {isMounted ? (
                  <div className="flex flex-col">
                    <SNavbar />
                    <MobileNavbar />
                    <div className="flex flex-row justify-start">
                      <aside className="w-72 hidden sticky top-16 h-[calc(100vh-4rem)] shrink-0 xl:block border-e border-black/5 dark:border-white/5">
                        <SDrawerContent />
                      </aside>
                      <span className="px-0.5 w-full pb-20 md:pb-0">
                        {children}
                      </span>
                    </div>
                  </div>
                ) : (
                  <LoadingCard />
                )}
              </AppWrapper>
            </AccountsProvider>
          </SWRConfig>
        </HeroUIProvider>
      </ReduxProvider>
      <Suspense fallback={null}>
        <Next13ProgressBar
          height="4px"
          color="#ED4D5E"
          options={{ showSpinner: false }}
          showOnShallow
        />
      </Suspense>
    </SessionProvider>
  );
}

export default Providers;
