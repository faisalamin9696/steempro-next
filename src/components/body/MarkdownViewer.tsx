"use client";

import React, { memo, useState } from "react";
import { Remarkable } from "remarkable";
import sanitizeConfig, { noImageText } from "./SanitizeConfig";
import sanitize from "sanitize-html";
import { twMerge } from "tailwind-merge";
import { renderToString } from "react-dom/server";
import { generateMd as EmbeddedPlayerGenerateMd } from "@/components/elements/EmbededPlayers";
import HtmlReady from "./htmlReady";
import RemarkableSpoiler from "@quochuync/remarkable-spoiler";
import "@quochuync/remarkable-spoiler/styles.css";
import RemarkableTable from "./RemarkableTable";
import { ParsedBody } from "./ParsedBody";

interface Props {
  // HTML properties
  text: string;
  className?: string;
  highQualityPost?: boolean;
  noImage?: boolean;
  allowDangerousHTML?: boolean;
  hideImages?: boolean;
  breaks?: boolean;
  isProxifyImages?: boolean;
  isNsfw?: boolean;
}
export default memo(function MarkdownViewer(props: Props) {
  const {
    allowDangerousHTML = false,
    breaks = true,
    className,
    hideImages = false,
    isProxifyImages,
    noImage,
    highQualityPost,
    isNsfw = false,
  } = props;
  let { text } = props;

  const large = true;

  const [allowNoImage, setAllowNoImage] = useState(props.noImage);
  if (!text) text = ""; // text can be empty, still view the link meta data

  // text = renderPostBody(text, false, true)
  if (!text) text = ""; // text can be empty, still view the link meta data
  let html = false;
  // See also ReplyEditor isHtmlTest
  const m = text.match(/^<html>([\S\s]*)<\/html>$/);
  if (m && m.length === 2) {
    html = true;
    text = m[1];
  } else {
    // See also ReplyEditor isHtmlTest
    html = /^<p>[\S\s]*<\/p>/.test(text);
  }

  // Strip out HTML comments. "JS-DOS" bug.
  text = text.replace(/<!--([\s\S]+?)(-->|$)/g, "(html comment removed: $1)");

  const renderer = new Remarkable({
    html: true, // remarkable renders first then sanitize runs...
    xhtmlOut: true,
    breaks: breaks,
    typographer: false, // https://github.com/jonschlinkert/remarkable/issues/142#issuecomment-221546793
    quotes: "“”‘’",
  });
  renderer.use(RemarkableSpoiler);
  renderer.use(RemarkableTable);

  let renderedText = html ? text : renderer.render(text);

  if (!renderedText.startsWith("<html>")) {
    renderedText = "<html>" + renderedText + "</html>";
  }

  // Embed videos, link mentions and hashtags, etc...
  if (renderedText) renderedText = HtmlReady(renderedText, { hideImages }).html;

  // Complete removal of javascript and other dangerous tags..
  // The must remain as close as possible to dangerouslySetInnerHTML
  let cleanText = renderedText;
  if (allowDangerousHTML === true) {
    console.log("WARN\tMarkdownViewer rendering unsanitized content");
  } else {
    cleanText = sanitize(
      renderedText,
      sanitizeConfig({
        large,
        highQualityPost,
        noImage: noImage && allowNoImage,
      })
    );
  }

  if (/<\s*script/gi.test(cleanText)) {
    // Not meant to be complete checking, just a secondary trap and red flag (code can change)
    console.error("Refusing to render script tag in post text", cleanText);
    return <div />;
  }

  const noImageActive = cleanText.indexOf(noImageText) !== -1;

  const regex = /~~~ embed:(.*? ~~~)/gm;
  let matches;
  let processedText = cleanText;
  // In addition to inserting the youtube component, this allows
  // react to compare separately preventing excessive re-rendering.
  let idx = 0;

  while ((matches = regex.exec(processedText)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (matches.index === regex.lastIndex) {
      regex.lastIndex += 1;
    }

    const embedMd = EmbeddedPlayerGenerateMd(matches[1], idx, large);
    if (embedMd) {
      processedText = processedText.replace(
        matches[0],
        renderToString(embedMd.markdown)
      );
    }

    idx += 1;
  }

  return (
    <div className={twMerge("markdown-body w-full", className)}>
      <ParsedBody body={processedText} isNsfw={isNsfw} />
      {noImageActive && allowNoImage && (
        <div
          role="link"
          tabIndex={0}
          key="hidden-content"
          onClick={() => setAllowNoImage(false)}
          className="MarkdownViewer__negative_group"
        >
          {"Hidden due to low rating"}
          <button
            type="button"
            style={{ marginBottom: 0 }}
            className="button hollow tiny float-right"
          >
            {"Show"}
          </button>
        </div>
      )}
    </div>
  );
});
