/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [{
            protocol: 'https',
            hostname: 'media.transcendentrealty.com',
            port: '',
        }],
    },

    async headers() {
        return [
            {
                // Public folder images (/public/images/*) — safe to cache aggressively since
                // they are versioned by filename and rarely change between deploys.
                source: '/images/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        // Serve from cache for 24 h; after expiry, serve stale while
                        // revalidating in the background for up to 7 days.
                        value: 'public, max-age=86400, stale-while-revalidate=604800',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;