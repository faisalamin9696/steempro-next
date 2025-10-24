import { filesize } from "filesize";
import { proxifyImageUrl } from "./proxifyUrl";
import { CurrentSetting } from "@/constants/AppConstants";

// get the image from meta data
export const catchImageFromMetadata = (
  meta: any,
  format = "match",
  thumbnail = false
) => {
  if (!meta) return null;
  format = "match";
  meta = JSON.parse(JSON.stringify(meta));
  if (meta && meta.image) {
    const images = meta.image;
    if (thumbnail) {
      return proxifyImageUrl(images[0]);
    }
    return proxifyImageUrl(images[0]);
  }
  return null;
};

export const getResizedImage = (url: string, size = 600, format = "match") => {
  //TODO: implement fallback onError, for imagehoster is down case
  format = "match";
  if (!url) {
    return "";
  }
  return proxifyImageUrl(url);
};

export const getResizedAvatar = (
  author?: string,
  sizeString: "small" | "medium" | "large" = "small"
) => {
  if (!author) {
    return "";
  }
  const BASE_IMAGE_URL = CurrentSetting.imageHosting;

  // author = author.replace('@', '').toLowerCase().trim();
  return `${BASE_IMAGE_URL}/u/${author}/avatar/${sizeString}`;
};

export const getCoverImageUrl = (meta: any) => {
  if (!meta) {
    return null;
  }
  try {
    if (typeof meta === "string") meta = JSON.parse(meta);
    return meta.profile.cover_image;
  } catch (err) {
    return null;
  }
};

export const MAXIMUM_UPLOAD_SIZE = 10000000;
//  15728640;
export const MAXIMUM_UPLOAD_SIZE_HUMAN = filesize(MAXIMUM_UPLOAD_SIZE);

export const getProxyImageURL = (
  url: string,
  type: "preview" | "small" | "large" = "preview"
) => {
  const BASE_IMAGE_URL = CurrentSetting.imageHosting;

  const IMG_PROXY = `${BASE_IMAGE_URL}/0x0/`;
  const IMG_PROXY_PREVIEW = `${BASE_IMAGE_URL}/600x800/`;
  const IMG_PROXY_SMALL = `${BASE_IMAGE_URL}/40x40/`;
  url = url.replaceAll("amp;", "");
  if (
    url?.indexOf("https://ipfs.busy.org") === 0 ||
    url?.indexOf("https://gateway.ipfs.io") === 0
  ) {
    return `${IMG_PROXY}${url}`;
  } else if (type === "preview") {
    return `${IMG_PROXY_PREVIEW}${url}`;
  } else if (type === "small") {
    return `${IMG_PROXY_SMALL}${url}`;
  }
  return `${IMG_PROXY}${url}`;
};

export const getThumbnail = (json_images: string, size?: string): string => {
  try {
    let image = JSON.parse(json_images ?? "{}")?.[0] ?? [];
    if (image) return proxifyImageUrl(image, size ?? "640x480");
    else return "";
  } catch (error) {
    return "";
  }
};
export const isValidImage = (file: any) =>
  file.type.match("image/.*") && file.size <= MAXIMUM_UPLOAD_SIZE;

export default null;
