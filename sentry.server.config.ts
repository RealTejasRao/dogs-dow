import * as Sentry from '@sentry/nextjs';
import { redact } from './src/lib/monitoring';
Sentry.init({ dsn: process.env.NEXT_PUBLIC_SENTRY_DSN, tracesSampleRate: 0,
  beforeSend(event) { delete event.request; delete event.user; delete event.breadcrumbs; return redact(event) as typeof event; },
});
