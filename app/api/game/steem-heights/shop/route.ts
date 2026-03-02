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
    const {
      energy,
      skins,
      powerup,
      action,
      season,
      player,
      gameId,
      signature,
    } = body;

    // Safety check: ensure the session user matches the requested player
    if (session.user.name !== player) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!gameId || !signature) {
      return NextResponse.json(
        { error: "Secure session required for shop actions" },
        { status: 400 },
      );
    }

    const { createClient } = await import("@/libs/supabase/server");
    const supabaseServer = await createClient();

    // 1. Verify Session
    const { data: sessionData, error: sessionError } = await supabaseServer
      .from("steempro_game_heights_sessions")
      .select("*")
      .eq("game_id", gameId)
      .eq("player", player)
      .eq("status", "pending")
      .single();

    if (sessionError || !sessionData) {
      return NextResponse.json(
        { error: "Invalid or expired shop session" },
        { status: 403 },
      );
    }

    // 2. Verify HMAC
    // Message: player:gameId:challenge:energy:action
    const { generateHMAC } = await import("@/utils/encryption");
    const message = `${player}:${gameId}:${sessionData.challenge}:${energy || 0}:${action || ""}`;
    const expectedSignature = generateHMAC(message, sessionData.challenge);

    if (signature !== expectedSignature) {
      console.warn(`Invalid shop signature for player ${player}.`);
      return NextResponse.json(
        { error: "Invalid secure signature" },
        { status: 403 },
      );
    }

    // 3. Mark session as completed
    await supabaseServer
      .from("steempro_game_heights_sessions")
      .update({ status: "completed" })
      .eq("game_id", gameId);

    // 4. Prevent duplicate claims
    const { checkActionDuplicate } =
      await import("@/libs/supabase/steem-heights");

    if (action?.startsWith("Claimed challenge:")) {
      const isDuplicate = await checkActionDuplicate(
        player,
        action,
        season || 1,
        supabaseServer,
      );

      if (isDuplicate) {
        return NextResponse.json(
          { error: "Reward already claimed in another session" },
          { status: 400 },
        );
      }
    }

    const gameKey = process.env.GAME_KEY;
    if (!gameKey) {
      console.error("GAME_KEY is not defined");
      return NextResponse.json(
        { error: "Configuration error" },
        { status: 500 },
      );
    }

    // 2. Broadcast the validated data from client to the Steem blockchain
    const result = await steemApi.recordGameShopUpdate(
      player,
      "steem-heights",
      season || 1,
      energy || 0,
      skins || [],
      powerup || { name: "", updated_at: null },
      action,
      gameKey,
      false,
      Constants.funds_account,
    );

    const tid = result?.id || "";

    // 3. Update Supabase with tid for record keeping
    await supabaseServer.from("steempro_game_heights_shop").insert({
      player,
      game: "steem-heights",
      season: season || 1,
      energy: energy || 0,
      skins: Array.isArray(skins) ? JSON.stringify(skins) : skins,
      powerup: typeof powerup === "object" ? JSON.stringify(powerup) : powerup,
      equiped: body.equiped || "default", // body.equiped from useHeightsShop
      action,
      tid,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      result,
      message: "Shop update broadcasted to blockchain and recorded",
    });
  } catch (error: any) {
    console.error("Game shop API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
