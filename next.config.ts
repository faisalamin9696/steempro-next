import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  productionBrowserSourceMaps: true,
  transpilePackages: ["lottie-react", "lottie-web", "lucide-react", "next"],
  images: {
    qualities: [25, 50, 75],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
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
        destination: "/community/:tag/:category",
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
      // communities page uppercase handle
      {
        source: "/GAMES",
        destination: "/games",
      },

      // schedules page uppercase handle
      {
        source: "/GAMES/STEEM-HEIGHTS",
        destination: "/games/steem-heights",
      },

      // explorer page uppercase handle
      {
        source: "/EXPLORER",
        destination: "/explorer",
      },
    ];
  },
};

export default withNextIntl(nextConfig);
