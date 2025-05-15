import xmldom from "xmldom";
import { getDoubleSize, proxifyImageUrl } from "../../libs/utils/proxifyUrl";
import { validate_account_name } from "@/libs/utils/chainValidation";
import linksRe, { any as linksAny } from "@/libs/utils/parseLinks";
import * as Phishing from "@/libs/utils/phishing";

export const getPhishingWarningMessage = () =>
  "Alert: recognized as phishnig link";
export const getExternalLinkWarningMessage = () => "Open external link";
import {
  embedNode as EmbeddedPlayerEmbedNode,
  preprocessHtml,
} from "@/components/elements/EmbededPlayers";
import { youtubeRegex } from "./ProcessLink";

const noop = () => {};
const DOMParser = new xmldom.DOMParser({
  errorHandler: { warning: noop, error: noop },
});
const XMLSerializer = new xmldom.XMLSerializer();

export function extractMetadata(data) {
  if (!data) return null;

  const m1 = data.match(youtubeRegex.main);
  const url = m1 ? m1[0] : null;

  if (!url) return null;

  const m2 = url.match(youtubeRegex.contentId);
  const id = m2 && m2.length >= 2 ? m2[2] : null;

  if (!id) return null;

  const startTime = url.match(/t=(\d+)s?/);
  return {
    id,
    url,
    canonical: url,
    startTime: startTime ? startTime[1] : 0,
    thumbnail: "https://img.youtube.com/vi/" + id + "/0.jpg",
  };
}

export default function (
  html,
  { mutate = true, hideImages = false, lightbox = false } = {}
) {
  const state: any = { mutate };
  state.hashtags = new Set();
  state.usertags = new Set();
  state.htmltags = new Set();
  state.images = new Set();
  state.links = new Set();
  state.lightbox = lightbox;
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
    if (!mutate) return state;
    return {
      html: doc ? XMLSerializer.serializeToString(doc) : "",
      ...state,
    };
  } catch (error: any) {
    // xmldom error is bad
    console.error(
      "rendering error",
      JSON.stringify({ error: error.message, html })
    );
    return { html: "" };
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
      // If this link is not relative, http, https, steem -- add https.
      if (!/^((#)|(\/(?!\/))|(((steem|https?):)?\/\/))/.test(url)) {
        child.setAttribute("href", "https://" + url);
      }

      // Unlink potential phishing attempts
      if (
        (url.indexOf("#") !== 0 && // Allow in-page links
          child.textContent.match(/(www\.)?steemit\.com/i) &&
          !url.match(/(steem|https)?:\/\/(.*@)?(www\.)?steemit\.com/i)) ||
        Phishing.looksPhishy(url)
      ) {
        const phishyDiv = child.ownerDocument.createElement("div");
        phishyDiv.textContent = `${child.textContent} / ${url}`;
        phishyDiv.setAttribute("title", getPhishingWarningMessage());
        phishyDiv.setAttribute("class", "phishy");
        const parentNode = child.parentNode;
        parentNode.appendChild(phishyDiv);
        parentNode.removeChild(child);
      }
    }
  }
}

// wrap iframes in div.videoWrapper to control size/aspect ratio
function iframe(state, child) {
  const url = child.getAttribute("src");

  // @TODO move this into the centralized EmbeddedPlayer code
  if (url) {
    const { images, links } = state;
    const yt = extractMetadata(url);

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

function linkifyNode(child, state) {
  try {
    const tag = child.parentNode.tagName
      ? child.parentNode.tagName.toLowerCase()
      : child.parentNode.tagName;
    if (tag === "code") return;
    if (tag === "a") return;

    const { mutate } = state;
    if (!child.data) return;

    child = EmbeddedPlayerEmbedNode(child, state.links, state.images);

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
      const newChild = DOMParser.parseFromString(`<span>${content}</span>`);
      const parentNode = child.parentNode;
      parentNode.appendChild(newChild);
      parentNode.removeChild(child);
      // eslint-disable-next-line consistent-return
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
    /(^|[^a-zA-Z0-9_!#$%&*@＠/=]|(^|[^a-zA-Z0-9_+~.-/#=]))[@＠]([a-z][-.a-z\d]+[a-z\d])/gi,
    (match, preceeding1, preceeding2, user) => {
      const userLower = user.toLowerCase();
      const valid = validate_account_name(userLower) == null;

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

function handleDir(state, child) {
  if (state.mutate) {
    child.setAttribute("dir", "auto");
  }
}
