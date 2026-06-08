import { updateSession } from "@/libs/supabase/proxy";
import { NextResponse, type NextRequest } from "next/server";
export { auth as middleware } from "@/auth";

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;

  // Check if there are uppercase characters in the pathname
  if (nextUrl.pathname !== nextUrl.pathname.toLowerCase()) {
    const lowercaseUrl = nextUrl.clone();
    lowercaseUrl.pathname = nextUrl.pathname.toLowerCase();

    // Redirect to the lowercase version while preserving query parameters
    return NextResponse.redirect(lowercaseUrl);
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
