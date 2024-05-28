import xmldom from "xmldom";
import { proxifyImageUrl } from "../../libs/utils/ProxifyUrl";
import { validate_account_name } from "@/libs/utils/ChainValidation";
import linksRe, {
  any as linksAny,
  SECTION_LIST,
  WHITE_LIST,
} from "@/libs/utils/Links";
import * as Phishing from "@/libs/utils/Phishing";
import {
    INTERNAL_MENTION_REGEX,
  INTERNAL_POST_REGEX,
  INTERNAL_POST_TAG_REGEX,
  MENTION_REGEX,
  POST_REGEX,
} from "./regexes.const";

export const getPhishingWarningMessage = () =>
  "Alert: recognized as phishnig link";
export const getExternalLinkWarningMessage = () => "Open external link";

const noop = () => {};
const DOMParser = new xmldom.DOMParser({
  errorHandler: { warning: noop, error: noop },
});
const XMLSerializer = new xmldom.XMLSerializer();

export default function (
  html,
  { mutate = true, hideImages = false, isProxifyImages = false } = {}
) {
  const state: any = { mutate };
  state.hashtags = new Set();
  state.usertags = new Set();
  state.htmltags = new Set();
  state.images = new Set();
  state.links = new Set();
  try {
    const doc = DOMParser.parseFromString(preprocessHtml(html), "text/html");

    traverse(doc, state);

    if (mutate) {
      if (hideImages) {
        for (const image of Array.from(
          doc.getElementsByTagName("img")
        ) as any) {
          const pre = doc.createElement("pre");
          pre.setAttribute("class", "image-url-only");
          pre.appendChild(doc.createTextNode(image.getAttribute("src")));
          image.parentNode.replaceChild(pre, image);
        }
      } else {
        if (!isProxifyImages) proxifyImages(doc);
      }
    }

    // console.log('state', state)
    if (!mutate) return state;
    return {
      html: doc ? XMLSerializer.serializeToString(doc) : "",
      ...state,
    };
  } catch (error: any) {
    // xmldom error is bad
    console.log(
      "rendering error",
      JSON.stringify({ error: error?.message, html })
    );
    return { html: "Error " + error?.message };
  }
}

function preprocessHtml(html) {
  // Replacing 3Speak Image/Anchor tag with an embedded player
  html = embedThreeSpeakNode(html);

  return html;
}

function traverse(node, state, depth = 0) {
  if (!node || !node.childNodes) return;

  Array.from(node.childNodes).forEach((child: any) => {
    const tag = child.tagName ? child.tagName.toLowerCase() : null;
    if (tag) state.htmltags.add(tag);

    switch (tag) {
      case "img":
        img(state, child);
        break;
      case "iframe":
        iframe(state, child);
        break;
      case "a":
        link(state, child);
        break;
      default:
        if (child.nodeName === "#text") {
          linkifyNode(child, state);
        }
        break;
    }

    traverse(child, state, depth + 1);
  });
}

