/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Disables Vercel Image Optimization to bypass the 5,000 limit
    unoptimized: true,
    
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
