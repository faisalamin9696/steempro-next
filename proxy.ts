import { updateSession } from "@/libs/supabase/proxy";
import { NextResponse, type NextRequest } from "next/server";
export { auth as middleware } from "@/auth";

// Social media / SEO crawlers that must receive clean SSR HTML with OG metadata
const BOT_UA_REGEX =
  /bot|crawler|spider|crawling|facebookexternalhit|Twitterbot|WhatsApp|Slackbot|LinkedInBot|TelegramBot|Discordbot|ia_archiver|Googlebot|bingbot/i;

// Cache for normalized paths to avoid repeated processing
const pathCache = new Map<string, string>();
const CACHE_MAX_SIZE = 1000;

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const userAgent = request.headers.get("user-agent") ?? "";
  const pathname = nextUrl.pathname;

  // 1. Let bots through immediately — they need raw SSR HTML for OG metadata
  if (BOT_UA_REGEX.test(userAgent)) {
    return NextResponse.next();
  }

  // 2. Skip API routes and static assets to avoid unnecessary processing
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 3. Handle uppercase URLs with safety checks
  const lowercasePathname = pathname.toLowerCase();

  // Only proceed if there's actually a difference
  if (pathname !== lowercasePathname) {
    // Check if this is a redirect loop
    const referer = request.headers.get("referer") || "";
    const currentUrl = request.url;

    // If the referer is the same URL or we've already redirected, prevent loop
    if (
      referer &&
      new URL(referer).pathname.toLowerCase() === lowercasePathname
    ) {
      // Already redirected once, proceed with lowercase
      const newUrl = nextUrl.clone();
      newUrl.pathname = lowercasePathname;
      return NextResponse.redirect(newUrl, 301);
    }

    // Check cache for existing redirect
    const cacheKey = pathname;
    let cachedPath = pathCache.get(cacheKey);

    if (cachedPath && cachedPath === lowercasePathname) {
      // Use cached redirect
      const newUrl = nextUrl.clone();
      newUrl.pathname = lowercasePathname;
      return NextResponse.redirect(newUrl, 301);
    }

    // Perform the redirect
    const newUrl = nextUrl.clone();
    newUrl.pathname = lowercasePathname;

    // Cache the redirect
    if (pathCache.size < CACHE_MAX_SIZE) {
      pathCache.set(cacheKey, lowercasePathname);
    }

    // Use 301 for permanent redirect
    const response = NextResponse.redirect(newUrl, 301);

    // Prevent caching issues by adding a cache control header
    response.headers.set(
      "Cache-Control",
      "private, no-cache, no-store, must-revalidate",
    );

    return response;
  }

  // 4. Update session and continue
  try {
    const response = await updateSession(request);
    return response;
  } catch (error) {
    console.error("Session update failed:", error);
    // Continue even if session update fails
    return NextResponse.next();
  }
}

// Optional: Clean up cache periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    if (pathCache.size > CACHE_MAX_SIZE * 0.8) {
      // Clear old entries when cache gets too large
      const entries = Array.from(pathCache.entries());
      const toRemove = entries.slice(0, Math.floor(entries.length * 0.3));
      toRemove.forEach(([key]) => pathCache.delete(key));
    }
  }, 60000); // Clean every minute
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)",
  ],
};