function link(state, child) {
  const url = child.getAttribute("href");
  if (url) {
    state.links.add(url);
    if (state.mutate) {
      // If this link is not relative, http, https, steem or esteem -- add https.
      if (!/^((#)|(\/(?!\/))|(((steem|esteem|https?):)?\/\/))/.test(url)) {
        child.setAttribute("href", "https://" + url);
      }

      // Unlink potential phishing attempts
      if (
        (url.indexOf("#") !== 0 && // Allow in-page links
          child.textContent.match(/(www\.)?steemit\.com/i) &&
          !url.match(/https?:\/\/(.*@)?(www\.)?steemit\.com/i)) ||
        Phishing.looksPhishy(url)
      ) {
        const phishyDiv = child.ownerDocument.createElement("div");
        phishyDiv.textContent = `${child.textContent} / ${url}`;
        phishyDiv.setAttribute("title", getPhishingWarningMessage());
        phishyDiv.setAttribute("class", "phishy");
        child.parentNode.replaceChild(phishyDiv, child);
      }
    }
  }
}

// wrap iframes in div.videoWrapper to control size/aspect ratio
// wrap iframes in div.videoWrapper to control size/aspect ratio
function iframe(state, child) {
  const url = child.getAttribute("src");
  if (url) {
    const { images, links } = state;
    const yt = youTubeId(url);
    if (yt && images && links) {
      links.add(yt.url);
      images.add("https://img.youtube.com/vi/" + yt.id + "/0.jpg");
    }
  }

  const { mutate } = state;
  if (!mutate) return;

  const tag = child.parentNode.tagName
    ? child.parentNode.tagName.toLowerCase()
    : child.parentNode.tagName;
  if (
    tag === "div" &&
    child.parentNode.getAttribute("class") === "videoWrapper"
  )
    return;
  const html = XMLSerializer.serializeToString(child);
  child.parentNode.replaceChild(
    DOMParser.parseFromString(`<div class="videoWrapper">${html}</div>`),
    child
  );
}

function img(state, child) {
  const url = child.getAttribute("src");
  if (url) {
    state.images.add(url);
    if (state.mutate) {
      let url2 = ipfsPrefix(url);
      if (/^\/\//.test(url2)) {
        // Change relative protocol imgs to https
        url2 = "https:" + url2;
      }
      if (url2 !== url) {
        child.setAttribute("src", url2);
      }
    }
  }
}

// Assuming doc is a reference to the document object

function proxifyImages(doc) {
  if (!doc || typeof doc.getElementsByTagName !== "function") {
    console.error("Invalid document object");
    return;
  }

  const imageNodes = doc.getElementsByTagName("img");

  Array.from(imageNodes).forEach((node: any) => {
    const url = node.getAttribute("src");

    if (url && !linksRe.local.test(url)) {
      const proxifiedUrl = proxifyImageUrl(url, true);
      node.setAttribute("src", proxifiedUrl);
    }
  });
}

function linkifyNode(child: any, state: any) {
  try {
    const tag = child.parentNode.tagName
      ? child.parentNode.tagName.toLowerCase()
      : child.parentNode.tagName;
    if (tag === "code") return;
    if (tag === "a") return;

    const { mutate } = state;
    if (!child.data) return;
    child = embedYouTubeNode(child, state.links, state.images);
    child = embedVimeoNode(child, state.links);
    child = embedTwitchNode(child, state.images);
    child = embedDTubeNode(child, state.images);
    child = embedThreeSpeakNode(child, state.links, state.images);

    const data = XMLSerializer.serializeToString(child);

    const content = linkify(
      data,
      state.mutate,
      state.hashtags,
      state.usertags,
      state.images,
      state.links
    );

    if (mutate && content !== data) {
      const href = child.nodeValue.trim();
      const postMatch = href.match(POST_REGEX);
      if (postMatch && WHITE_LIST.includes(postMatch[1].replace(/www./, ""))) {
        const tag = postMatch[2];
        const author = postMatch[3].replace("@", "");
        const permlink = postMatch[4];
        const replaceNode = DOMParser.parseFromString(
          `<a href="/${tag}/@${author}/${permlink}">@${author}/${permlink}</a>`
        );
        child.parentNode.replaceChild(replaceNode, child);
        return replaceNode;
      }

      // If profile mention url
      const mentionMatch = href.match(MENTION_REGEX);
      if (
        mentionMatch &&
        WHITE_LIST.includes(mentionMatch[1].replace(/www./, "")) &&
        mentionMatch.length === 3
      ) {
        const author = mentionMatch[2].replace("@", "").toLowerCase();
        if (author.indexOf("/") === -1) {
          const replaceNode = DOMParser.parseFromString(
            `<a href="/@${author}">@${author}</a>`
          );
          child.parentNode.replaceChild(replaceNode, child);
          return replaceNode;
        }
      }

      // If profile with the section link
      const tpostMatch = href.match(INTERNAL_POST_TAG_REGEX);

      if (
        (tpostMatch &&
          tpostMatch.length === 4 &&
          WHITE_LIST.some((v) => tpostMatch[1].includes(v))) ||
        (tpostMatch &&
          tpostMatch.length === 4 &&
          tpostMatch[1].indexOf("/") == 0)
      ) {
        if (SECTION_LIST.some((v) => tpostMatch[3].includes(v))) {
          const author = tpostMatch[2].replace("@", "").toLowerCase();
          const section = tpostMatch[3];
          const href = `/@${author}/${section}`;
          const replaceNode = DOMParser.parseFromString(
            `<a href="${href}">@${author}/${section}</a>`
          );
          child.parentNode.replaceChild(replaceNode, child);
          return replaceNode;
        }
      }

      const newChild = DOMParser.parseFromString(`${content}`);
      child.parentNode.replaceChild(newChild, child);
      return newChild;
    }
  } catch (error) {
    console.error("linkify_error", error);
  }
}
function linkify(content, mutate, hashtags, usertags, images, links) {
  // hashtag
  content = content.replace(/(^|\s)(#[-a-z\d]+)/gi, (tag) => {
    if (/#[\d]+$/.test(tag)) return tag; // Don't allow numbers to be tags
    const space = /^\s/.test(tag) ? tag[0] : "";
    const tag2 = tag.trim().substring(1);
    const tagLower = tag2.toLowerCase();
    if (hashtags) hashtags.add(tagLower);
    if (!mutate) return tag;
    return space + `<a href="/trending/${tagLower}">${tag}</a>`;
  });

  // usertag (mention)
  // Cribbed from https://github.com/twitter/twitter-text/blob/v1.14.7/js/twitter-text.js#L90
  content = content.replace(
    /(^|[^a-zA-Z0-9_!#$%&*@＠\/]|(^|[^a-zA-Z0-9_+~.-\/#]))[@＠]([a-z][-\.a-z\d]+[a-z\d])/gi,
    (match, preceeding1, preceeding2, user) => {
      const userLower = user.toLowerCase();
      const valid = validate_account_name(userLower) === null;

      if (valid && usertags) usertags.add(userLower);

      const preceedings = (preceeding1 || "") + (preceeding2 || ""); // include the preceeding matches if they exist

      if (!mutate) return `${preceedings}${user}`;

      return valid
        ? `${preceedings}<a href="/@${userLower}">@${user}</a>`
        : `${preceedings}@${user}`;
    }
  );

  content = content.replace(linksAny("gi"), (ln) => {
    if (linksRe.image.test(ln)) {
      if (images) images.add(ln);
      return `<img src="${ipfsPrefix(ln)}" />`;
    }

    // do not linkify .exe or .zip urls
    if (/\.(zip|exe)$/i.test(ln)) return ln;

    // do not linkify phishy links
    if (Phishing.looksPhishy(ln))
      return `<div title='${getPhishingWarningMessage()}' class='phishy'>${ln}</div>`;

    if (links) links.add(ln);
    return `<a href="${ipfsPrefix(ln)}">${ln}</a>`;
  });
  return content;
}

function embedYouTubeNode(child, links, images) {
  try {
    const data = child.data;
    const yt = youTubeId(data);
    if (!yt) return child;

    if (yt.startTime) {
      child.data = data.replace(
        yt.url,
        `~~~ embed:${yt.id} youtube ${yt.startTime} ~~~`
      );
    } else {
      child.data = data.replace(yt.url, `~~~ embed:${yt.id} youtube ~~~`);
    }

    if (links) links.add(yt.url);
    if (images) images.add(yt.thumbnail);
  } catch (error) {
    console.error("yt_node", error);
  }
  return child;
}

/** @return {id, url} or <b>null</b> */
function youTubeId(data) {
  if (!data) return null;

  const m1 = data.match(linksRe.youTube);
  const url = m1 ? m1[0] : null;
  if (!url) return null;

  const m2 = url.match(linksRe.youTubeId);
  const id = m2 && m2.length >= 2 ? m2[1] : null;
  if (!id) return null;

  const startTime = url.match(/t=(\d+)s?/);

  return {
    id,
    url,
    startTime: startTime ? startTime[1] : 0,
    thumbnail: "https://img.youtube.com/vi/" + id + "/0.jpg",
  };
}

/** @return {id, url} or <b>null</b> */
function getThreeSpeakId(data) {
  if (!data) return null;

  const match = data.match(linksRe.threespeak);
  const url = match ? match[0] : null;
  if (!url) return null;
  const fullId = match[1];
  const id = fullId.split("/").pop();

  return {
    id,
    fullId,
    url,
    thumbnail: `https://img.3speakcontent.online/${id}/post.png`,
  };
}

function embedThreeSpeakNode(child: any, links?: any, images?: any) {
  try {
    if (typeof child === "string") {
      // If typeof child is a string, this means we are trying to process the HTML
      // to replace the image/anchor tag created by 3Speak dApp
      const threespeakId = getThreeSpeakId(child);
      if (threespeakId) {
        child = child.replace(
          linksRe.threespeakImageLink,
          `~~~ embed:${threespeakId.fullId} threespeak ~~~`
        );
      }
    } else {
      // If child is not a string, we are processing plain text
      // to replace a bare URL
      const data = child.data;
      const threespeakId = getThreeSpeakId(data);
      if (!threespeakId) return child;

      child.data = data.replace(
        threespeakId.url,
        `~~~ embed:${threespeakId.fullId} threespeak ~~~`
      );

      if (links) links.add(threespeakId.url);
      if (images) images.add(threespeakId.thumbnail);
    }
  } catch (error) {
    console.log(error);
  }

  return child;
}

function embedVimeoNode(child, links) {
  try {
    const data = child.data;
    const vimeo = vimeoId(data);
    if (!vimeo) return child;

    const vimeoRegex = new RegExp(`${vimeo.url}(#t=${vimeo.startTime}s?)?`);
    if (vimeo.startTime > 0) {
      child.data = data.replace(
        vimeoRegex,
        `~~~ embed:${vimeo.id} vimeo ${vimeo.startTime} ~~~`
      );
    } else {
      child.data = data.replace(vimeoRegex, `~~~ embed:${vimeo.id} vimeo ~~~`);
    }

    if (links) links.add(vimeo.canonical);
    // if(images) images.add(vimeo.thumbnail) // not available
  } catch (error) {
    console.error("vimeo_embed", error);
  }
  return child;
}

function vimeoId(data) {
  if (!data) return null;
  const m = data.match(linksRe.vimeo);
  if (!m || m.length < 2) return null;

  const startTime = m.input.match(/t=(\d+)s?/);

  return {
    id: m[1],
    url: m[0],
    startTime: startTime ? startTime[1] : 0,
    canonical: `https://player.vimeo.com/video/${m[1]}`,
    // thumbnail: requires a callback - http://stackoverflow.com/questions/1361149/get-img-thumbnails-from-vimeo
  };
}

function embedTwitchNode(child, links /*images*/) {
  try {
    const data = child.data;
    const twitch = twitchId(data);
    if (!twitch) return child;

    child.data = data.replace(twitch.url, `~~~ embed:${twitch.id} twitch ~~~`);

    if (links) links.add(twitch.canonical);
  } catch (error) {
    console.error("twitch_error", error);
  }
  return child;
}

function twitchId(data) {
  if (!data) return null;
  const m = data.match(linksRe.twitch);
  if (!m || m.length < 3) return null;

  return {
    id: m[1] === `videos` ? `?video=${m[2]}` : `?channel=${m[2]}`,
    url: m[0],
    canonical:
      m[1] === `videos`
        ? `https://player.twitch.tv/?video=${m[2]}`
        : `https://player.twitch.tv/?channel=${m[2]}`,
  };
}

function embedDTubeNode(child, links /*images*/) {
  try {
    const data = child.data;
    const dtube = dtubeId(data);
    if (!dtube) return child;

    child.data = data.replace(dtube.url, `~~~ embed:${dtube.id} dtube ~~~`);

    if (links) links.add(dtube.canonical);
  } catch (error) {
    console.error("dtube_embed", error);
  }
  return child;
}

function dtubeId(data: any) {
  if (!data) return null;
  const m = data.match(linksRe.dtube);
  if (!m || m.length < 2) return null;

  return {
    id: m[1],
    url: m[0],
    canonical: `https://emb.d.tube/#!/${m[1]}`,
  };
}

function ipfsPrefix(url) {
  // Convert //ipfs/xxx  or /ipfs/xxx  into  https://steemit.com/ipfs/xxxxx
  if (/^\/?\/ipfs\//.test(url)) {
    const slash = url.charAt(1) === "/" ? 1 : 0;
    url = url.substring(slash + "/ipfs/".length); // start with only 1 /
    return "" + "/" + url;
  }

  return url;
}
