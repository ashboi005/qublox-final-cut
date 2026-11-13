import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The monorepo root, so the shared package and /content resolve from here.
  turbopack: { root: path.join(import.meta.dirname, '../..') },
  reactStrictMode: true,
};

export default nextConfig;
