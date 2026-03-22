import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './i18n/request.ts'
);

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

export default withSentryConfig(withNextIntl(nextConfig), {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "steempro",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
