/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
  },
  serverExternalPackages: [
    'pdf-parse',
    '@napi-rs/canvas',
  ],

  outputFileTracingIncludes: {
    '/api/documents': [
      './node_modules/@napi-rs/canvas/**/*',
      './node_modules/pdf-parse/**/*',
      './node_modules/pdfjs-dist/**/*',
    ],
  },
};

export default nextConfig;
