/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/a/:agentId/settings',
        destination: 'https://app.buyerpref.link/moved-settings?agentId=:agentId',
        permanent: false, // 307
      },
    ];
  },
};

export default nextConfig;
