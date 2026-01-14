import { auth } from "@/auth";
import { sdsApi } from "@/libs/sds";
import React, { use } from "react";
import Providers from "./providers";
import { Toaster } from "sonner";

function AppLayout({ children }: { children: React.ReactNode }) {
  const globals = use(sdsApi.getGlobalProps());
  const session = use(auth());

  return (
    <Providers globals={globals} session={session}>
      {children}
      <Toaster richColors closeButton />
    </Providers>
  );
}

export default AppLayout;
