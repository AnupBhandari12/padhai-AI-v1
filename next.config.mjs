/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
  },
  serverExternalPackages: [
    'pdf-parse',
    '@napi-rs/canvas',
  ],
};

export default nextConfig;
