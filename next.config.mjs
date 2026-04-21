/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: [
    "@napi-rs/canvas",
    "fontkit",
    "pdf-lib",
    "pdf2json",
    "pdfjs-dist",
    "pdfreader",
  ],
};

export default nextConfig;
