import { Button } from "@heroui/button";
import parse, { domToReact } from "html-react-parser";
import React, { useState } from "react";
import CommentCover from "../comment/components/CommentCover";
import "./style.scss";
import { MdOpenInNew } from "react-icons/md";
import { proxifyImageUrl } from "@/libs/utils/proxifyUrl";
import { getProxyImageURL } from "@/libs/utils/parseImage";
import Link from "next/link";

export function ParsedBody({
  body,
  isNsfw,
}: {
  body: string;
  isNsfw?: boolean;
}): React.ReactNode {
  function handleOpenImage(url?: string) {
    if (url && window)
      window
        .open(getProxyImageURL(proxifyImageUrl(url), "large"), "_blank")
        ?.focus();
  }

  const [showOpen, setShowOpen] = useState(false);
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
              onLoadCompleted={() => setShowOpen(true)}
            />

            {showOpen && <Button
              size="sm"
              isIconOnly
              title="Open image"
              variant="flat"
              onPress={() => handleOpenImage(domNode?.attribs?.src)}
              radius="full"
              className="open-button absolute top-0 right-0 m-1"
            >
              <MdOpenInNew size={18} />
            </Button>}

            {/* <NsfwOverlay /> */}
          </div>
        );
      }

      if (domNode?.name === "a") {
        // Render the table content using domToReact
        return (
          <Link {...domNode?.attribs}>{domToReact(domNode.children)}</Link>
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

  return parsedBody as React.ReactNode;
}
