import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://steempro.com",
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1,
    },
    {
      url: "https://steempro.com/trending",
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.9,
    },
    {
      url: "https://steempro.com/hot",
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.9,
    },
    {
      url: "https://steempro.com/created",
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.9,
    },
    {
      url: "https://steempro.com/market",
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.8,
    },
    {
      url: "https://steempro.com/witnesses",
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.8,
    },
    {
      url: "https://steempro.com/communities",
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.8,
    },
    {
      url: "https://steempro.com/proposals",
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.8,
    },
    {
      url: "https://steempro.com/games",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://steempro.com/games/steem-heights",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://steempro.com/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: "https://steempro.com/privacy-policy",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
