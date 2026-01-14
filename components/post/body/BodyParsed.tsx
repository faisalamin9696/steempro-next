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
  const options = {
    replace(domNode: DOMNode) {
      if (!(domNode instanceof Element)) return;

      const { name, attribs, children } = domNode;

      switch (name) {
        case "img":
          if (attribs?.src) {
            return <BodyImage src={attribs.src} alt={attribs.alt} />;
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
      }
    },
  };

  const parsedBody = parse(body, options);
  return parsedBody as React.ReactNode;
}
