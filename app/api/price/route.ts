import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
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
