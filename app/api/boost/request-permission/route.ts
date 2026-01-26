import { auth } from "@/auth";
import { Constants } from "@/constants";
import { validateHost } from "@/utils/helper";
import { checkBotId } from "botid/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const username = session?.user?.name;

    const verification = await checkBotId();

    if (verification.isBot || !validateHost(req.headers.get("host"))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has already requested permission in the last 24 hours
    const { createClient } = await import("@/libs/supabase/server");
    const supabase = await createClient();

    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data: existingRequest, error: queryError } = await supabase
      .from("steempro_boost_requests")
      .select("created_at")
      .eq("username", username)
      .gte("created_at", twentyFourHoursAgo)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (existingRequest && !queryError) {
      const nextRequestTime = new Date(
        new Date(existingRequest.created_at).getTime() + 24 * 60 * 60 * 1000,
      );
      const hoursRemaining = Math.ceil(
        (nextRequestTime.getTime() - Date.now()) / (1000 * 60 * 60),
      );

      return NextResponse.json(
        {
          error: "ALREADY_REQUESTED",
          message: `You can request permission again in ${hoursRemaining} hour${hoursRemaining !== 1 ? "s" : ""}`,
          nextRequestTime: nextRequestTime.toISOString(),
        },
        { status: 429 },
      );
    }

    // Send notification to Discord via Webhook
    const webhookUrl = process.env.BOOST_REQUEST_BOT_URL;
    if (!webhookUrl) {
      console.error(
        "BOOST_REQUEST_BOT_URL is not set in environment variables",
      );
      return NextResponse.json(
        { error: "Boost service is currently misconfigured" },
        { status: 500 },
      );
    }

    const profileLink = `${Constants.site_url}/@${username}`;

    const discordPayload = {
      embeds: [
        {
          title: "📋 Boost Permission Request",
          color: 0xfbbf24, // Yellow/Amber
          url: profileLink,
          fields: [
            {
              name: "User",
              value: `@${username}`,
              inline: true,
            },
            {
              name: "Profile",
              value: `[View Profile](${profileLink})`,
            },
            {
              name: "Request Type",
              value: "Requesting boost permission",
            },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: "SteemPro Boost System - Permission Request",
          },
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discordPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Discord Webhook Error Context:", errorText);
      throw new Error("Failed to send permission request to moderation team");
    }

    // Store the request in database
    const { error: insertError } = await supabase
      .from("steempro_boost_requests")
      .insert({
        username: username,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Failed to store permission request:", insertError);
      // Don't fail the request if database insert fails
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API /api/boost/request-permission error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
