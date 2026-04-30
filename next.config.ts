/** @type {import('next').NextConfig} */

// const BUILD_MODE = process.env.BUILD_MODE || 'static' || 'api';

const nextConfig = {
  basePath: '',
  async headers() {
    return [
      {
        source: '/.well-known/apple-app-site-association',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300',
          },
        ],
      },
      {
        source: '/apple-app-site-association',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300',
          },
        ],
      },
      {
        source: '/.well-known/assetlinks.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300',
          },
        ],
      },
      {
        source: '/loaderio-59f9e32c73cd0e393774d04dd5f263f1.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain',
          },
        ],
      },
      {
        // Long-lived cache for Next.js static assets (hashed filenames are content-addressed)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache Next.js optimized images for 30 days
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
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
          source: '/:slug((?!dashboard|tienda|me|api|docs|stores|auth|newsletter|_next|\\.well-known|apple-app-site-association).*)',
          destination: '/store/:slug',
        },
        {
          source: '/:slug((?!dashboard|tienda|me|api|docs|stores|auth|newsletter|_next|\\.well-known|apple-app-site-association).*)/:path*',
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
    // Cache optimized images for 30 days in Next.js CDN/edge
    minimumCacheTTL: 2592000,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        // DigitalOcean Spaces CDN endpoint — prefer this for cached delivery
        protocol: 'https',
        hostname: 'markketplace.nyc3.cdn.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
        search: '',
      },
    ],
  },
  turbopack: {},

};

export default nextConfig;
