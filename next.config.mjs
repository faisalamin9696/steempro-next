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
    MYSQL_DB_HOST: process.env.MYSQL_DB_HOST,
    MYSQL_DB_PORT: process.env.MYSQL_DB_PORT,
    MYSQL_DB_USERNAME: process.env.MYSQL_DB_USERNAME,
    MYSQL_DB_PASSWORD: process.env.MYSQL_DB_PASSWORD,
    MYSQL_DB_DATABASE: process.env.MYSQL_DB_DATABASE,
    MYSQL_SSH_HOST: process.env.MYSQL_SSH_HOST,
    MYSQL_SSH_PORT: process.env.MYSQL_SSH_PORT,
    MYSQL_SSH_USERNAME: process.env.MYSQL_SSH_USERNAME,
    MYSQL_SSH_PASSWORD: process.env.MYSQL_SSH_PASSWORD,
  },
};

export default nextConfig;
