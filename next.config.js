/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        os: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'uba.edu.vn',
      },
      {
        protocol: 'https',
        hostname: 'www.bpsclub.com',
      },
      {
        protocol: 'https',
        hostname: 'us1.discourse-cdn.com',
      },
    ],
  },
};

module.exports = nextConfig;
