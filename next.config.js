/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.vimeocdn.com'
      }
    ]
  }
};

module.exports = nextConfig;
