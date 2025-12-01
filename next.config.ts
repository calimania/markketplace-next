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
  //       // Considering ways to Rewrite /:slug to /store/:slug ONLY if no file/page exists at /:slug
  //       // This allows cleaner URLs like /horns instead of /store/horns
  //       // while preserving /home, /docs, /stores, /dashboard, /api, etc.
  //       // curently app/[slug]/page displays stores|docs pages
  // async rewrites() {
  //   return {
  //     afterFiles: [
  //       {
  //         source: '/:slug',
  //         destination: '/store/:slug',
  //       },
  //       {
  //         source: '/:slug/:path*',
  //         destination: '/store/:slug/:path*',
  //       },
  //     ],
  //   };
  // },
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
