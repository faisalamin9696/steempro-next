import { Constants } from "@/constants";
import { MetadataRoute } from "next";

// Steem API endpoints with fallbacks
const STEEM_API_ENDPOINTS = Constants.rpc_servers;

// Cache control - revalidate every 6 hours for better performance
export const revalidate = 21600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.steempro.com";
  const lastModified = new Date();

  // Core static pages with optimized priorities
  const staticPages: MetadataRoute.Sitemap = [
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
      url: `${baseUrl}/shorts/submit`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
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

  // Fetch dynamic posts and profiles with fallback
  const isDev = process.env.NODE_ENV === "development";
  const dynamicPages = isDev ? [] : await getDynamicPages();
  // Combine and limit total URLs (Google recommends max 50,000)
  const allPages = [...staticPages, ...dynamicPages];

  // Ensure we don't exceed Google's limit
  return allPages.slice(0, 50000);
}

async function getDynamicPages(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.steempro.com";
  const pages: MetadataRoute.Sitemap = [];

  try {
    // Fetch posts and users in parallel for better performance
    const [posts, users] = await Promise.all([
      fetchWithFallback("get_discussions_by_created", { tag: "", limit: 50 }),
      fetchWithFallback("list_accounts", {
        limit: 100,
        order: "by_rank",
        start: "",
      }),
    ]);

    // Add post pages with deduplication
    const postUrls = new Set<string>();
    posts.forEach((post: any) => {
      const url = `${baseUrl}/@${post.author}/${post.permlink}`;
      if (!postUrls.has(url) && post.author && post.permlink) {
        postUrls.add(url);

        pages.push({
          url,
          lastModified: new Date(
            post.created || post.last_update || Date.now(),
          ),
          changeFrequency: "daily",
          priority: 0.7,
          images:
            post.json_metadata?.image?.map((img: string) => ({
              url: img,
              title: post.title,
              caption: post.title,
            })) || [],
        });
      }
    });

    // Add profile pages with deduplication
    const userUrls = new Set<string>();
    users.forEach((user: any) => {
      const url = `${baseUrl}/@${user.name}`;
      if (!userUrls.has(url) && user.name) {
        userUrls.add(url);
        pages.push({
          url,
          lastModified: new Date(
            user.last_update || user.created || Date.now(),
          ),
          changeFrequency: "weekly",
          priority: 0.5,
        });
      }
    });
  } catch (error) {
    console.error("Error fetching dynamic pages:", error);
    // Return empty array on error to not break the sitemap
  }

  return pages;
}

/**
 * Fetch from Steem API with automatic fallback to alternative endpoints
 */
async function fetchWithFallback(method: string, params: any): Promise<any[]> {
  const errors: Error[] = [];

  // Try each endpoint until one succeeds
  for (const endpoint of STEEM_API_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add timeout handling
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: `database_api.${method}`,
          params,
          id: 1,
        }),
        // Cache for 6 hours to reduce API calls
        next: { revalidate: 21600 },
        // Signal for timeout
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(
          `API Error: ${data.error.message || JSON.stringify(data.error)}`,
        );
      }

      return data.result || [];
    } catch (error) {
      errors.push(error as Error);
      console.warn(`Endpoint ${endpoint} failed for method ${method}:`, error);
      // Continue to next endpoint
      continue;
    }
  }

  // If all endpoints fail, log and return empty array
  console.error(`All endpoints failed for method ${method}:`, errors);
  return [];
}
