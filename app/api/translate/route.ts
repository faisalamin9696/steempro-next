import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "@/libs/rate-limit";

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

    // Apply rate limiting (10 requests per IP per minute)
    const rateLimitKey = `translate:${cleanIp}`;
    const isRateLimited = rateLimiter.check(rateLimitKey, 10, 60 * 5000); // 5 minute

    if (isRateLimited) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    // Use Google Translate API (free tier via googleapis)
    // Note: You'll need to set GOOGLE_TRANSLATE_API_KEY in your .env.local
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Translation API key not configured" },
        { status: 500 }
      );
    }

    // Google Translate API
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        target: targetLang,
        ...(sourceLang !== "auto" && { source: sourceLang }),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google Translate API error:", errorData);
      throw new Error("Translation failed");
    }

    const data = await response.json();

    return NextResponse.json({
      translatedText: data.data.translations[0].translatedText,
      detectedSourceLanguage:
        data.data.translations[0].detectedSourceLanguage || sourceLang,
    });
  } catch (error) {
    console.error("Translation API error:", error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
