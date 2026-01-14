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
          "nsa",
          "GPTBot",
          "Bytespider",
          "Amazonbot",
          "Scrapy",
          "YisouSpider",
          "Applebot-Extended",
          "CCBot",
          "ClaudeBot",
          "Google-Extended",
          "meta-externalagent",
        ],
        disallow: "/",
      },
    ],
    sitemap: "https://steempro.com/sitemap.xml",
  };
}
