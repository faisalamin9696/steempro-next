"use client";

import  { memo, useState, useMemo, useCallback } from "react";
import { Remarkable } from "remarkable";
import sanitizeConfig, { noImageText } from "@/utils/sanitizeConfig";
import sanitize from "sanitize-html";
import { twMerge } from "tailwind-merge";
import { renderToString } from "react-dom/server";
import { generateMd as EmbeddedPlayerGenerateMd } from "./elements";
import HtmlReady from "@/utils/htmlReady";
import RemarkableSpoiler from "@quochuync/remarkable-spoiler";
import "@quochuync/remarkable-spoiler/styles.css";
import RemarkableTable from "@/utils/remarkableTable";
import { BodyParsed } from "./BodyParsed";
import "./markdown.css";

interface MarkdownViewerProps {
  body: string;
  className?: string;
  highQualityPost?: boolean;
  noImage?: boolean;
  allowDangerousHTML?: boolean;
  hideImages?: boolean;
  breaks?: boolean;
  isProxifyImages?: boolean;
  isNsfw?: boolean;
}

const MarkdownViewer = memo(function MarkdownViewer({
  body = "",
  className,
  highQualityPost = false,
  noImage = false,
  allowDangerousHTML = false,
  hideImages = false,
  breaks = true,
  isProxifyImages,
  isNsfw = false,
}: MarkdownViewerProps) {
  const [allowNoImage, setAllowNoImage] = useState(noImage);

  // Memoized remarkable instance
  const remarkable = useMemo(() => {
    return new Remarkable({
      html: true,
      xhtmlOut: true,
      breaks,
      typographer: false,
      quotes: "“”‘’",
    });
  }, [breaks]);

  // Initialize plugins once
  useMemo(() => {
    remarkable.use(RemarkableSpoiler);
    remarkable.use(RemarkableTable);
  }, [remarkable]);

  // Process body content
  const processedContent = useMemo(() => {
    if (!body) return { cleanText: "", noImageActive: false };

    let processedBody = body.trim();
    let isHtml = false;

    // Check if content is HTML
    const htmlMatch = processedBody.match(/^<html>([\S\s]*)<\/html>$/);
    if (htmlMatch && htmlMatch.length === 2) {
      isHtml = true;
      processedBody = htmlMatch[1];
    } else {
      isHtml = /^<p>[\S\s]*<\/p>/.test(processedBody);
    }

    // Remove HTML comments
    processedBody = processedBody.replace(
      /<!--([\s\S]+?)(-->|$)/g,
      "(html comment removed: $1)"
    );

    // Render markdown or use HTML directly
    let renderedText = isHtml
      ? processedBody
      : remarkable.render(processedBody);

    // Wrap in html tags if not present
    if (!renderedText.startsWith("<html>")) {
      renderedText = `<html>${renderedText}</html>`;
    }

    // Process with HtmlReady
    renderedText = HtmlReady(renderedText, { hideImages }).html;

    // Sanitize content
    let cleanText = renderedText;
    if (!allowDangerousHTML) {
      cleanText = sanitize(
        renderedText,
        sanitizeConfig({
          large: true,
          highQualityPost,
          noImage: noImage && allowNoImage,
        })
      );
    } else {
      console.warn("MarkdownViewer rendering unsanitized content");
    }

    // Security check
    if (/<\s*script/gi.test(cleanText)) {
      console.error("Refusing to render script tag in post text");
      return { cleanText: "", noImageActive: false };
    }

    // Process embedded content
    const embedRegex = /~~~ embed:(.*? ~~~)/g;
    let embedIndex = 0;
    let finalText = cleanText;
    let match;

    while ((match = embedRegex.exec(finalText)) !== null) {
      if (match.index === embedRegex.lastIndex) {
        embedRegex.lastIndex += 1;
      }

      const embedMd = EmbeddedPlayerGenerateMd(match[1], embedIndex, true);
      if (embedMd) {
        finalText = finalText.replace(
          match[0],
          renderToString(embedMd.markdown)
        );
      }
      embedIndex += 1;
    }

    const noImageActive = finalText.indexOf(noImageText) !== -1;

    return { cleanText: finalText, noImageActive };
  }, [
    body,
    remarkable,
    allowDangerousHTML,
    highQualityPost,
    noImage,
    allowNoImage,
    hideImages,
  ]);

  const handleShowContent = useCallback(() => {
    setAllowNoImage(false);
  }, []);

  const { cleanText, noImageActive } = processedContent;

  if (!cleanText) {
    return <div className={twMerge("w-full", className)} />;
  }

  return (
    <div
      className={twMerge(
        "markdown-body prose dark:prose-invert prose-sm sm:prose-lg prose-a:text-blue-500",
        className
      )}
    >
      <BodyParsed body={cleanText} isNsfw={isNsfw} />

      {noImageActive && allowNoImage && (
        <div
          role="button"
          tabIndex={0}
          onClick={handleShowContent}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleShowContent();
            }
          }}
          className="MarkdownViewer__negative_group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span>Hidden due to low rating</span>
          <button
            type="button"
            className="button hollow tiny float-right hover:bg-gray-100 transition-colors"
          >
            Show
          </button>
        </div>
      )}
    </div>
  );
});

export default MarkdownViewer;
