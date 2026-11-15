'use client';
import Link from 'next/link';
import { track } from '@vercel/analytics';
import type { ComponentProps } from 'react';

export function trackEvent(name: string, properties?: Record<string, string>) {
  if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true') track(name, properties);
}
export function TrackedLink({ event, properties, ...props }: ComponentProps<typeof Link> & { event: string; properties?: Record<string, string> }) {
  return <Link {...props} onClick={() => trackEvent(event, properties)} />;
}
