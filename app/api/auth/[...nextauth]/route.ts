import { handlers } from "@/auth"; // Referring to the auth.ts we just created
import { validateHost } from "@/utils/helper";
import { checkBotId } from "botid/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const verification = await checkBotId();

    if (verification.isBot || !validateHost(req.headers.get("host"))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    return handlers.POST(req);
  } catch (error) {
    return NextResponse.error();
  }
}

export async function GET(req: NextRequest) {
  try {
    const verification = await checkBotId();

    if (verification.isBot || !validateHost(req.headers.get("host"))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    return handlers.GET(req);
  } catch (error) {
    return NextResponse.error();
  }
}
