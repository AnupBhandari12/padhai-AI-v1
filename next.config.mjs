/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
  },
  serverExternalPackages: [
    'pdf-parse',
    '@napi-rs/canva'
  ],
};

export default nextConfig;
