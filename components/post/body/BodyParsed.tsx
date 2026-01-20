import React from "react";
// import "./style.scss";
import parse, { domToReact, Element, DOMNode } from "html-react-parser";
import BodyImage from "./BodyImage";
import ProcessedLink from "./ProcessedLink";

export function BodyParsed({
  body,
  isNsfw,
}: {
  body: string;
  isNsfw?: boolean;
}): React.ReactNode {
  let imageCount = 0;
  const options = {
    replace(domNode: DOMNode): any {
      if (!(domNode instanceof Element)) return;

      const { name, attribs, children } = domNode;

      switch (name) {
        case "img":
          if (attribs?.src) {
            imageCount++;
            return (
              <BodyImage
                src={attribs.src}
                alt={attribs.alt}
                priority={imageCount === 1}
              />
            );
          }
          break;

        case "a":
          return <ProcessedLink domNode={domNode} />;

        case "table":
          return (
            <table className="markdown-body table-scrollable">
              {domToReact(children as DOMNode[], options)}
            </table>
          );

        case "p":
          // Prevent hydration errors by converting p to div if it contains block elements
          const hasBlockChild = children.some(
            (child) =>
              child instanceof Element &&
              [
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
              ].includes(child.name),
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
