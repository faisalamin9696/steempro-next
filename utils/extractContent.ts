import sanitize from "sanitize-html";
import remarkableStripper from "@/utils/remarkableStripper";
import { htmlDecode } from "./htmlDecode";
export function extractBodySummary(
  body: string,
  length = 140,
  strip_quotes = false
): string {
  let desc = body;

  // Remove block quotes
  if (strip_quotes) {
    desc = desc.replace(/(^(\n|\r|\s)*)>([\s\S]*?)\n?/g, "");
  }

  // Render markdown to HTML
  desc = remarkableStripper.render(desc);

  // Remove all HTML tags -> keep only plain text
  desc = sanitize(desc, { allowedTags: [] });

  // Decode HTML entities
  desc = htmlDecode(desc);

  // Remove URLs
  desc = desc.replace(/https?:\/\/[^\s]+/g, "");

  // Normalize whitespace (VERY IMPORTANT)
  desc = desc.replace(/\s+/g, " ").trim();

  // Apply max length
  if (desc.length > length) {
    // Cut near the limit
    desc = desc.slice(0, length).trim();

    // Remove last cut-off word
    desc = desc.replace(/\s+[^\s]+$/, "");

    desc += "…";
  }

  return desc;
}
