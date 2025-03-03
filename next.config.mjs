/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
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
  webpack: (config, context) => {
    config.module.rules.push({
      test: /\.node$/,
      loader: "node-loader",
    });
    return config;
  },
};

export default nextConfig;
