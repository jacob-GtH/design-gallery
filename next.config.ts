// next.config.js
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["cdn.sanity.io", "res.cloudinary.com", "images.unsplash.com"], // أضف مجالات الصور الخاصة بك
  },
};
export default nextConfig;

