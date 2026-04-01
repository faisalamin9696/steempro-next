import { NextRequest, NextResponse } from "next/server";
import { pinata } from "@/libs/pinata";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cid = searchParams.get("cid");

  if (!cid) {
    return NextResponse.json({ error: "CID is required" }, { status: 400 });
  }

  try {
    const analytics = await pinata.analytics.requests
      .days(7) // Look back 30 days
      .cid(cid) // Filter by your CID
      .limit(1); // Return top result

    const views = analytics.data[0]?.requests || 0;
    return NextResponse.json({ views });
  } catch (error) {
    console.error("Pinata Analytics Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
