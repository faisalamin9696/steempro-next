import striptags from "striptags";
import { Remarkable } from "remarkable";
import { extractBodySummary } from "@/utils/extractContent";
import { twMerge } from "tailwind-merge";
import { useMemo } from "react";

const remarkable = new Remarkable({ html: true });

function fixBrokenHtml(html: string): string {
  return (
    html
      // Fix tags like </div → </div>
      .replace(/<\/([a-zA-Z0-9]+)\s*$/gm, "</$1>")
      .replace(/<\/([a-zA-Z0-9]+)\s*\n/gm, "</$1>\n")
      // Fix <div ...> without closing >
      .replace(/<([a-zA-Z0-9]+)([^>]*)\n/gm, "<$1$2>\n")
  );
}

function decodeEntities(body: string): string {
  return body
    ?.replace(/&lt;/g, "<")
    ?.replace(/&gt;/g, ">")
    ?.replace(/&amp;/g, "&")
    ?.replace(/&quot;/g, '"')
    ?.replace(/&#39;/g, "'");
}

interface BodyShortProps {
  body: string;
  className?: string;
  length?: number;
}

const ShortBody = ({ body, className, length = 200 }: BodyShortProps) => {
  const cleanedBody =useMemo(() => {
    if (!body) return "";

    let decoded = decodeEntities(body);

    // Fix invalid HTML BEFORE rendering
    decoded = fixBrokenHtml(decoded);

    // Convert markdown + HTML to HTML
    let rendered = remarkable.render(decoded);

    // Remove <img>
    rendered = rendered.replace(/<img[^>]*>/gi, "");

    // Strip tags but keep headings and strong
    let text = striptags(rendered, ["strong", "h1", "h2", "h3"]);

    // Cleanup spacing
    text = text.replace(/\s{2,}/g, " ").trim();

    return text;
  }, [body]);

  if (!cleanedBody) return null;

  return (
    <p className={twMerge("wrap-break-word", className)}>
      {extractBodySummary(cleanedBody, length)}
    </p>
  );
};

export default ShortBody;
