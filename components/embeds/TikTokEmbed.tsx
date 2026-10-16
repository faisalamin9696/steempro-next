"use client";

import { useEmbedScript } from "./useEmbedScript";

/**
 * TikTok's official embed: a `blockquote.tiktok-embed` carrying the video
 * id, plus their `embed.js`, which replaces it with the player.
 *
 * Unlike Instagram, TikTok publishes no "process this" API — `embed.js`
 * only reads the `blockquote`s present when it executes. So the tag is
 * removed and re-appended with a cache-buster each time a new one mounts,
 * which is precisely what the package this replaces did.
 *
 * The plain anchor inside is both the no-JS fallback and the seed content
 * TikTok's script swaps out.
 */

function TikTokEmbed({
  url,
  linkText = url,
  width = 325,
}: {
  url: string;
  linkText?: string;
  width?: number;
}) {
  useEmbedScript("tiktok-embed-script", "https://www.tiktok.com/embed.js", {
    cacheBust: true,
  });

  // https://www.tiktok.com/@user/video/123456 → 123456
  const videoId = url.replace(/[?].*$/, "").replace(/^.+\//, "");

  return (
    <blockquote
      className="tiktok-embed"
      cite={url}
      data-video-id={videoId}
      style={{
        width: "100%",
        maxWidth: width,
        margin: "0 auto",
        display: "block",
        border: 0,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <a href={url} target="_blank" rel="noopener noreferrer">
        {linkText}
      </a>
    </blockquote>
  );
}

export default TikTokEmbed;
