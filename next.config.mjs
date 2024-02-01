/** @type {import('next').NextConfig} */
const nextConfig = {
    // output: 'export',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.steemitimages.com',
                port: '',
            },
            {
                protocol: 'https',
                hostname: 'steemitimages.com',
                port: '',
            },
        ],
    },
};

export default nextConfig;
