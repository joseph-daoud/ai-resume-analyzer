/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tells Next.js where the backend API lives.
  // This variable is available in the browser as process.env.NEXT_PUBLIC_API_URL
  env: {
    NEXT_PUBLIC_API_URL: "http://localhost:8000",
  },
};

export default nextConfig;