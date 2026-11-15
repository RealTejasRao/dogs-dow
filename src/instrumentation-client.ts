import * as Sentry from '@sentry/nextjs';
import { redact } from './lib/monitoring';
if (process.env.NEXT_PUBLIC_SENTRY_DSN) Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0, integrations: defaults => defaults.filter(item => item.name !== 'Breadcrumbs'),
  beforeSend(event) {
    delete event.request; delete event.user; delete event.breadcrumbs;
    return redact(event) as typeof event;
  },
});
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
