/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  // Static export only for production builds (Cloudflare Pages)
  // Dev server uses normal Next.js mode so `npm run dev` works
  ...(isProd ? { output: 'export', distDir: 'dist' } : {}),
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
