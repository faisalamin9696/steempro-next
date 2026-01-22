import { NextRequest, NextResponse } from "next/server";
import { encryptPrivateKey } from "@/utils/encryption";
import { checkBotId } from "botid/server";
import moment from "moment";
import { validateHost } from "@/utils/helper";

export async function POST(req: NextRequest) {
  try {
    const verification = await checkBotId();

    if (verification.isBot || !validateHost(req.headers.get("host"))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const secret = encryptPrivateKey(
      moment().unix()?.toString(),
      process.env.MESSAGE_SECRET!,
    );

    if (secret) return NextResponse.json({ secret });
    else return NextResponse.error();
  } catch (error) {
    return NextResponse.error();
  }
}
