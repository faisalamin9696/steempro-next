import xmldom from "xmldom";
import { getDoubleSize, proxifyImageUrl } from "../../libs/utils/proxifyUrl";
import { validate_account_name } from "@/libs/utils/chainValidation";
import linksRe, {
  any as linksAny,
  replaceOldDomains,
  SECTION_LIST,
  WHITE_LIST,
} from "@/libs/utils/parseLinks";
import * as Phishing from "@/libs/utils/phishing";
import {
  INTERNAL_POST_TAG_REGEX,
  MENTION_REGEX,
  POST_REGEX,
} from "./regexes.const";
import {
  embedNode as EmbeddedPlayerEmbedNode,
  preprocessHtml,
} from "@/components/elements/EmbededPlayers";

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
        // eslint-disable-next-line no-restricted-syntax
        for (const image of Array.from(
          doc.getElementsByTagName("img")
        ) as any) {
          const pre = doc.createElement("pre");
          pre.setAttribute("class", "image-url-only");
          pre.appendChild(doc.createTextNode(image.getAttribute("src")));

          const imageParent = image.parentNode;
          imageParent.appendChild(pre);
          imageParent.removeChild(image);
        }
      } else {
        proxifyImages(doc, state);
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

function traverse(node, state, depth = 0) {
  if (!node || !node.childNodes) return;
  Array.from(node.childNodes).forEach((child: any) => {
    // console.log(depth, 'child.tag,data', child.tagName, child.data)
    const tag = child.tagName ? child.tagName.toLowerCase() : null;
    if (tag) state.htmltags.add(tag);

    if (tag === "img") img(state, child);
    else if (tag === "iframe") iframe(state, child);
    else if (tag === "a") link(state, child);
    else if (child.nodeName === "#text") linkifyNode(child, state);
    else if (tag === "p") handleDir(state, child);

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
        child.setAttribute("href", "https://" + replaceOldDomains(url));
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
    child.parentNode.classList &&
    child.parentNode.classList.contains("videoWrapper") &&
    child.parentNode.classList.contains("redditWrapper") &&
    child.parentNode.classList.contains("tweetWrapper")
  ) {
    return;
  }
  const html = XMLSerializer.serializeToString(child);
  const width = child.attributes.getNamedItem("width");
  const height = child.attributes.getNamedItem("height");

  let aspectRatioPercent = 100;
  if (width && height) {
    aspectRatioPercent = (height.value / width.value) * 100;
  }

  child.parentNode.replaceChild(
    DOMParser.parseFromString(`<div class="iframeWrapper">${html}</div>`),
    child
  );
  const styleAttr = document.createAttribute("style");
  styleAttr.value = `position: relative; width: 100%; height: 0; padding-bottom: ${aspectRatioPercent}%;`;
  child.attributes.setNamedItem(styleAttr);
}

function img(state, child) {
  const url = child.getAttribute("src");
  if (url) {
    state.images.add(url);
    if (state.mutate) {
      let url2 = url;
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

function proxifyImages(doc, state) {
  if (!doc) return;

  Array.from(doc.getElementsByTagName("img")).forEach((node: any) => {
    const url = node.getAttribute("src");
    const alt = node.getAttribute("alt");

    if (!linksRe.local.test(url)) {
      const proxifiedImageUrl = proxifyImageUrl(url, "640x0", true);

      if (state.lightbox && process.env.BROWSER) {
        const parentNode = node.parentNode;
        parentNode.appendChild(
          DOMParser.parseFromString(`<a href="${getDoubleSize(
            proxifyImageUrl(url, "640x0", true)
          )}">
                    <img
                        src="${proxifiedImageUrl}"
                        alt="${alt}"
                    />
                </a>`)
        );
        parentNode.removeChild(node);
      } else {
        node.setAttribute("src", proxifiedImageUrl);
      }
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

    child = EmbeddedPlayerEmbedNode(child, state.links, state.images);

    // child = DOMParser.parseFromString(`<span>${child}</span>`);
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
      const href = child?.nodeValue?.trim();

      let newChild = DOMParser.parseFromString(`<span>${content}</span>`);

      const postMatch = href.match(POST_REGEX);
      if (postMatch && WHITE_LIST.includes(postMatch[1].replace(/www./, ""))) {
        const tag = postMatch[2];
        const author = postMatch[3].replace("@", "");
        const permlink = postMatch[4];
        newChild = DOMParser.parseFromString(
          `<span><a href="/${tag}/@${author}/${permlink}">@${author}/${permlink}</a></span>`
        );
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
          newChild = DOMParser.parseFromString(
            `<span><a href="/@${author}">@${author}</a></span>`
          );
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
          newChild = DOMParser.parseFromString(
            `<span><a href="${href}">@${author}/${section}</a></span>`
          );
        }
      }
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
      return `<img src="${ln}" />`;
    }

    // do not linkify .exe or .zip urls
    if (/\.(zip|exe)$/i.test(ln)) return ln;

    // do not linkify phishy links
    if (Phishing.looksPhishy(ln))
      return `<div title='${getPhishingWarningMessage()}' class='phishy'>${ln}</div>`;

    if (links) links.add(ln);
    return `<a href="${ln}">${ln}</a>`;
  });
  return content;
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

function handleDir(state, child) {
  if (state.mutate) {
    child.setAttribute("dir", "auto");
  }
}
