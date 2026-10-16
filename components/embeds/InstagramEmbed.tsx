"use client";

import { useEmbedScript } from "./useEmbedScript";

/**
 * Instagram's official embed: a `blockquote.instagram-media` plus their
 * `embed.js`, which replaces it with the post once it loads.
 *
 * `embed.js` is injected on first use and then driven through
 * `instgrm.Embeds.process()` — it exposes exactly that, so the script is
 * never appended twice and other posts on the page aren't re-rendered.
 *
 * The plain anchor inside is both the no-JS fallback and the seed content
 * Instagram's script swaps out.
 */

type EmbedWindow = Window & {
  instgrm?: { Embeds?: { process?: () => void } };
};

/** Module scope so the reference stays stable across renders. */
function rescanInstagram(): boolean {
  const process = (window as EmbedWindow).instgrm?.Embeds?.process;
  if (!process) return false;
  process();
  return true;
}

function InstagramEmbed({
  url,
  linkText = url,
  width = 325,
}: {
  url: string;
  linkText?: string;
  width?: number;
}) {
  useEmbedScript(
    "instagram-embed-script",
    "https://www.instagram.com/embed.js",
    { rescan: rescanInstagram },
  );

  const permalink = url.endsWith("/") ? url : `${url}/`;

  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={`${permalink}?utm_source=ig_embed&utm_campaign=loading`}
      data-instgrm-version="14"
      data-width={width}
      style={{
        width: "100%",
        maxWidth: width,
        margin: "0 auto",
        display: "block",
        background: "#fff",
        border: 0,
        borderRadius: 3,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <a href={permalink} target="_blank" rel="noopener noreferrer">
        {linkText}
      </a>
    </blockquote>
  );
}

export default InstagramEmbed;
