import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs/config';

const config: NextConfig = {
  poweredByHeader: false,
  images: { remotePatterns: [{ hostname: 'images.unsplash.com' }, { hostname: 'res.cloudinary.com' }] },
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Content-Security-Policy', value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self' https://formspree.io" },
      ...(process.env.NODE_ENV === 'production' ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }] : []),
    ] }, { source: '/studio/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }];
  },
};
export default process.env.NEXT_PUBLIC_SENTRY_DSN ? withSentryConfig(config, {
  org: process.env.SENTRY_ORG, project: process.env.SENTRY_PROJECT,
  silent: true, sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN }, telemetry: false,
}) : config;
