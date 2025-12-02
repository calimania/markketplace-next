/** @type {import('next').NextConfig} */

// const BUILD_MODE = process.env.BUILD_MODE || 'static' || 'api';

const nextConfig = {
  basePath: '',
  async headers() {
    return [
      {
        source: '/loaderio-59f9e32c73cd0e393774d04dd5f263f1.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain',
          },
        ],
      },
    ];
  },
  // Rewrite clean URLs (/:slug) to internal file structure (/store/:slug)
  // This allows cleaner URLs like /horns instead of /store/horns
  // Excludes: dashboard, api, docs, stores, auth, chisme, newsletter, _next
  async rewrites() {
    return {
      afterFiles: [
        {
          source: '/:slug((?!dashboard|api|docs|stores|auth|newsletter|_next).*)',
          destination: '/store/:slug',
        },
        {
          source: '/:slug((?!dashboard|api|docs|stores|auth|newsletter|_next).*)/:path*',
          destination: '/store/:slug/:path*',
        },
      ],
    };
  },
  // Redirect old /store/:slug URLs to clean /:slug URLs
  async redirects() {
    return [
      {
        source: '/store/:slug',
        destination: '/:slug',
        permanent: true,
      },
      {
        source: '/store/:slug/:path*',
        destination: '/:slug/:path*',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'markketplace.nyc3.digitaloceanspaces.com',
        port: '',
        pathname: '/uploads/**',
        search: '',
      },
    ],
  },

};

export default nextConfig;
