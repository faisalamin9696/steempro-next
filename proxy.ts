import { updateSession } from "@/libs/supabase/proxy";
import { NextResponse, type NextRequest } from "next/server";
import { clientIp, junkReason, routeKey } from "@/libs/analytics/request";
import {
  STATUS_BLOCKED,
  STATUS_DEFLECTED,
  STATUS_PASSED,
  isBlocked,
  recordDeflection,
  recordHit,
} from "@/libs/analytics/store";

/**
 * One entry point for every dynamic request.
 *
 * Order matters: a blocked address and a shape that can never be valid are both
 * answered here, before the app renders anything and — for `/@bad_name` — before
 * a single SDS call is made. Everything else is recorded and handed on.
 *
 * The counters live in `libs/analytics/store.ts` and are aggregated in memory,
 * so this adds a map update to each request rather than a database round trip.
 */

const NOINDEX = { "x-robots-tag": "noindex" } as const;

function note(
  request: NextRequest,
  ip: string,
  status: number,
  route = routeKey(request.nextUrl.pathname),
): void {
  recordHit({
    minute: Math.floor(Date.now() / 60_000) * 60,
    ip,
    method: request.method.slice(0, 10),
    route,
    status,
    ua: (request.headers.get("user-agent") ?? "").slice(0, 120),
  });
}

export async function proxy(request: NextRequest) {
  const ip = clientIp(request.headers);
  const { pathname } = request.nextUrl;

  if (isBlocked(ip)) {
    note(request, ip, STATUS_BLOCKED);
    return new NextResponse("Forbidden\n", {
      status: 403,
      headers: { "content-type": "text/plain; charset=utf-8", ...NOINDEX },
    });
  }

  const junk = junkReason(pathname);
  if (junk) {
    note(request, ip, STATUS_DEFLECTED);
    recordDeflection(pathname.slice(0, 160), junk);
    return new NextResponse("Not Found\n", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8", ...NOINDEX },
    });
  }

  note(request, ip, STATUS_PASSED);

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
