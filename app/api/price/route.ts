import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { validateHost } from "@/utils/helper";
import { checkBotId } from "botid/server";

export async function POST(req: NextRequest) {
  try {
    const verification = await checkBotId();

    if (verification.isBot || !validateHost(req.headers.get("host"))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=steem,steem-dollars&vs_currencies=usd",
      {
        timeout: 10000,
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Price fetch error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch price data" },
      { status: 500 },
    );
  }
}
