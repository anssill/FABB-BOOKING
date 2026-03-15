// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options',    value: 'nosniff' },
        { key: 'Referrer-Policy',           value: 'origin-when-cross-origin' },
      ],
    }]
  },
}
module.exports = nextConfig
