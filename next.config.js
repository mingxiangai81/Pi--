/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 静态导出，供 Firebase Hosting 托管（产物在 out/）
  output: 'export',
  // 静态导出无 Image Optimization 服务器，关闭优化
  images: { unoptimized: true },
  // lunar-javascript 为 CommonJS，交由 Next 转译
  transpilePackages: ['lunar-javascript'],
};

module.exports = nextConfig;
