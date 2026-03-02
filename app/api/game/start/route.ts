import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { createClient } from "@/libs/supabase/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const player = session.user.name;
    const gameId = crypto.randomUUID();
    const challenge = crypto.randomBytes(32).toString("hex");

    const supabase = await createClient();

    const { error } = await supabase
      .from("steempro_game_heights_sessions")
      .insert({
        player,
        game_id: gameId,
        challenge,
        status: "pending",
      });

    if (error) {
      console.error("Failed to create game session in Supabase:", error);
      return NextResponse.json(
        { error: "Failed to initialize game session" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      gameId,
      challenge,
    });
  } catch (error: any) {
    console.error("Game start API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
