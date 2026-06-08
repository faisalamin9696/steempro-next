import { updateSession } from "@/libs/supabase/proxy";
import { NextResponse, type NextRequest } from "next/server";
export { auth as middleware } from "@/auth";

// Social media / SEO crawlers that must receive clean SSR HTML with OG metadata
const BOT_UA_REGEX =
  /bot|crawler|spider|crawling|facebookexternalhit|Twitterbot|WhatsApp|Slackbot|LinkedInBot|TelegramBot|Discordbot|ia_archiver|Googlebot|bingbot/i;

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;

  const userAgent = request.headers.get("user-agent") ?? "";

  // Let bots through immediately — they need raw SSR HTML for OG / link preview metadata
  if (BOT_UA_REGEX.test(userAgent)) {
    return NextResponse.next();
  }

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
