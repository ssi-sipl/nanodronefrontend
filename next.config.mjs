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
        source: "/api/sensor/:path*",
        destination: "http://localhost:5000/sensor/:path*", // Adjust port if needed
      },
      {
        source: "/api/area/:path*",
        destination: "http://localhost:5000/area/:path*",
      },
      {
        source: "/api/drone/:path*",
        destination: "http://localhost:5000/drone/:path*",
      },
    ];
  },
};

export default nextConfig;
