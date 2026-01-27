import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  // turbopack: {
  //   root: join(__dirname, ".."),
  // },
  experimental: {
    turbopackFileSystemCacheForDev: true,
    cssChunking: true, // default
  },
  transpilePackages: ["lottie-react", "lottie-web", "lucide-react", "next"],
  productionBrowserSourceMaps: true,

  images: {
    qualities: [25, 50, 75],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.steemitimages.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "steemitimages.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "images.steempro.com",
        port: "",
      },
    ],
  },

  async rewrites() {
    return [
      // profile mapping without tab
      {
        source: "/@:username",
        destination: "/profile/:username/blog",
      },

      // profile mapping with tab
      {
        source:
          "/@:username/:tab(blog|posts|comments|replies|friends|wallet|notifications|communities|settings)",
        destination: "/profile/:username/:tab",
      },

      // post mapping without tag
      {
        source: "/@:author/:permlink",
        destination: "/post/:author/:permlink",
      },

      // post mapping with tag
      {
        source: "/:category/@:author/:permlink",
        destination: "/post/:author/:permlink",
      },

      // community mapping
      {
        source:
          "/:category(created|trending|hot|payout|about|pinned|roles|log|popular)/hive-:tag",
        destination: "/community/:category/:tag",
      },

      // tag mapping
      {
        source: "/:category(created|trending|hot|payout|popular)/:tag",
        destination: "/category/:category/:tag",
      },

      // home mapping without category
      {
        source: "/",
        destination: "/home/trending",
      },

      // home mapping with category
      {
        source: "/:category(created|trending|hot|payout|popular)",
        destination: "/home/:category",
      },

      // about page uppercase handle
      {
        source: "/ABOUT",
        destination: "/about",
      },

      // proposal page uppercase handle
      {
        source: "/PROPOSALS",
        destination: "/proposals",
      },

      // proposal page uppercase handle
      {
        source: "/PROPOSALS/:id",
        destination: "/proposals/:id",
      },

      // settings page uppercase handle
      {
        source: "/SETTINGS",
        destination: "/settings",
      },

      // policy page uppercase handle
      {
        source: "/PRIVACY-POLICY",
        destination: "/privacy-policy",
      },

      // communities page uppercase handle
      {
        source: "/COMMUNITIES",
        destination: "/communities",
      },

      // schedules page uppercase handle
      {
        source: "/SCHEDULES",
        destination: "/schedules",
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*\\.(svg|jpg|jpeg|png|gif|ico|json|webp|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default withBotId(nextConfig);
