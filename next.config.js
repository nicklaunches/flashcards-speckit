/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  output: 'standalone',
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle sql.js for server-side
      config.externals = config.externals || [];
      config.externals.push('sql.js');
    } else {
      // Client-side webpack configuration
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;