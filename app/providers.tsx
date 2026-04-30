"use client";

import { useEffect, useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { SWRConfig } from "swr";
import { store } from "@/hooks/redux/store";
import { Next13ProgressBar } from "next13-progressbar";
import { usePathname, useRouter } from "next/navigation";
import AppWrapper from "@/components/wrappers/AppWrapper";
import { SessionProvider } from "next-auth/react";
import { HeroUIProvider } from "@heroui/system";
import { AccountsProvider } from "@/components/auth/AccountsContext";
import { MobileNavbar } from "@/components/navbar/MobileNavbar";
import { Session } from "next-auth";
import ScrollToTop from "@/components/ui/ScrollToTop";
import LoadingCard from "@/components/ui/LoadingCard";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { Toaster } from "sonner";
import { twMerge } from "tailwind-merge";
import SNavbar from "@/components/navbar/SNavbar";
import SDrawerContent from "@/components/navbar/SDrawerContent";

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
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration mismatch - show loading until client is ready
  if (!isMounted) {
    return <LoadingCard />;
  }

  return (
    <SessionProvider
      session={session}
      refetchInterval={60 * 60}
      refetchOnWindowFocus={true}
    >
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
                <SNavbar />

                <div className="flex flex-col">
                  <MobileNavbar />

                  <div className="flex flex-row justify-start">
                    <aside
                      className={twMerge(
                        "w-72 hidden sticky top-16 shrink-0 xl:block border-e border-black/5 dark:border-white/5",
                        pathname === "/shorts"
                          ? "h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] md:top-16"
                          : "h-[calc(100vh-4rem)]",
                      )}
                    >
                      <SDrawerContent />
                    </aside>

                    <main
                      className={twMerge(
                        "w-full",
                        pathname === "/shorts" ? "pb-0" : "pb-20 md:pb-0",
                      )}
                    >
                      {children}
                    </main>
                  </div>

                  <ScrollToTopButton />
                  <Toaster richColors closeButton />
                </div>
              </AppWrapper>
            </AccountsProvider>
          </SWRConfig>
        </HeroUIProvider>
      </ReduxProvider>

      {/* Progress Bar */}
      <Next13ProgressBar
        height="4px"
        color="#ED4D5E"
        options={{ showSpinner: false }}
        showOnShallow
      />
    </SessionProvider>
  );
}

export default Providers;
