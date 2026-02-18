import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.steempro.com";

  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/settings/", "/schedules/", "/submit"],
      },
      {
        userAgent: "*",
        allow: "/",
        crawlDelay: 5,
        disallow: [
          "/api/",
          "/settings/",
          "/schedules/",
          "/submit",
          "/_next/",
          "/static/",
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
          "Images",
          "Mediapartners-Google",
          "Baiduspider",
          "Sogou",
          "Twitterbot",
        ],
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
