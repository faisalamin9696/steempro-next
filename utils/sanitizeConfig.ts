import { IOptions, Attributes } from 'sanitize-html';
import { Constants } from "@/constants";
import {
  getExternalLinkWarningMessage,
  getPhishingWarningMessage,
} from "./htmlReady";
import { defaultSrcSet, isDefaultImageSize } from "./proxifyUrl";
import { validateIframeUrl as validateEmbbeddedPlayerIframeUrl } from "@/components/post/body/elements";
import { replaceOldDomains } from "@/utils/parseLinks";

export const noImageText = "(Image not shown due to low ratings)";
export const allowedTags = `
    div, iframe, del,
    a, p, b, i, q, br, ul, li, ol, img, h1, h2, h3, h4, h5, h6, hr,
    blockquote, pre, code, em, strong, center, table, thead, tbody, tr, th, td,
    strike, sup, sub, span, details, summary
`
  .trim()
  .split(/,\s*/);

interface SanitizeConfigOptions {
  large?: boolean;
  highQualityPost?: boolean;
  noImage?: boolean;
  sanitizeErrors?: string[];
}

export default ({
  large = true,
  highQualityPost = true,
  noImage = false,
  sanitizeErrors = [],
}: SanitizeConfigOptions = {}): IOptions => {
  const allowedAttributes: IOptions['allowedAttributes'] = {
    iframe: [
      "src",
      "width",
      "height",
      "frameborder",
      "allowfullscreen",
      "webkitallowfullscreen",
      "mozallowfullscreen",
      "sandbox",
      "class",
    ],
    div: ["class", "title"],
    td: ["style"],
    th: ["style"],
    img: ["src", "srcset", "alt", "class"],
    a: ["href", "rel", "title", "class", "target", "id"],
    span: ["data-bg", "style"],
    p: ["dir"],
  };

  const transformTags: IOptions['transformTags'] = {
    iframe: (tagName: string, attribs: Attributes): { tagName: string; attribs: Attributes } => {
      const srcAtty = attribs.src as string;
      const widthAtty = attribs.width as string;
      const heightAtty = attribs.height as string;
      
      const {
        validUrl,
        useSandbox,
        sandboxAttributes,
        width,
        height,
        providerId,
      } = validateEmbbeddedPlayerIframeUrl(
        srcAtty,
        large,
        widthAtty,
        heightAtty
      );

      if (validUrl !== false) {
        const iframeAttribs: Attributes = {
          frameborder: "0",
          allowfullscreen: "allowfullscreen",
          webkitallowfullscreen: "webkitallowfullscreen",
          mozallowfullscreen: "mozallowfullscreen",
          src: validUrl,
          width,
          height,
          class: `${providerId}-iframe`,
        };
        
        if (useSandbox) {
          if (sandboxAttributes.length > 0) {
            iframeAttribs.sandbox = sandboxAttributes.join(" ");
          } else {
            iframeAttribs.sandbox = "";
          }
        }
        
        return { tagName: "iframe", attribs: iframeAttribs };
      }

      console.log(
        'Blocked, did not match iframe "src" white list urls:',
        tagName,
        attribs
      );

      sanitizeErrors.push("Invalid iframe URL: " + srcAtty);
      return { 
        tagName: "div", 
        attribs: {}, 
        text: `(Unsupported ${srcAtty})` 
      } as any;
    },

    img: (tagName: string, attribs: Attributes): { tagName: string; attribs: Attributes } => {
      if (noImage) {
        return { 
          tagName: "div", 
          attribs: {}, 
          text: noImageText 
        } as any;
      }
      
      let { src } = attribs;
      const { alt } = attribs;
      
      if (!src || !/^(https?:)?\/\//i.test(src as string)) {
        console.log(
          "Blocked, image tag src does not appear to be a url",
          tagName,
          attribs
        );
        sanitizeErrors.push("An image in this post did not save properly.");
        return { 
          tagName: "img", 
          attribs: { alt: alt as string || '' } 
        };
      }

      // replace http:// with // to force https when needed
      src = (src as string).replace(/^http:\/\//i, "//");
      const atts: Attributes = { src };
      
      if (alt && alt !== "") atts.alt = alt;
      if (isDefaultImageSize(src as string)) {
        atts.srcset = defaultSrcSet(src as string);
      }
      
      return { tagName, attribs: atts };
    },

    div: (tagName: string, attribs: Attributes): { tagName: string; attribs: Attributes } => {
      const attys: Attributes = {};
      const classWhitelist = [
        "pull-right",
        "pull-left",
        "text-justify",
        "text-rtl",
        "text-center",
        "text-right",
        "videoWrapper",
        "iframeWrapper",
        "redditWrapper",
        "tweetWrapper",
        "phishy",
        "table-responsive",
      ];
      
      const validClass = classWhitelist.find((e) => attribs.class == e);
      if (validClass) attys.class = validClass;
      
      if (
        validClass === "phishy" &&
        attribs.title === getPhishingWarningMessage()
      ) {
        attys.title = attribs.title as string;
      }
      
      return { tagName, attribs: attys };
    },

    th: (tagName: string, attribs: Attributes): { tagName: string; attribs: Attributes } => {
      const attys: Attributes = {};
      const allowedStyles = [
        "text-align:right",
        "text-align:left",
        "text-align:center",
      ];
      
      if (allowedStyles.indexOf(attribs.style as string) !== -1) {
        attys.style = attribs.style;
      }

      return { tagName, attribs: attys };
    },

    td: (tagName: string, attribs: Attributes): { tagName: string; attribs: Attributes } => {
      const attys: Attributes = {};
      const allowedStyles = [
        "text-align:right",
        "text-align:left",
        "text-align:center",
      ];
      
      if (allowedStyles.indexOf(attribs.style as string) !== -1) {
        attys.style = attribs.style;
      }

      return { tagName, attribs: attys };
    },

    a: (tagName: string, attribs: Attributes): { tagName: string; attribs: Attributes } => {
      let { href } = attribs;
      if (!href) href = "#";
      href = replaceOldDomains(href as string);

      href = (href as string).trim();

      const attys: Attributes = { ...attribs, href };
      
      // If it's not a (relative or absolute) steem URL...
      if (
        !href.match(`^(/(?!/)|${"steemitimages.com"})`) &&
        !href.match(`^(/(?!/)|${"images.steempro.com"})`) &&
        !href.match(`^(/(?!/)|https://${Constants.site_url})`) &&
        !href.match(`^(/(?!/)|steem://)`)
      ) {
        attys.target = "_blank";
        attys.rel = highQualityPost
          ? "noreferrer noopener"
          : "nofollow noreferrer noopener";
        attys.title = getExternalLinkWarningMessage();
        attys.class = "external_link";
      }
      
      return { tagName, attribs: attys };
    },

    span: (tagName: string, attribs: Attributes): { tagName: string; attribs: Attributes } => {
      const dataBg = attribs["data-bg"];
      const attribsToSet: Attributes = {};

      if (dataBg) {
        attribsToSet.style = `background-image: url(${dataBg})`;
      }

      return { tagName, attribs: attribsToSet };
    },
  };

  return {
    allowedTags,
    allowedAttributes,
    allowedSchemes: ["http", "https", "steem", "esteem"],
    transformTags,
  };
};