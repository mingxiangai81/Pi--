/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // lunar-javascript 为 CommonJS，交由 Next 转译
  transpilePackages: ['lunar-javascript'],
};

module.exports = nextConfig;
