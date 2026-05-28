/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Permite conexiones desde tu red local para evitar el bloqueo HMR
  allowedDevOrigins: ['192.168.64.1', 'localhost'],
}

export default nextConfig;