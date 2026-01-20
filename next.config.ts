/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Increase server action limits for uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // 2. DISABLE IMAGE OPTIMIZATION (Fixes the timeouts)
  images: {
    unoptimized: true, // <--- THIS MUST BE TRUE
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xfadexugknljbaphecjy.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;