// pages/api/track-view.ts
import { rateLimiter } from "@/libs/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { checkBotId } from "botid/server";
import { validateHost } from "@/utils/helper";

export async function POST(req: NextRequest) {
  try {
    const verification = await checkBotId();

    if (verification.isBot|| !validateHost(req.headers.get("host"))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    const { author, permlink } = await req.json();

    if (!author || !permlink) {
      return NextResponse.json(
        { error: "Author and permlink are required" },
        { status: 400 },
      );
    }

    const authPerm = `${author}/${permlink}`;

    // Get client IP (App Router style)
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      req?.["ip"] || // ← Best fallback for App Router
      "unknown";

    // Optional: Clean IPv6 localhost
    const cleanIp = ipAddress === "::1" ? "127.0.0.1" : ipAddress;

    // Rate limiting and database logic here...
    // Apply rate limiting (1 view per IP per hour for same post)
    const rateLimitKey = `view:${authPerm}:${cleanIp}`;
    const isRateLimited = rateLimiter.check(rateLimitKey, 1, 60 * 60 * 1000); // 1 hour

    if (isRateLimited) {
      return NextResponse.json(
        { message: "Rate limited - please wait before viewing again" },
        { status: 429, statusText: "Rate limited" },
      );
    }

    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    let uid = data?.user?.id;
    // Insert/update view record
    const { error: insertError } = await supabase.from("steempro_views").upsert(
      {
        auth_perm: authPerm,
        uid: uid,
        ip_address: cleanIp,
        user_agent: req.headers["user-agent"] || null,
        referrer: req.headers["referer"] || null,
        time: new Date().toISOString(),
      },
      {
        onConflict: "auth_perm,uid", // Specify the unique constraint columns
        ignoreDuplicates: true,
      },
    );

    if (insertError) {
      console.error("Insert view failed:", insertError);
      return NextResponse.json(
        { message: insertError.message },
        { status: 500, statusText: "Internal Server Error" },
      );
    }

    console.log("View tracked:", { authPerm, cleanIp });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
