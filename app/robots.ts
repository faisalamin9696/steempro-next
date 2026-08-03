import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.steempro.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/settings/",
          "/schedules/",
          "/submit",
          "/*?*", // Prevent indexing search/query param URLs to prevent duplicate content issues
        ],
      },
      {
        userAgent: [
          // AI scrapers & training bots
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "claude-web",
          "anthropic-ai",
          "Bytespider",
          "CCBot",
          "PerplexityBot",
          "Perplexity-User",
          "DeepSeekBot",
          "Google-CloudVertexBot",
          "meta-externalagent",
          "MistralAI-User",
          // SEO scrapers & data miners
          "AhrefsBot",
          "SemrushBot",
          "DotBot",
          "MJ12bot",
          "DataForSEOBot",
          "Scrapy",
        ],
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

