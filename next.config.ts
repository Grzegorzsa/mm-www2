import { withSentryConfig } from '@sentry/nextjs'
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const _require = createRequire(import.meta.url)
const { version: appVersion } = _require('./package.json') as { version: string }

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['mxbeats.com'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  images: {
    localPatterns: [
      { pathname: '/api/media/file/**' },
      { pathname: '/images/**' },
      { pathname: '/*.png' },
      { pathname: '/*.jpg' },
      { pathname: '/*.svg' },
      { pathname: '/*.webp' },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withSentryConfig(withPayload(nextConfig, { devBundleServerPackages: false }), {
  org: 'gssoftpl',
  project: 'mxbeats-www',
  authToken: process.env.SENTRY_AUTH_TOKEN,
  release: { name: appVersion },
  // Upload source maps on every production build
  sourcemaps: {
    disable: false,
    deleteSourcemapsAfterUpload: true,
  },
  // Suppress build-time output
  silent: true,
  // Disable Sentry build-time telemetry
  telemetry: false,
})
