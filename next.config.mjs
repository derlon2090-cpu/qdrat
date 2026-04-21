/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["@napi-rs/canvas", "pdfjs-dist"],
};

export default nextConfig;
