/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Force cache clear - updated timestamp to trigger rebuild
  generateBuildId: async () => {
    return `build-20260226-${Date.now()}`
  },
}

export default nextConfig
