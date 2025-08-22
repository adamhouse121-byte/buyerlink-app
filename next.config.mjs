/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Send /a/:agentId/settings to a simple static page
  async rewrites() {
    return [
      { source: '/a/:agentId/settings', destination: '/moved-settings' },
    ];
  },
};

export default nextConfig;
