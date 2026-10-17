import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ['@pao/shared'],
  webpack: (config) => {
    // Tối ưu xử lý asset và module cho Phaser

    return config;
  },
};

export default withPWA(nextConfig);
