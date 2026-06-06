import { updateSession } from "@/libs/supabase/proxy";
import { NextResponse, type NextRequest } from "next/server";
export { auth as middleware } from "@/auth";

export async function proxy(request: NextRequest) {
  // Get pathname and ensure it's decoded
  // Next.js should decode it automatically, but we handle %40 (@) encoding explicitly
  let { pathname } = request.nextUrl;

  // Decode URL-encoded @ symbols (%40) if present
  // This handles cases where @ might be encoded in the URL
  if (pathname.includes("%40")) {
    try {
      pathname = decodeURIComponent(pathname);
    } catch {
      // If decoding fails, use original pathname
    }
  }

  const isApiOrAuth =
    pathname.startsWith("/api") || pathname.startsWith("/auth");

  if (!isApiOrAuth) {
    let targetPathname = pathname.toLowerCase();

    // Normalize trailing slash (strip trailing slash if length > 1)
    if (targetPathname.length > 1 && targetPathname.endsWith("/")) {
      targetPathname = targetPathname.slice(0, -1);
    }

    if (targetPathname !== pathname) {
      const url = request.nextUrl.clone();
      url.pathname = targetPathname;
      return NextResponse.redirect(url, 308);
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
