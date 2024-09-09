import { Button } from "@nextui-org/button";
import parse, { domToReact } from "html-react-parser";
import React from "react";
import CommentCover from "../comment/components/CommentCover";
import "./style.scss";
import { MdOpenInNew } from "react-icons/md";
import { proxifyImageUrl } from "@/libs/utils/ProxifyUrl";
import { getProxyImageURL } from "@/libs/utils/image";

export function ParsedBody({
  body,
  isNsfw,
}: {
  body: string;
  isNsfw?: boolean;
}): JSX.Element {
  function handleOpenImage(url?: string) {
    if (url && window)
      window
        .open(getProxyImageURL(proxifyImageUrl(url), "large"), "_blank")
        ?.focus();
  }
  const options = {
    replace(domNode) {
      if (domNode?.attribs && domNode?.name === "img") {
        return (
          <div className="img-container relative">
            <CommentCover
              isNsfw={isNsfw}
              src={domNode?.attribs?.src}
              alt={domNode?.attribs?.alt}
              noCard
            />

            <Button
              size="sm"
              isIconOnly
              title="Open image"
              variant="flat"
              onClick={() => handleOpenImage(domNode?.attribs?.src)}
              radius="full"
              className="open-button  absolute top-0 right-0 m-1"
            >
              <MdOpenInNew className="text-xl" />
            </Button>

            {/* <NsfwOverlay /> */}
          </div>
        );
      }
     
      if (domNode?.name === "table") {
        // Render the table content using domToReact
        return (
          <table className="markdown-body table-scrollable">
            {domToReact(domNode.children)}
          </table>
        );
      }
    },
  };

  const parsedBody = parse(body, options);

  return parsedBody as JSX.Element;
}
