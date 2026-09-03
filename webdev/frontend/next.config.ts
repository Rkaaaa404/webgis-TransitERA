import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Allow access from local network devices
  allowedDevOrigins: ['192.168.1.16', 'http://192.168.1.16:3000', '192.168.1.17', 'http://192.168.1.17:3000', 'localhost:3000', 'http://localhost:3000'],
};

export default nextConfig;
