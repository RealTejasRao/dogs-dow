'use client';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { Sentry.captureException(error); }, [error]);
  return <div className="wrap page-content"><h1>A brief interruption.</h1><p>We couldn’t load this page. Please try again.</p><button className="button" onClick={reset}>Try again</button></div>;
}
