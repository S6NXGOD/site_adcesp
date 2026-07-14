/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  experimental: {
    serverActions: {
      // Suporta o envio dos 4 anexos da filiação (até 5 MB cada).
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
