/**
 * Translation utility using Google Translate API
 */
import { Remarkable } from "remarkable";
// @ts-ignore
import RemarkableSpoiler from "@quochuync/remarkable-spoiler";
import RemarkableTable from "./remarkableTable";

export interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage?: string;
}

export const POPULAR_LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ur", name: "Urdu", flag: "🇵🇰" },
  { code: "bn", name: "Bengali", flag: "🇧🇩" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "id", name: "Indonesian", flag: "🇮🇩" },
] as const;

async function executeTranslation(
  text: string | string[],
  targetLang: string,
  sourceLang: string = "auto",
) {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, targetLang, sourceLang }),
  });

  if (!res.ok) throw new Error("Translation failed");

  return res.json() as Promise<{
    translatedText: string | string[];
    detectedSourceLanguage?: string;
  }>;
}

export async function translateText(
  text: string,
  targetLang: string,
  sourceLang: string = "auto",
): Promise<TranslationResult> {
  const userRegex = /@([a-z][a-z0-9\-.]{2,15}[a-z0-9])(?![a-z0-9\-.])/g;
  const userPlaceholders: string[] = [];

  // Protect usernames
  const protectedText = text.replace(userRegex, (match) => {
    const placeholder = `[[USERPH${userPlaceholders.length}]]`;
    userPlaceholders.push(match);
    return placeholder;
  });

  const data = await executeTranslation(protectedText, targetLang, sourceLang);
  let translatedBody = data.translatedText as string;

  // Restore usernames
  userPlaceholders.forEach((user, i) => {
    translatedBody = translatedBody.split(`[[USERPH${i}]]`).join(user);
  });

  return {
    translatedText: translatedBody,
    detectedSourceLanguage: data.detectedSourceLanguage,
  };
}

/**
 * Robust version to handle URLs correctly using Remarkable for extraction
 */
export async function translateMarkdown(
  markdown: string,
  targetLang: string,
  sourceLang: string = "auto",
): Promise<TranslationResult> {
  if (!markdown || markdown.trim() === "") return { translatedText: markdown };

  const md = new Remarkable({
    html: true,
    xhtmlOut: true,
    breaks: true,
    typographer: false,
    quotes: "“”‘’",
  });
  md.use(RemarkableSpoiler);
  md.use(RemarkableTable);

  let html = md.render(markdown);

  const urlPlaceholders: string[] = [];
  const userPlaceholders: string[] = [];

  const urlRegex = /(https?:\/\/[^\s<>"']+(?![^<>]*>))/g;
  const userRegex = /@([a-z][a-z0-9\-.]{2,15}[a-z0-9])(?![a-z0-9\-.])/g;
  // 1. Protect all URLs and Usernames in HTML first
  html = html.replace(urlRegex, (url) => {
    const placeholder = `[[URLPH${urlPlaceholders.length}]]`;
    urlPlaceholders.push(url);
    return placeholder;
  });

  html = html.replace(userRegex, (user) => {
    const placeholder = `[[USERPH${userPlaceholders.length}]]`;
    userPlaceholders.push(user);
    return placeholder;
  });

  // 2. Segment tags and text
  const tagRegex = /<[^>]+>/g;
  const segments: { type: "tag" | "text"; content: string }[] = [];
  let lastIndex = 0;
  let match;
  while ((match = tagRegex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: html.substring(lastIndex, match.index),
      });
    }
    segments.push({ type: "tag", content: match[0] });
    lastIndex = tagRegex.lastIndex;
  }
  if (lastIndex < html.length) {
    segments.push({ type: "text", content: html.substring(lastIndex) });
  }

  // 3. Collect translatable parts
  const translatableItems: {
    segIdx: number;
    original: string;
    type: "text" | "attr";
    attrName?: string;
  }[] = [];

  segments.forEach((seg, i) => {
    if (seg.type === "text") {
      // Split by placeholders
      const chunks = seg.content.split(/(\[\[(?:URL|USER)PH\d+\]\])/);
      chunks.forEach((chunk) => {
        if (
          chunk &&
          !chunk.startsWith("[[URLPH") &&
          !chunk.startsWith("[[USERPH") &&
          chunk.trim()
        ) {
          translatableItems.push({ segIdx: i, original: chunk, type: "text" });
        }
      });
    } else {
      // Attributes might have placeholders
      const altMatch = seg.content.match(/alt="([^"]*)"/i);
      if (altMatch && altMatch[1].trim()) {
        if (!/\[\[(?:URL|USER)PH\d+\]\]/.test(altMatch[1])) {
          translatableItems.push({
            segIdx: i,
            original: altMatch[1],
            type: "attr",
            attrName: "alt",
          });
        }
      }
      const titleMatch = seg.content.match(/title="([^"]*)"/i);
      if (titleMatch && titleMatch[1].trim()) {
        if (!/\[\[(?:URL|USER)PH\d+\]\]/.test(titleMatch[1])) {
          translatableItems.push({
            segIdx: i,
            original: titleMatch[1],
            type: "attr",
            attrName: "title",
          });
        }
      }
    }
  });

  if (translatableItems.length === 0) {
    // If no text needs translation, still restore placeholders
    let finalHtml = segments.map((s) => s.content).join("");
    urlPlaceholders.forEach((url, i) => {
      finalHtml = finalHtml.split(`[[URLPH${i}]]`).join(url);
    });
    userPlaceholders.forEach((user, i) => {
      finalHtml = finalHtml.split(`[[USERPH${i}]]`).join(user);
    });
    return { translatedText: `<html>${finalHtml}</html>` };
  }

  // 4. Translate
  const translatedData = await executeTranslation(
    translatableItems.map((item) => item.original),
    targetLang,
    sourceLang,
  );
  const results = Array.isArray(translatedData.translatedText)
    ? translatedData.translatedText
    : [translatedData.translatedText];

  // 5. Restore
  results.forEach((translated, idx) => {
    const item = translatableItems[idx];
    if (!item) return;
    const seg = segments[item.segIdx];
    if (item.type === "text") {
      seg.content = seg.content.split(item.original).join(translated);
    } else {
      const escaped = item.original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`${item.attrName}="${escaped}"`, "i");
      seg.content = seg.content.replace(
        regex,
        `${item.attrName}="${translated}"`,
      );
    }
  });

  let finalHtml = segments.map((s) => s.content).join("");
  urlPlaceholders.forEach((url, i) => {
    finalHtml = finalHtml.split(`[[URLPH${i}]]`).join(url);
  });
  userPlaceholders.forEach((user, i) => {
    finalHtml = finalHtml.split(`[[USERPH${i}]]`).join(user);
  });

  return {
    translatedText: `<html>${finalHtml}</html>`,
    detectedSourceLanguage: translatedData.detectedSourceLanguage,
  };
}
