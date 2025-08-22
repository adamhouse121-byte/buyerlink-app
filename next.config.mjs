/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Forward the agentId from the old URL to a simple page
  async rewrites() {
    return [
      { source: '/a/:agentId/settings', destination: '/moved-settings?agentId=:agentId' },
    ];
  },
};

export default nextConfig;
