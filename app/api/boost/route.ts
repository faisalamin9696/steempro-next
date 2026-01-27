import { auth } from "@/auth";
import { Constants } from "@/constants";
import { sdsApi } from "@/libs/sds";
import { getAppDetails } from "@/utils/app";
import { validateHost } from "@/utils/helper";
import { parsePostMeta } from "@/utils/user";
import { checkBotId } from "botid/server";
import { NextRequest, NextResponse } from "next/server";

async function getBoostStatus(
  author: string,
  permlink: string,
  username?: string,
) {
  // Fetch everything in parallel
  const [officialAccount, post, history, authorExt] = await Promise.all([
    sdsApi.getAccountExt(Constants.official_account),
    sdsApi.getPost(author, permlink, Constants.official_account),
    sdsApi.getAccountHistory(Constants.official_account, "vote", 500, 0, {
      amount: 24,
      unit: "hours",
    }),
    sdsApi.getAccountExt(author, Constants.official_account),
  ]);

  if (!post) return { error: "POST_NOT_FOUND", message: "Post not found" };

  const moderators: string[] = JSON.parse(process.env.MODERATORS || "[]");
  const isModerator = username ? moderators.includes(username) : false;

  // Criteria checks
  const reputation = Math.round(Number(post.author_reputation));
  const isReputationMet = reputation >= 40;

  let isPostedBySteemPro = false;
  try {
    const { app } = parsePostMeta(post.json_metadata);
    const { name } = getAppDetails(app);
    isPostedBySteemPro = name.toLowerCase() === "steempro";
  } catch (e) {}

  const isOfficialVpMet = officialAccount.upvote_mana_percent >= 80;

  const alreadyVotedByOfficial = history.some(
    (h) => h.op[0] === "vote" && h.op[1].author === author,
  );
  const alreadyVotedThisPost = post.observer_vote > 0;

  const isCooldownMet = isModerator || !alreadyVotedByOfficial;

  const isFollowed = authorExt.observer_follows_author;
  const isPermissionMet = isModerator || isFollowed;

  const results = {
    reputation: {
      label: "Reputation 40+",
      met: isReputationMet,
      value: reputation,
    },
    app: {
      label: "Using SteemPro",
      met: isPostedBySteemPro || isModerator,
      value: isModerator ? "Admin" : isPostedBySteemPro ? "Yes" : "No",
    },
    cooldown: {
      label: "Boost (24H)",
      met: isCooldownMet,
      value: isModerator
        ? "Admin"
        : alreadyVotedByOfficial
          ? "Already used"
          : "Available",
    },
    service: {
      label: "Service Status",
      met: isOfficialVpMet,
      value: isOfficialVpMet ? "Active" : "Cooldown",
    },
    voted: {
      label: "Already boosted",
      met: !alreadyVotedThisPost,
      value: alreadyVotedThisPost ? "Yes" : "No",
    },
  };

  const extraChecks = {
    isMuted: post.is_muted,
    isAuthorMuted: post.is_author_muted,
    payoutDeclined: post.max_accepted_payout === 0,
    votesNotAllowed: !post.allow_votes,
    curationDisabled: !post.allow_curation_rewards,
    ageSeconds: Math.floor(Date.now() / 1000) - post.created,
  };

  const isAgeMet =
    extraChecks.ageSeconds >= 5 * 60 &&
    extraChecks.ageSeconds <= 5 * 24 * 60 * 60;

  return {
    results,
    isFollowed,
    isModerator,
    canBoost:
      isReputationMet &&
      results.app.met &&
      isOfficialVpMet &&
      isCooldownMet &&
      !alreadyVotedThisPost &&
      isPermissionMet &&
      isAgeMet &&
      !extraChecks.isMuted &&
      !extraChecks.isAuthorMuted &&
      !extraChecks.payoutDeclined &&
      !extraChecks.votesNotAllowed &&
      !extraChecks.curationDisabled,
    extraChecks,
    officialVp: officialAccount.upvote_mana_percent,
    lastBoost: alreadyVotedByOfficial
      ? history.find(
          (h) =>
            h.op[0] === "vote" && h.op[1].voter === Constants.official_account,
        )?.time
      : null,
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const username = session?.user?.name;
    const { searchParams } = new URL(req.url);
    const author = searchParams.get("author");
    const permlink = searchParams.get("permlink");

    if (!author || !permlink) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 },
      );
    }

    const status = await getBoostStatus(
      author,
      permlink,
      username ?? undefined,
    );
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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

    const { author, permlink } = await req.json();

    if (!author || !permlink) {
      return NextResponse.json(
        { error: "Author and permlink are required" },
        { status: 400 },
      );
    }

    const status: any = await getBoostStatus(
      author,
      permlink,
      username ?? undefined,
    );

    if (status.error) {
      return NextResponse.json({ error: status.message }, { status: 404 });
    }

    if (!status.isModerator && author !== username) {
      return NextResponse.json(
        { error: "You can only boost your own posts" },
        { status: 403 },
      );
    }

    // Comprehensive validation using the status check results
    if (status.results.reputation.met === false) {
      return NextResponse.json(
        { error: "Reputation must be 40 or above" },
        { status: 400 },
      );
    }
    if (status.results.app.met === false) {
      return NextResponse.json(
        { error: "Must be posted using SteemPro" },
        { status: 400 },
      );
    }
    if (status.results.service.met === false) {
      return NextResponse.json(
        { error: "Service is on cooldown" },
        { status: 503 },
      );
    }
    if (status.results.cooldown.met === false) {
      return NextResponse.json(
        { error: "24-hour cooldown active" },
        { status: 429 },
      );
    }
    if (status.results.voted.met === false) {
      return NextResponse.json(
        { error: "Post already voted by observer" },
        { status: 400 },
      );
    }
    if (status.isFollowed === false && !status.isModerator) {
      return NextResponse.json(
        { error: "NOT_FOLLOWED", message: "Permission required" },
        { status: 403 },
      );
    }

    if (status.extraChecks.isMuted)
      return NextResponse.json({ error: "Post is muted" }, { status: 400 });
    if (status.extraChecks.payoutDeclined)
      return NextResponse.json({ error: "Payout declined" }, { status: 400 });
    if (status.extraChecks.ageSeconds < 300)
      return NextResponse.json({ error: "Post too young" }, { status: 400 });
    if (status.extraChecks.ageSeconds > 432000)
      return NextResponse.json({ error: "Post too old" }, { status: 400 });

    const webhookUrl = process.env.BOOST_BOT_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Service misconfigured" },
        { status: 500 },
      );
    }

    const postLink = `${Constants.site_url}/@${author}/${permlink}`;
    const discordPayload = {
      embeds: [
        {
          title: "🚀 Boost Request Received",
          color: 0x3b82f6,
          url: postLink,
          fields: [
            { name: "By", value: `@${username}`, inline: true },
            {
              name: "Reputation",
              value: `${status.results.reputation.value}`,
              inline: true,
            },
            {
              name: "\u200b",
              value: "\u200b",
              inline: true,
            },

            { name: "User", value: `@${author}`, inline: true },

            {
              name: "Post Link",
              value: `[View Post](${postLink})`,
              inline: true,
            },
            {
              name: "\u200b",
              value: "\u200b",
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: "SteemPro Boost System" },
        },
      ],
    };

    const discordResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(discordPayload),
    });

    if (!discordResponse.ok) {
      throw new Error("Failed to notify moderation team");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("API /api/boost error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
