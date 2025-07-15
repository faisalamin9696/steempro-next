import React from "react";
import CommentCover from "../comment/components/CommentCover";
import "./style.scss";
import { useAppSelector } from "@/constants/AppFunctions";
import { getSettings } from "@/utils/user";
import ProcessLink from "./ProcessLink";
import parse, { domToReact, Element, DOMNode } from "html-react-parser";

export function ParsedBody({
  body,
  isNsfw,
}: {
  body: string;
  isNsfw?: boolean;
}): React.ReactNode {
  const settings =
    useAppSelector((state) => state.settingsReducer.value) ?? getSettings();

  const options = {
    replace(domNode: DOMNode) {
      if (!(domNode instanceof Element)) return;

      const { name, attribs, children } = domNode;

      switch (name) {
        case "img":
          if (attribs?.src) {
            return (
              <CommentCover
                isNsfw={isNsfw}
                src={attribs.src}
                alt={attribs.alt}
                noCard
              />
            );
          }
          break;

        case "a":
          return <ProcessLink domNode={domNode} />;

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
