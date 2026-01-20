/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. Increase the upload limit (e.g., to 5MB or 10MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // 2. Keep your existing image settings
  images: {
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
