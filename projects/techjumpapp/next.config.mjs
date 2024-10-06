/** @type {import('next').NextConfig} */
const nextConfig = {
    redirects: async () => [
        {
            destination: process.env.BACKEND_ONE_URL,
            source: '/api/backend-one',
            permanent: true,

        },
        {
            destination: process.env.BACKEND_TWO_URL,
            source: '/api/backend-two',
            permanent: true,
        }
    ]
};

export default nextConfig;
