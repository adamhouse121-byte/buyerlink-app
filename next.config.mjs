/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Redirect OLD marketing URLs to the app
  async redirects() {
    return [
      // Legacy settings page → app subdomain
      {
        source: '/a/:agentId/settings',
        destination: 'https://app.buyerpref.link/a/:agentId/settings',
        permanent: true, // 308
      },
      // Legacy form link → new public link
      {
        source: '/a/:agentId/form',
        destination: 'https://app.buyerpref.link/p/:agentId',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
