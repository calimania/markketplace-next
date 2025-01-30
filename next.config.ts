/** @type {import('next').NextConfig} */

const BUILD_MODE = process.env.BUILD_MODE || 'static' || 'api';

const nextConfig = {
  output: BUILD_MODE === 'static' ? 'export' : undefined,
  images: {
    unoptimized: BUILD_MODE === 'static',
  },
  basePath: '',
  experimental: {
    excludeRoutes: BUILD_MODE === 'static' ? ['/api/*'] : []
  },
}

export default nextConfig;
