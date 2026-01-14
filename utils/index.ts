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
    /\b(nsfw|fuck|dick|anal|cock|penis|ass|porn|pornhub|xxx|hentai|hardcore|softcore|sexual|nude|bdsm|camgirl|sex|vagina|boobs|booty|pussy|tits|blowjob|masturbation|handjob|fingering|threesome|foursome|gangbang|intercourse|orgasm|cum|lick|booty|titties|tittie|horny|sexy|lust|nude|kink|milf)\b/i; // Add more NSFW words here
  const parsed = parsePostMeta(content.json_metadata);
  return nsfwRegex.test(
    content.title?.toLowerCase() + JSON.stringify(parsed.tags) + content.body
  );
}
