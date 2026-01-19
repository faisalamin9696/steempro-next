import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "@/libs/rate-limit";
import { translate } from "google-translate-api-x";

export async function POST(request: NextRequest) {
  try {
    const { text, targetLang, sourceLang = "auto" } = await request.json();

    if (!text || !targetLang) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get client IP address
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      request?.["ip"] ||
      "unknown";

    // Clean IPv6 localhost
    const cleanIp = ipAddress === "::1" ? "127.0.0.1" : ipAddress;

    // Apply rate limiting (10 requests per IP per 5 minutes)
    const rateLimitKey = `translate:${cleanIp}`;
    const isRateLimited = rateLimiter.check(rateLimitKey, 10, 5 * 60 * 1000); // 5 minutes

    if (isRateLimited) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
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
