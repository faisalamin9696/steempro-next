import { domToReact, DOMNode, HTMLReactParserOptions } from "html-react-parser";
import Link from "@/components/ui/CustomLink";
import InstagramEmbed from "@/components/embeds/InstagramEmbed";
import TikTokEmbed from "@/components/embeds/TikTokEmbed";
import YouTubeEmbed from "@/components/embeds/YouTubeEmbed";
import { Tweet } from "react-tweet";
import { tweet_components } from "./elements/tweet-components";

function extractTweetId(url: string) {
  const match = url.match(/(?:twitter|x)\.com\/.*\/status\/(\d+)/);
  return match ? match[1] : null;
}

const twitterRegex = {
  main: /(?:https?:\/\/(?:(?:(?:twitter|x)\.com\/(.*?)\/status\/(.*))))/i,
  sanitize: /(?:https?:\/\/(?:(?:(?:twitter|x)\.com\/(.*?)\/status\/(.*))))/i,
  htmlReplacement:
    /<blockquote[^>]*?><p[^>]*?>(.*?)<\/p>.*?mdash; (.*)<a href="(https:\/\/(?:twitter|x)\.com\/.*?(.*?\/status\/(.*?))\?.*?)">(.*?)<\/a><\/blockquote>/i,
};

export const youtubeRegex = {
  sanitize: /^(https?:)?\/\/www\.youtube\.com\/(embed|shorts)\/.*/i,
  main: /(?:https?:\/\/)(?:www\.)?(?:(?:youtube\.com\/watch\?v=)|(?:youtu.be\/)|(?:youtube\.com\/(embed|shorts)\/))([A-Za-z0-9_\-]+)[^ ]*/i,
  contentId:
    /(?:(?:youtube\.com\/watch\?v=)|(?:youtu.be\/)|(?:youtube\.com\/(embed|shorts)\/))([A-Za-z0-9_\-]+)/i,
};

const instagramRegex = {
  main: /^https:\/\/www\.instagram\.com\/p\/(.*?)\/?$/i,
  htmlReplacement:
    /<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="https:\/\/www\.instagram\.com\/reel\/(.*?)\/.*?<\/script>/i,
};

const tiktokRegex = {
  main: /^https:\/\/www.tiktok.com\/@([A-Za-z0-9_\-/.]+)\/video\/([^?]+)(.*)$/i,
  htmlReplacement:
    /<blockquote class="tiktok-embed" cite="https:\/\/www.tiktok.com\/@([A-Za-z0-9_\-/.]+)\/video\/([0-9]*?)".*<\/script>/i,
};

/**
 * Whether `ProcessedLink` replaces this URL with block-level markup — an
 * `<iframe>`, a `<blockquote>`, a wrapper `<div>` or a tweet card.
 *
 * The anchor itself is inline, so a parser looking only at tag names can't
 * tell that a `<p>` wrapping one of these produces invalid nesting.
 */
export function isEmbedUrl(url?: string): boolean {
  if (!url) return false;
  return (
    twitterRegex.main.test(url) ||
    youtubeRegex.main.test(url) ||
    instagramRegex.main.test(url) ||
    tiktokRegex.main.test(url)
  );
}

import { TweetErrorBoundary } from "./TweetErrorBoundary";

/**
 * html-react-parser returns raw HTML attribute names, but React only
 * understands the JSX ones. Spreading `attribs` straight onto an element
 * leaks `class` through as an invalid DOM property.
 */
function toReactProps(
  attribs?: Record<string, string>,
): Record<string, string> {
  const props: Record<string, string> = {};
  for (const [key, value] of Object.entries(attribs ?? {})) {
    props[key === "class" ? "className" : key === "for" ? "htmlFor" : key] =
      value;
  }
  return props;
}

function ProcessedLink({
  domNode,
  options,
}: {
  domNode: any;
  options?: HTMLReactParserOptions;
}) {
  const url: string = domNode?.attribs?.href;

  if (url.match(twitterRegex.main)) {
    const fallbackLink = (
      <Link href={url} {...toReactProps(domNode?.attribs)}>{domToReact(domNode.children, options)}</Link>
    );

    return (
      <TweetErrorBoundary fallback={fallbackLink}>
        <Tweet
          fallback={fallbackLink}
          id={extractTweetId(url) ?? ""}
          components={tweet_components}
        />
      </TweetErrorBoundary>
    );
  }

  if (url.match(youtubeRegex.main)) {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <YouTubeEmbed url={url} linkText={url} width={325} />
      </div>
    );
  }

  if (url.match(instagramRegex.main)) {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <InstagramEmbed url={url} linkText={url} width={325} />
      </div>
    );
  }

  if (url.match(tiktokRegex.main)) {
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <TikTokEmbed url={url} linkText={url} width={325} />
      </div>
    );
  }

  return (
    <Link href={url} {...toReactProps(domNode?.attribs)}>{domToReact(domNode.children, options)}</Link>
  );
}

export default ProcessedLink;
