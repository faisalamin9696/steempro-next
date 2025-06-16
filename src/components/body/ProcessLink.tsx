import { domToReact } from "html-react-parser";
import Link from "next/link";
import React from "react";
import { InstagramEmbed, TikTokEmbed, XEmbed } from "react-social-media-embed";
import { YouTubeEmbed } from "react-social-media-embed";
import { Tweet } from "react-tweet";
import { toast } from "sonner";
import { tweet_components } from "./tweet-components";

function extractTweetId(url) {
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
  //main: new RegExp(urlSet({ domain: '(?:(?:.*.)?youtube.com|youtu.be)' }), flags),
  // eslint-disable-next-line no-useless-escape
  main: /(?:https?:\/\/)(?:www\.)?(?:(?:youtube\.com\/watch\?v=)|(?:youtu.be\/)|(?:youtube\.com\/(embed|shorts)\/))([A-Za-z0-9_\-]+)[^ ]*/i,
  // eslint-disable-next-line no-useless-escape
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

function ProcessLink({ domNode }: { domNode: any }) {
  const url: string = domNode?.attribs?.href;

  if (url.match(twitterRegex.main)) {
    return (
      <Tweet
        fallback={
          <Link {...domNode?.attribs}>{domToReact(domNode.children)}</Link>
        }
        id={extractTweetId(url)}
        components={tweet_components}
      />
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

  return <Link {...domNode?.attribs}>{domToReact(domNode.children)}</Link>;
}

export default ProcessLink;
