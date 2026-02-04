import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        crawlDelay: 5,
        disallow: [
          "/api/",
          "/settings/",
          "/submit/",
          "/schedules/",
          "/privacy-policy",
        ],
      },
      
      {
        userAgent: [
          "AhrefsBot",
          "Amazonbot",
          "anthropic-ai",
          "Applebot-Extended",
          "Bytespider",
          "CCBot",
          "ChatGPT-User",
          "claude-web",
          "ClaudeBot",
          "Dataprovider.com",
          "DeepSeekBot",
          "DotBot",
          "GPTBot",
          "Google-CloudVertexBot",
          "meta-externalagent",
          "MistralAI-User",
          "nsa",
          "OAI-SearchBot",
          "Perplexity-User",
          "PerplexityBot",
          "Scrapy",
          "YandexBot",
          "YisouSpider",
        ],
        disallow: "/",
      },
    ],
    sitemap: "https://steempro.com/sitemap.xml",
  };
}
