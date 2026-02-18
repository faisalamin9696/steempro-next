import { sdsApi } from "@/libs/sds";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.steempro.com";
  const lastModified = new Date();

  // Core static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "always",
      priority: 1.0,
    },
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
      priority: 0.8,
    },
    {
      url: `${baseUrl}/created`,
      lastModified,
      changeFrequency: "always",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/market`,
      lastModified,
      changeFrequency: "hourly",
      priority: 0.8,
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
    {
      url: `${baseUrl}/games`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/games/steem-heights`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    // Fetch top 100 communities to index
    const communities = await sdsApi.getCommunities(null, 100);
    const communityPages: MetadataRoute.Sitemap = (communities || []).map(
      (community) => ({
        url: `${baseUrl}/trending/hive-${community.id}`,
        lastModified,
        changeFrequency: "daily",
        priority: 0.6,
      }),
    );

    return [...staticPages, ...communityPages];
  } catch (error) {
    console.error("Failed to fetch communities for sitemap:", error);
    return staticPages;
  }
}
