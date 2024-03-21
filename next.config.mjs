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
                protocol: 'https',
                hostname: '**',
                port: '',
            },

            {
                protocol: 'http',
                hostname: '**',
                port: '',
            },
        ],
    },
};

export default nextConfig;
