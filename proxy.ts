import { updateSession } from "@/libs/supabase/proxy";
import { NextResponse, type NextRequest } from "next/server";
export { auth as middleware } from "@/auth";

// Legitimate search engine crawlers & social media embed bots
const ALLOWED_BOTS_REGEX =
  /googlebot|bingbot|duckduckbot|yandex|baiduspider|applebot|facebookexternalhit|twitterbot|whatsapp|slackbot|linkedinbot|telegrambot|discordbot|pinterestbot|ia_archiver/i;

// Unnecessary AI training crawlers and aggressive SEO audit scrapers
const BLOCKED_BOTS_REGEX =
  /gptbot|chatgpt-user|claudebot|claude-web|anthropic-ai|perplexitybot|bytespider|ccbot|diffbot|cohere-ai|omgilibot|youbot|ahrefsbot|semrushbot|mj12bot|dotbot|dataforseobot|blexbot|petalbot/i;

export async function proxy(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "";

  // Block explicit bad bots (AI scrapers & aggressive SEO crawlers)
  if (userAgent && BLOCKED_BOTS_REGEX.test(userAgent)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Let legitimate bots through immediately — they need raw SSR HTML for OG / link preview metadata
  if (userAgent && ALLOWED_BOTS_REGEX.test(userAgent)) {
    return NextResponse.next();
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
     * - static media files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
