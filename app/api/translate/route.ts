import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "@/libs/rate-limit";
import { translate } from "google-translate-api-x";
import { checkBotId } from "botid/server";
import { validateHost } from "@/utils/helper";

export async function POST(req: NextRequest) {
  try {
    const verification = await checkBotId();

    if (verification.isBot || !validateHost(req.headers.get("host"))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    const { text, targetLang, sourceLang = "auto" } = await req.json();

    if (!text || !targetLang) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    // Get client IP address
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      req?.["ip"] ||
      "unknown";

    // Clean IPv6 localhost
    const cleanIp = ipAddress === "::ffff:127.0.0.1" ? "127.0.0.1" : ipAddress;

    // Apply rate limiting (10 requests per IP per 5 minutes)
    const rateLimitKey = `translate:${cleanIp}`;
    const isRateLimited = rateLimiter.check(rateLimitKey, 10, 5 * 60 * 1000); // 5 minutes

    if (isRateLimited) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 },
      );
    }

    // Use google-translate-api-x
    const res: any = await translate(text, {
      to: targetLang,
    });

    const translatedText = Array.isArray(res)
      ? res.map((t: any) => t.text)
      : (res as any).text;

    const firstResult = Array.isArray(res) ? res[0] : res;
    const detectedSourceLanguage = firstResult?.from?.language?.iso;

    return NextResponse.json({
      translatedText,
      detectedSourceLanguage: detectedSourceLanguage || sourceLang,
    });
  } catch (error) {
    console.error("Translation API error:", error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
