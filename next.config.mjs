/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
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
  env: {
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
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
