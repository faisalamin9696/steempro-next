import { Constants } from "@/constants";
import base58 from "bs58";

const rProxyDomainsDimensions =
  /http(s)?:\/\/steemit(dev|stage)?images.com\/([0-9]+x[0-9]+)\//g;
const NATURAL_SIZE = "0x0/";
const CAPPED_SIZE = "640x0/";
const DOUBLE_CAPPED_SIZE = "1280x0/";

export const imageProxy = () => Constants.activeSettings.image_server;
export const defaultWidth = () => Number.parseInt(CAPPED_SIZE.split("x")[0]);

const ensureTrailingSlash = (s: string) => (s?.endsWith("/") ? s : `${s}/`);

const registrableDomain = (hostname: string) => {
  const parts = hostname.toLowerCase().split(".").filter(Boolean);
  return parts.length <= 2 ? parts.join(".") : parts.slice(-2).join(".");
};

const isFirstPartyImageHost = (hostname: string) => {
  try {
    const proxyHost = new URL(imageProxy()).hostname;
    const base = registrableDomain(proxyHost);
    const h = hostname.toLowerCase();
    return h === base || h.endsWith(`.${base}`);
  } catch {
    return false;
  }
};

export const defaultSrcSet = (url: string) => {
  if (typeof url === "string" && url.includes(CAPPED_SIZE)) {
    return `${url} 1x, ${url.replace(CAPPED_SIZE, DOUBLE_CAPPED_SIZE)} 2x`;
  }
  try {
    const u = new URL(url);
    const width = Number.parseInt(u.searchParams.get("width") || "0", 10);
    if (width <= 0) return `${url} 1x`;
    u.searchParams.set("width", String(width * 2));
    return `${url} 1x, ${u.toString()} 2x`;
  } catch {
    return `${url} 1x`;
  }
};

export const isDefaultImageSize = (url: string) => {
  if (url?.startsWith(`${ensureTrailingSlash(imageProxy())}${CAPPED_SIZE}`))
    return true;
  try {
    const u = new URL(url);
    return (
      u.pathname.includes("/p/") &&
      u.searchParams.get("width") === String(defaultWidth())
    );
  } catch {
    return false;
  }
};

export function proxifyImageUrl(
  url: string | null,
  dimensions: string | boolean = false,
  emptyCheck = false,
) {
  if (!url || (emptyCheck && url === "")) return url;
  const proxyList = url.match(rProxyDomainsDimensions);
  let respUrl = url.replaceAll("amp;", "");

  if (proxyList) {
    const lastProxy = proxyList[proxyList.length - 1];
    respUrl = url.substring(url.lastIndexOf(lastProxy) + lastProxy.length);
  }

  if (!dimensions) return respUrl;

  let dims =
    typeof dimensions === "string"
      ? ensureTrailingSlash(dimensions)
      : proxyList
        ? (proxyList[0].match(/([0-9]+x[0-9]+)\//g)?.[0] ?? NATURAL_SIZE)
        : NATURAL_SIZE;

  if (!respUrl.match(/\.gif$/) && dims === NATURAL_SIZE) {
    dims = CAPPED_SIZE;
  }

  try {
    const target = new URL(respUrl);
    if (!isFirstPartyImageHost(target.hostname)) return respUrl;

    const [wStr, hStr] = dims.split("/")[0].split("x");
    const width = Number.parseInt(wStr, 10);
    const height = Number.parseInt(hStr, 10);

    if (target.pathname.includes("/p/")) {
      target.searchParams.set("mode", "fit");
      target.searchParams.set("format", "match");
      if (width > 0) {
        target.searchParams.set("width", String(width));
      } else {
        target.searchParams.delete("width");
      }
      if (height > 0) {
        target.searchParams.set("height", String(height));
      } else {
        target.searchParams.delete("height");
      }
      return target.toString();
    }

    const b58 = base58.encode(Buffer.from(respUrl, "utf8"));
    const pUrl = new URL(`${ensureTrailingSlash(imageProxy())}p/${b58}`);
    pUrl.searchParams.set("mode", "fit");
    pUrl.searchParams.set("format", "match");
    if (width > 0) pUrl.searchParams.set("width", String(width));
    if (height > 0) pUrl.searchParams.set("height", String(height));
    return pUrl.toString();
  } catch {
    return respUrl;
  }
}

export const getDoubleSize = (url: string) =>
  url.replace(CAPPED_SIZE, DOUBLE_CAPPED_SIZE);
export const getNaturalSize = (url: string) =>
  getCdnImage(url);

export const getCdnImage = (url: string) => {
  const match = url.match(/\/p\/([^?#]+)/);
  if (match) {
    try {
      return Buffer.from(base58.decode(match[1])).toString("utf8");
    } catch {
      return url;
    }
  }
  return url;
};
