// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  typedRoutes: true,
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  // eslint: {
  //   ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  // },
  // Turbopack configuration for development with --turbo flag
  turbopack: {
    // Turbopack handles Node.js polyfills differently than webpack
    // For browser bundles, these modules are automatically excluded
    resolveAlias: {},
  },
  // Server-side packages that should not be bundled
  serverExternalPackages: ["pino-pretty", "lokijs", "encoding"],
  webpack: config => {
    // Webpack config for production builds (or when not using --turbo flag)
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

module.exports = nextConfig;
