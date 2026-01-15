/**
 * Translation utility using Google Translate API
 */

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

/**
 * Translate text using Google Translate API
 * @param text - The text to translate
 * @param targetLang - The target language code
 * @param sourceLang - Optional source language code (auto-detect if not provided)
 */
export async function translateText(
  text: string,
  targetLang: string,
  sourceLang: string = "auto"
): Promise<TranslationResult> {
  try {
    // Extract markdown elements
    const {
      text: processedText,
      images,
      links,
    } = extractAndPreserveImages(text);

    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: processedText,
        targetLang,
        sourceLang,
      }),
    });

    if (!response.ok) {
      throw new Error("Translation failed");
    }

    const data = await response.json();
    const translatedText = restoreImagesAndLinks(
      data.translatedText,
      images,
      links
    );

    return {
      translatedText,
      detectedSourceLanguage: data.detectedSourceLanguage,
    };
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
}

/**
 * Alternative: More robust version that preserves alt text during translation
 */
export function extractAndPreserveImages(markdown: string): {
  text: string;
  images: Array<{ placeholder: string; url: string; alt?: string }>;
  links: Array<{ placeholder: string; url: string; text: string }>;
} {
  let text = markdown;
  const images: Array<{ placeholder: string; url: string; alt?: string }> = [];
  const links: Array<{ placeholder: string; url: string; text: string }> = [];

  // Extract images with alt text
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
    const placeholder = `__IMG_${images.length}__`;
    images.push({ placeholder, url, alt });
    return placeholder;
  });

  // Extract links (not images)
  text = text.replace(
    /(?<!!)\[([^\]]+)\]\(([^)]+)\)/g,
    (match, linkText, url) => {
      const placeholder = `__LINK_${links.length}__`;
      links.push({ placeholder, url, text: linkText });
      return placeholder;
    }
  );

  return { text, images, links };
}

export function restoreImagesAndLinks(
  translatedText: string,
  images: Array<{ placeholder: string; url: string; alt?: string }>,
  links: Array<{ placeholder: string; url: string; text: string }>
): string {
  let result = translatedText;

  // Restore images (alt text should be translated, but URL remains)
  images.forEach(({ placeholder, url, alt }) => {
    const imageMarkdown = alt ? `![${alt}](${url})` : `![](${url})`;
    result = result.replace(placeholder, imageMarkdown);
  });

  // Restore links (link text should be translated, but URL remains)
  links.forEach(({ placeholder, url, text }) => {
    const linkMarkdown = `[${text}](${url})`;
    result = result.replace(placeholder, linkMarkdown);
  });

  return result;
}
