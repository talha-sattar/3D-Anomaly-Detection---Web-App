/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
      // Add this new rule for temp_output
      {
        source: '/temp_output/:path*',
        destination: 'http://localhost:5000/temp_output/:path*',
      },
    ];
  },
};

export default nextConfig;