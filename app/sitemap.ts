import { MetadataRoute } from "next";

// Cache control - revalidate every 24 hours
export const revalidate = 86400;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.steempro.com";
  const lastModified = new Date();

  return [
    // Homepage - highest priority
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "always",
      priority: 1.0,
    },
    // Content discovery - high priority
    {
      url: `${baseUrl}/trending`,
      lastModified,
      changeFrequency: "always",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hot`,
      lastModified,
      changeFrequency: "always",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/created`,
      lastModified,
      changeFrequency: "always",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/shorts`,
      lastModified,
      changeFrequency: "always",
      priority: 0.9,
    },
    // Features - medium-high priority
    {
      url: `${baseUrl}/explorer`,
      lastModified,
      changeFrequency: "always",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/market`,
      lastModified,
      changeFrequency: "hourly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/witnesses`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/communities`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/proposals`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.7,
    },
    // Interactive features - medium priority
    {
      url: `${baseUrl}/games`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.55,
    },
    {
      url: `${baseUrl}/games/steem-heights`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.55,
    },
    // Static informational pages - lower priority
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}

