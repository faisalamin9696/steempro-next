/**
 * This function is extracted from steemit.com source code and does the same tasks with some slight-
 * adjustments to meet our needs. Refer to the main one in case of future problems:
 * https://github.com/steemit/steemit.com/blob/4d4fe1f7da37d3dbb35bd0a131d9e5b44bad316d/app/utils/Links.js
 */

const urlChar = '[^\\s"<>\\]\\[\\(\\)]';
const urlCharEnd = urlChar.replace(/\]$/, ".,']"); // insert bad chars to end on
const imagePath =
  "(?:(?:\\.(?:tiff?|jpe?g|gif|png|svg|ico)|ipfs/[a-z\\d]{40,}))";
const domainPath = "(?:[-a-zA-Z0-9\\._]*[-a-zA-Z0-9])";
const urlChars = `(?:${urlChar}*${urlCharEnd})?`;
const urlSet = ({ domain = domainPath, path = "" } = {}) => {
  // urlChars is everything but html or markdown stop chars
  return `https?:\/\/${domain}(?::\\d{2,5})?(?:[/\\?#]${urlChars}${
    path ? path : ""
  })${path ? "" : "?"}`;
};

/**
    Unless your using a 'g' (glob) flag you can store and re-use your regular expression.  Use the cache below.  If your using a glob (for example: replace all), the regex object becomes stateful and continues where it left off when called with the same string so naturally the regexp object can't be cached for long.
*/
export const any = (flags = "i") => new RegExp(urlSet(), flags);
export const local = (flags = "i") =>
  new RegExp(urlSet({ domain: "(?:localhost|(?:.*\\.)?steempro.com)" }), flags);
export const remote = (flags = "i") =>
  new RegExp(
    urlSet({ domain: `(?!localhost|(?:.*\\.)?steempro.com)${domainPath}` }),
    flags
  );
export const youTube = (flags = "i") =>
  new RegExp(urlSet({ domain: "(?:(?:.*.)?youtube.com|youtu.be)" }), flags);
export const image = (flags = "i") =>
  new RegExp(urlSet({ path: imagePath }), flags);
export const imageFile = (flags = "i") => new RegExp(imagePath, flags);
// export const nonImage = (flags = 'i') => new RegExp(urlSet({path: '!' + imageFile}), flags)
// export const markDownImageRegExp = (flags = 'i') => new RegExp('\!\[[\w\s]*\]\(([^\)]+)\)', flags);

export default {
  any: any(),
  local: local(),
  remote: remote(),
  image: image(),
  imageFile: imageFile(),
  youTube: youTube(),
  youTubeId:
    /(?:(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/))|(?:youtu\.be\/))([A-Za-z0-9_-]+)/i,
  vimeo:
    /https?:\/\/(?:vimeo.com\/|player.vimeo.com\/video\/)([0-9]+)\/?(#t=((\d+)s?))?\/?/,
  vimeoId: /(?:vimeo.com\/|player.vimeo.com\/video\/)([0-9]+)/,
  // simpleLink: new RegExp(`<a href="(.*)">(.*)<\/a>`, 'ig'),
  ipfsPrefix: /(https?:\/\/.*)?\/ipfs/i,
  twitch:
    /https?:\/\/(?:www.)?twitch.tv\/(?:(videos)\/)?([a-zA-Z0-9][\w]{3,24})/i,
  dtube: /https:\/\/(?:emb\.)?(?:d.tube\/\#\!\/(?:v\/)?)([a-zA-Z0-9\-\.\/]*)/,
  dtubeId: /(?:d\.tube\/#!\/(?:v\/)?([a-zA-Z0-9\-\.\/]*))+/,
  threespeak:
    /(?:https?:\/\/(?:(?:3speak.online\/watch\?v=)|(?:3speak.online\/embed\?v=)))([A-Za-z0-9\_\-\/]+)(&.*)?/i,
  threespeakImageLink:
    /<a href="(https?:\/\/3speak.online\/watch\?v=([A-Za-z0-9\_\-\/]+))".*<img.*?><\/a>/i,
};

// Original regex
// const urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';

// About performance
// Using exec on the same regex object requires a new regex to be created and compile for each text (ex: post).  Instead replace can be used `body.replace(remoteRe, l => {` discarding the result for better performance`}).  Re-compiling is a chrome bottleneck but did not effect nodejs.

export const WHITE_LIST = [
  "busy.org",
  "esteem.app",
  "steempeak.com",
  "partiko.app",
  "chainbb.com",
  "utopian.io",
  "steemkr.com",
  "strimi.pl",
  "steemhunt.com",
  "ulogs.org",
  "hede.io",
  "naturalmedicine.io",
  "steempro.com",
  "steemit.com",
];

export const OLD_DOMAINS = [
  "busy.org",
  "esteem.app",
  "steempeak.com",
  "partiko.app",
  "chainbb.com",
  "utopian.io",
  "steemkr.com",
  "strimi.pl",
  "steemhunt.com",
  "ulogs.org",
  "hede.io",
  "naturalmedicine.io",
  "steemit.com",
];

export const SECTION_LIST = [
  "blog",
  "friends",
  "posts",
  "comments",
  "replies",
  "wallet",
  "communities",
  "settings",
];

export function replaceOldDomains(link?: string) {
  if (!link) return "/";
  const regex = new RegExp(OLD_DOMAINS.join("|"), "g");
  return `${link
    .replace(regex, "steempro.com")
    .replace("~witnesses", "witnesses")}`;
}
