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
};

export default nextConfig;
