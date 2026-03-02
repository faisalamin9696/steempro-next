import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createClient } from "@/libs/supabase/server";
import { steemApi } from "@/libs/steem";
import { Constants } from "@/constants";
import { generateHMAC } from "@/utils/encryption";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const player = session.user.name;
    const { gameId, score, combos, season, signature } = await req.json();

    if (!gameId || score === undefined || !signature) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // 1. Retrieve session and challenge
    const { data: sessionData, error: sessionError } = await supabase
      .from("steempro_game_heights_sessions")
      .select("*")
      .eq("game_id", gameId)
      .eq("player", player)
      .eq("status", "pending")
      .single();

    if (sessionError || !sessionData) {
      return NextResponse.json(
        { error: "Invalid or expired game session" },
        { status: 403 },
      );
    }

    // 2. Verify HMAC
    // Message: player:gameId:challenge:score:combos
    const message = `${player}:${gameId}:${sessionData.challenge}:${score}:${combos || 0}`;
    const expectedSignature = generateHMAC(message, sessionData.challenge);

    if (signature !== expectedSignature) {
      console.warn(
        `Invalid signature for player ${player}. Expected: ${expectedSignature}, Received: ${signature}`,
      );
      return NextResponse.json(
        { error: "Invalid score signature" },
        { status: 403 },
      );
    }

    // 3. Mark session as completed
    const { error: updateError } = await supabase
      .from("steempro_game_heights_sessions")
      .update({ status: "completed" })
      .eq("game_id", gameId);

    if (updateError) {
      console.error("Failed to update session status:", updateError);
      // We continue anyway if the signature was valid, but maybe we should error?
      // Re-running this would fail because status is no longer pending though.
    }

    // 4. Broadcast score
    const gameKey = process.env.GAME_KEY;
    if (!gameKey) {
      console.error("GAME_KEY is not defined");
      return NextResponse.json(
        { error: "Service configuration error" },
        { status: 500 },
      );
    }

    const result = await steemApi.recordGameScore(
      player,
      score,
      combos,
      "steem-heights",
      season || 1,
      gameKey,
      false,
      Constants.funds_account,
    );

    return NextResponse.json({
      success: true,
      result,
      message: "Score verified and recorded successfully",
    });
  } catch (error: any) {
    console.error("Game submit API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
