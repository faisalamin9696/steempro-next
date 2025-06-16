import striptags from "striptags";
import { Remarkable } from "remarkable";

const remarkable = new Remarkable({ html: true });
import textEllipsis from "@/utils/ellipsis";
import { FeedBodyLength } from "../constants/AppConstants";
import htmlReady from "@/components/body/htmlReady";

const getValidImage = (array) => {
  return array &&
    Array.isArray(array) &&
    array.length >= 1 &&
    typeof array[0] === "string"
    ? array[0]
    : null;
};

function decodeEntities(body: string): string {
  return body?.replace(/&lt;/g, "<")?.replace(/&gt;/g, ">");
}

export const postSummary = (text: string): string => {
  let body = striptags(
    remarkable.render(striptags(decodeEntities(text || "")))
  );
  body = body?.replace(/(?:https?|ftp):\/\/[\S]+/g, "");

  // If body consists of whitespace characters only skip it.
  if (!body?.replace(/\s/g, "")?.length) {
    return "";
  }

  return textEllipsis(body, FeedBodyLength);
};

export function extractImageLink(json_metadata, body = "") {
  let json = json_metadata || {};
  let image_link;

  try {
    image_link = json && json.image ? getValidImage(json.image) : null;
  } catch (error) {}

  // If nothing found in json metadata, parse body and check images/links
  if (!image_link) {
    let rtags;
    {
      const isHtml = /^<html>([\S\s]*)<\/html>$/.test(body);
      const htmlText = isHtml
        ? body
        : remarkable.render(
            body.replace(/<!--([\s\S]+?)(-->|$)/g, "(html comment removed: $1)")
          );
      rtags = htmlReady(htmlText, { mutate: true });
    }

    [image_link] = Array.from(rtags.images);
  }

  // Was causing broken thumnails.  IPFS was not finding images uploaded to another server until a restart.
  // if(config.ipfs_prefix && image_link) // allow localhost nodes to see ipfs images
  //     image_link = image_link.replace(links.ipfsPrefix, config.ipfs_prefix)

  return image_link;
}
