import { NextRequest, NextResponse } from "next/server";
import { Constants } from "@/constants";
import { steemApi } from "@/libs/steem";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { score, season } = body;

    if (!score || typeof score !== "number") {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 });
    }

    const gameKey = process.env.GAME_KEY;
    if (!gameKey) {
      console.error("GAME_KEY is not defined in environment variables");
      return NextResponse.json(
        { error: "Service configuration error" },
        { status: 500 },
      );
    }

    // Broadcast the score to the Steem blockchain using the funds account
    const result = await steemApi.recordGameScore(
      session.user.name,
      score,
      "steem-heights",
      season || 1,
      gameKey,
      false,
      Constants.funds_account,
    );

    return NextResponse.json({
      success: true,
      result,
      message: "Score recorded on blockchain successfully",
    });
  } catch (error: any) {
    console.error("Game score API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
