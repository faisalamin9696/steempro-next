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
    NEXT_DB_HOST: process.env.NEXT_DB_HOST,
    NEXT_DB_PORT: process.env.NEXT_DB_PORT,
    NEXT_DB_USERNAME: process.env.NEXT_DB_USERNAME,
    NEXT_DB_PASSWORD: process.env.NEXT_DB_PASSWORD,
    NEXT_DB_DATABASE: process.env.NEXT_DB_DATABASE,
    NEXT_SSH_HOST: process.env.NEXT_SSH_HOST,
    NEXT_SSH_PORT: process.env.NEXT_SSH_PORT,
    NEXT_SSH_USERNAME: process.env.NEXT_SSH_USERNAME,
    NEXT_SSH_PASSWORD: process.env.NEXT_SSH_PASSWORD,
  },
};

export default nextConfig;
