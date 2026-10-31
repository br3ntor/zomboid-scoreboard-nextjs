/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Pin the safe state of the Image Optimization API explicitly: SVG input is
    // refused and no remote origin may be optimized. Turning either of these on
    // re-opens the RCE class fixed in next 15.5.28 / sharp 0.35.5 (the optimizer
    // is reachable from the public internet at /_next/image).
    dangerouslyAllowSVG: false,
    remotePatterns: [],
  },
};

export default nextConfig;
