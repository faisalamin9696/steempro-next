import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  allowedDevOrigins: ["192.168.1.100"],
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
          "/@:username/:tab(blog|posts|comments|replies|friends|wallet|notifications|communities|settings|shorts)",
        destination: "/profile/:username/:tab",
      },

      // shorts mapping
      {
        source: "/shorts/@:author/:permlink",
        destination: "/shorts/:author/:permlink",
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
    ];
  },
};

export default withNextIntl(nextConfig);
