import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { author, permlink, note, reporter } = await req.json();
    const webhookUrl = process.env.SHORTS_BOT_URL;

    if (!webhookUrl) {
      console.error("SHORTS_BOT_URL is not defined in environment variables");
      return NextResponse.json(
        { error: "Internal Server Error: Webhook not configured" },
        { status: 500 },
      );
    }

    // Design a clean and actionable Discord Embed
    const embed = {
      title: "🚩 New Video Report (Steem Shorts)",
      url: `https://www.steempro.com/shorts/@${author}/${permlink}`,
      color: 0xe74c3c, // Vibrant Red
      fields: [
        {
          name: "👤 Reported Author",
          value: `[${author}](https://www.steempro.com/@${author})`,
          inline: true,
        },
        {
          name: "🕵️ Reporter",
          value: reporter ? `[${reporter}](https://www.steempro.com/@${reporter})` : "`Anonymous`",
          inline: true,
        },
        {
          name: "📁 Permlink",
          value: `\`${permlink}\``,
          inline: false,
        },
        {
          name: "📝 Reporter's Note",
          value: note ? `>>> ${note}` : "*No additional details provided.*",
          inline: false,
        },
      ],
      footer: {
        text: "SteemPro Shorts Moderation Utility",
        icon_url: "https://www.steempro.com/favicon-16x16.png",
      },
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "🚨 **URGENT: Content Moderation Alert**",
        embeds: [embed],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Discord Webhook Error:", errorText);
      throw new Error("Failed to relay report to Discord");
    }

    return NextResponse.json({
      success: true,
      message: "Report submitted successfully",
    });
  } catch (error: any) {
    console.error("Shorts Report API Error:", error.message);
    return NextResponse.json(
      { error: "Failed to submit report. Please try again later." },
      { status: 500 },
    );
  }
}
