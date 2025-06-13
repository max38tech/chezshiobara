
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Ensure this is present for Firebase Storage
        port: '',
        pathname: '/**',
      },
      // Add Stripe's image hostname if you plan to use product images from Stripe
      // Example:
      // {
      //   protocol: 'https',
      //   hostname: 'files.stripe.com',
      // },
    ],
  },
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NODE_ENV === 'production' 
      ? 'https://chezshiobara.com' // Updated to actual production domain
      : 'http://localhost:9002', // Ensure this matches your local dev port
  }
};

export default nextConfig;
