import sanitize from "sanitize-html";
import remarkableStripper from "@/utils/remarkableStripper";
import { htmlDecode } from "./htmlDecode";

/**
 * Short description - remove bold and header, links with titles.
 *
 * if `strip_quotes`, try to remove any block quotes at beginning of body.
 */
export function extractBodySummary(body, strip_quotes = false): string {
  let desc = body;
  if (strip_quotes) desc = desc.replace(/(^(\n|\r|\s)*)>([\s\S]*?).*\s*/g, "");
  desc = remarkableStripper.render(desc); // render markdown to html
  desc = sanitize(desc, { allowedTags: [] }); // remove all html, leaving text
  desc = htmlDecode(desc);

  // Strip any raw URLs from preview text
  desc = desc.replace(/https?:\/\/[^\s]+/g, "");

  // Grab only the first line (not working as expected. does rendering/sanitizing strip newlines?)
  desc = desc.trim().split("\n")[0];

  if (desc.length > 140) {
    desc = desc.substring(0, 140).trim();

    // Truncate, remove the last (likely partial) word (along with random punctuation), and add ellipses
    desc = desc
      .substring(0, 120)
      .trim()
      .replace(/[,!\?]?\s+[^\s]+$/, "…");
  }

  return desc;
}

export function highlightKeyword(text, keyword, color) {
  if (!text) return "";
  var content = text.split(keyword);
  var newText = content.join(
    `<span style="background: ${color};">${keyword}</span>`
  );
  return newText;
}
