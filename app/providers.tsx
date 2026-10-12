"use client";

import { useEffect } from "react";
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
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { Toaster } from "sonner";
import { twMerge } from "tailwind-merge";
import SNavbar from "@/components/navbar/SNavbar";
import SDrawerContent from "@/components/navbar/SDrawerContent";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";

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
  const { collapsed, toggle } = useSidebarCollapsed();

  // NOTE: The app must render on the server. An `isMounted` gate here used to
  // swap the whole tree for a loading spinner during SSR, which meant every
  // page shipped an HTML shell containing only <title> + "Loading..." — no
  // content, no headings and no links for search engines to crawl or index.
  // Anything that genuinely mismatches on hydration must be fixed at the
  // component level (or wrapped in its own boundary), not by hiding the tree.

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
                        "hidden sticky top-16 shrink-0 xl:block border-e border-black/5 dark:border-white/5",
                        // Animate only `width`, and clip the contents in the
                        // wrapper below: the labels fade/collapse on their own
                        // while the rail shrinks over them, so nothing reflows
                        // mid-animation.
                        "transition-[width] duration-300 ease-in-out",
                        collapsed ? "w-[76px]" : "w-72",
                        pathname === "/shorts"
                          ? "h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] md:top-16"
                          : "h-[calc(100vh-4rem)]",
                      )}
                    >
                      <div className="h-full overflow-hidden">
                        <SDrawerContent
                          collapsed={collapsed}
                          onToggleCollapse={toggle}
                        />
                      </div>
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
