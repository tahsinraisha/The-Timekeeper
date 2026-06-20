/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei"],
  webpack: (config) => {
    // Needed for some drei/three internals
    config.externals = config.externals || [];
    return config;
  },
  // Silence drei peer dep warnings
  experimental: {
    esmExternals: "loose",
  },
};

module.exports = nextConfig;
