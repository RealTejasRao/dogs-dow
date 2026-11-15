'use client';
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { Sentry.captureException(error); }, [error]);
  return <html lang="en-IN"><body><h1>A brief interruption.</h1><p>Please try loading this page again.</p><button onClick={reset}>Try again</button></body></html>;
}
