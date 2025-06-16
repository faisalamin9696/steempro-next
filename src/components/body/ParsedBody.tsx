import parse, { domToReact } from "html-react-parser";
import React from "react";
import CommentCover from "../comment/components/CommentCover";
import "./style.scss";
import { useAppSelector } from "@/constants/AppFunctions";
import { getSettings } from "@/utils/user";
import ProcessLink from "./ProcessLink";

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
    replace(domNode) {
      if (domNode?.attribs && domNode?.name === "img") {
        return (
          <CommentCover
            isNsfw={isNsfw}
            src={domNode?.attribs?.src}
            alt={domNode?.attribs?.alt}
            noCard
          />
        );
      }

      if (domNode?.name === "a") {
        return <ProcessLink domNode={domNode} />;
      }

      if (domNode?.name === "table") {
        // Render the table content using domToReact
        return (
          <table className="markdown-body table-scrollable">
            {domToReact(domNode.children, options)}
          </table>
        );
      }
    },
  };

  const parsedBody = parse(body, options);

  return parsedBody as React.ReactNode;
}
