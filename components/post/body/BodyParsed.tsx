import React from "react";
// import "./style.scss";
import parse, { domToReact, Element, DOMNode } from "html-react-parser";
import BodyImage from "./BodyImage";
import ProcessedLink, { isEmbedUrl } from "./ProcessedLink";
import type { GalleryImage } from "@/components/post/ImageModal";

/** Tag names a `<p>` is not allowed to contain in valid HTML. */
const BLOCK_ELEMENTS = [
  "div",
  "p",
  "table",
  "center",
  "blockquote",
  "pre",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "iframe",
  "hr",
  "details",
  "summary",
];

export function BodyParsed({
  body,
  isNsfw,
  isShort,
  shortsUrl,
}: {
  body: string;
  isNsfw?: boolean;
  isShort?: boolean;
  shortsUrl?: string;
}): React.ReactNode {
  // Filled in by the synchronous parse below, so the array is already complete
  // by the time React renders the elements holding a reference to it. Sharing
  // one array instance is what lets us hand the whole gallery to every image
  // without parsing the body a second time to learn the total.
  const gallery: GalleryImage[] = [];
  let imageCount = 0;
  const options = {
    replace(domNode: DOMNode): any {
      if (!(domNode instanceof Element)) return;

      const { name, attribs, children } = domNode;

      switch (name) {
        case "img":
          if (attribs?.src) {
            imageCount++;
            gallery.push({ src: attribs.src, alt: attribs.alt });
            return (
              <BodyImage
                src={attribs.src}
                alt={attribs.alt}
                isShort={isShort}
                shortsUrl={shortsUrl}
                priority={imageCount === 1}
                gallery={gallery}
                galleryIndex={imageCount - 1}
              />
            );
          }
          break;

        case "a":
          const hasImg = (domNode.children as DOMNode[])?.some(
            (child) => child instanceof Element && child.name === "img",
          );

          if (hasImg) {
            return domToReact(domNode.children as DOMNode[], options);
          }

          return <ProcessedLink domNode={domNode} options={options} />;

        case "table":
          return (
            <div className="table-wrapper scrollbar-thin py-3">
              <table>{domToReact(children as DOMNode[], options)}</table>
            </div>
          );

        case "p":
          // Prevent hydration errors by converting p to div if it contains block elements
          const hasBlockChild = children.some(
            (child) =>
              child instanceof Element &&
              (BLOCK_ELEMENTS.includes(child.name) ||
                // An anchor is inline by spec, but an embed URL behind it is
                // rendered as an iframe / blockquote / wrapper div, which a
                // <p> may not contain.
                (child.name === "a" &&
                  isEmbedUrl(child.attribs?.href))),
          );

          if (hasBlockChild) {
            return (
              <div {...(attribs as any)}>
                {domToReact(children as DOMNode[], options)}
              </div>
            );
          }
          break;
      }
    },
  };

  const parsedBody = parse(body, options);
  return parsedBody as React.ReactNode;
}
