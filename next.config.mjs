/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  webpack: (config, context) => {
    config.module.rules.push({
      test: /\.node$/,
      loader: "node-loader",
    });
    return config;
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      // {
      //     protocol: 'https',
      //     hostname: 'cdn.steemitimages.com',
      //     port: '',
      // },
      // {
      //     protocol: 'https',
      //     hostname: 'steemitimages.com',
      //     port: '',
      // },
      {
        protocol: "https",
        hostname: "**",
        port: "",
      },

      {
        protocol: "http",
        hostname: "**",
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
          "/:category(created|trending|hot|payout|about|pinned)/hive-:tag",
        destination: "/community/:category/:tag",
      },

      // tag mapping
      {
        source: "/:category(created|trending|hot|payout)/:tag",
        destination: "/category/:category/:tag",
      },

      // home mapping without category
      {
        source: "/",
        destination: "/home/trending",
      },

      // home mapping with category
      {
        source: "/:category(created|trending|hot|payout)",
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
        source: "/POLICY",
        destination: "/policy",
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
};

export default nextConfig;
