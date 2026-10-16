"use client";

import Link from "@/components/ui/CustomLink";

/**
 * Bare `<iframe>` around the YouTube player — no third-party script at all.
 *
 * The package this replaces pulled in `react-youtube`, which drives the
 * YouTube IFrame API by injecting `www.youtube.com/iframe_api` and only
 * revealing the player after the `onReady` callback fired, leaving a
 * placeholder in the meantime. The API is unnecessary here: the embed URL
 * alone starts playback, so there is nothing to wait for and no flash.
 */

const VIDEO_ID_PATTERNS = [
  // /watch?v=ID
  /[?&]v=([A-Za-z0-9_-]{6,})/,
  // youtu.be/ID
  /youtu\.be\/([A-Za-z0-9_-]{6,})/,
  // /shorts/ID and /embed/ID
  /youtube\.com\/(?:shorts|embed)\/([A-Za-z0-9_-]{6,})/,
];

function videoIdFrom(url: string): string | null {
  for (const pattern of VIDEO_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function YouTubeEmbed({
  url,
  linkText = url,
  width = 325,
}: {
  url: string;
  linkText?: string;
  width?: number;
}) {
  const videoId = videoIdFrom(url);
  const start = url.match(/[?&]start=(\d+)/)?.[1];

  if (!videoId) return <Link href={url}>{linkText}</Link>;

  return (
    <iframe
      src={`https://www.youtube.com/embed/${videoId}${start ? `?start=${start}` : ""}`}
      title="YouTube video player"
      loading="lazy"
      style={{
        width: "100%",
        maxWidth: width,
        aspectRatio: "16 / 9",
        border: 0,
      }}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  );
}

export default YouTubeEmbed;
