/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tells Next.js where the backend API lives.
  // In production, Vercel injects its own NEXT_PUBLIC_API_URL environment
  // variable at build time. Locally, no such variable exists, so it falls
  // back to your local backend at localhost:8000.
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  },
};

export default nextConfig;