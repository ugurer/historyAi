/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3000/api',
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig 