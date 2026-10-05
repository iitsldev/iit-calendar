/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/eula',
        destination: '/terms',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
