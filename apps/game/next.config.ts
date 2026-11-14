import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The monorepo root, so the shared package and /content resolve from here.
  turbopack: { root: path.join(import.meta.dirname, '../..') },
  reactStrictMode: true,
  // Lets a production build run next to `bun run dev` without clobbering its .next (NEXT_DIST_DIR=.next-prod).
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  // Self-contained server bundle for the Docker image (apps/game/Dockerfile). Vercel ignores this.
  output: 'standalone',
  // /api/content reads ../../content at runtime: make sure it ships with the server bundle (Docker + Vercel).
  outputFileTracingRoot: path.join(import.meta.dirname, '../..'),
  outputFileTracingIncludes: { '/api/content': ['../../content/**/*'] },
};

export default nextConfig;
