import { updateSession } from "@/libs/supabase/proxy";
import { type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Crawler-facing files are excluded on purpose: a sitemap, robots file or
     * llms.txt must never wait on a Supabase cookie check, and must never be
     * able to pick up a Set-Cookie or a redirect on the way out. Static assets
     * are excluded for the same "no session needed" reason.
     *
     * Everything else still runs `updateSession` so auth cookies stay fresh.
     */
    "/((?!_next/static|_next/image|favicon\\.ico$|(?:sitemap\\.xml|robots\\.txt|llms\\.txt|ads\\.txt)$|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
