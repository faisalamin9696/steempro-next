import { Constants } from "@/constants";
import { parsePostMeta } from "./user";

export function updateActiveSettings(setting: Setting) {
  Constants.activeSettings = setting;
}

export function capitalize(str: string): string {
  if (str.length === 0) return str;
  if (str.length === 1) return str.toUpperCase();
  return str[0].toUpperCase() + str.slice(1).toLowerCase();
}

export function hasNsfwTag(content: Feed | Post) {
  const nsfwRegex =
    /\b(nsfw|fuck|dick|anal|cock|penis|ass|porn|pornhub|xxx|hentai|hardcore|softcore|sexual|nude|camgirl|sex|vagina|boobs|booty|pussy|tits|blowjob|handjob|threesome|foursome|gangbang|orgasm|horny|sexy|nude)\b/i; // Add more NSFW words here
  const parsed = parsePostMeta(content.json_metadata);
  return nsfwRegex.test(
    content.title?.toLowerCase() + JSON.stringify(parsed.tags) + content.body,
  );
}

export function isSteemProShort(content: Feed | Post) {
  try {
    const meta = JSON.parse(content.json_metadata || "{}");
    const tags = meta.tags || [];
    const hasShortsTag = Array.isArray(tags)
      ? tags.includes("shorts")
      : tags === "shorts";
    const hasVideo = !!meta.video;
    const isCorrectParent =
      content.category === "shorts" ||
      content.category === Constants.official_community;
    return hasShortsTag && hasVideo && isCorrectParent;
  } catch {
    return false;
  }
}
