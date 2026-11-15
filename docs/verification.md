# Implementation verification

Verified locally on Windows with Node.js 24.11.1. Supplied leadership content is included; company enquiries are connected to Formspree. Hosting and domain launch remain separate.

## Latest release verification — 15 November 2026

- ESLint, TypeScript and the optimized production build pass.
- 54 unit/component tests and 28 Chromium desktop/mobile browser journeys pass, including SEO metadata, navigation, internal links, accessibility and reduced motion.
- The local production server returns 200 for all four public pages with correct production indexing rules, canonical URLs, robots, sitemap and social image. Development remains noindex.
- The dependency audit reports zero known vulnerabilities. Private environment files, logs and the original 155 MB video are excluded from Git; both active hero renditions are included.
- Formspree accepted and stored a labelled live connection test; notification delivery was verified. Production-domain restrictions and a post-deployment smoke test remain launch tasks. See [company-enquiries.md](company-enquiries.md).
- Live DNS, deployment, Search Console, provider quotas and field Core Web Vitals are not verified by local checks.

The following notes document earlier implementation checks; their counts and feature scope describe those earlier revisions.

## Completed checks

- TypeScript and ESLint pass.
- Next.js production build passes, including the generated social image.
- 35 unit/component tests pass: content approval filters, team growth, project rendering, recruitment states, enquiry validation, accepted/rejected form submissions, duplicate-click prevention, draft authentication and isolation, signed webhooks, asset permissions and image validation.
- 42 Playwright journeys pass across Chromium, Firefox, WebKit and mobile Chromium, with 2 intentional skips for decoder-dependent playback assertions outside Chromium. Includes navigation, real 404 status, disabled unconfigured enquiries, keyboard disclosures, mobile menu Escape/focus, reduced motion without video downloads, persistent pause/play behaviour, 360px overflow checks and Axe accessibility scans on the homepage and supporting pages.
- Firefox required an unsandboxed test invocation because its renderer crashed before loading any page inside this Windows sandbox; all Firefox journeys passed after that environment adjustment.
- Dependency installation reports zero known vulnerabilities after explicit patched transitive overrides. Preserve the lockfile; review override compatibility when upgrading Sanity or ESLint.
- Manually inspected desktop and mobile renders, including transparent homepage navigation over the daytime NYC hero. Browser-recorded files were replaced with direct FFmpeg H.264 encodes: 1080p at approximately 5 Mbps and 720p at approximately 2.5 Mbps. Both contain 1,446 frames at 23.976 fps, duration 60.310 seconds, with no audio. Reduced-motion and data-saving preferences suppress automatic video downloads; visible controls remain.
- Latest playback-quality revision: production build, lint and 10 targeted desktop/mobile browser cases pass. A local desktop sample decoded 241 frames with zero drops in 10 seconds; observed frame intervals were consistently about 41.708ms. Mobile decoded 121 frames with one drop in 5 seconds. These are local samples, not guarantees for every device or connection. Mobile hero actions and video controls remain inside the initial viewport.
- The earlier static-hero production smoke returned HTTP 200. Its mobile lab sample measured LCP 876ms and CLS 0.0034; those numbers predate the video redesign and must not be used as performance claims for the current hero. Recheck the final deployed video assets and delivery conditions. Field INP requires real traffic.

## Requires production resources

- Sanity sign-in, authenticated asset-library operations, real draft previews and remote webhook delivery must be verified against the society-owned project. Their boundary logic is tested with mocks.
- Recheck Formspree domain restrictions and quotas after deployment. If enabling optional Turnstile, configure its matching provider-side secret. Browser/component tests do not send messages.
- Review supplied leadership content and photography permissions. Client logos and project stories are not currently published; obtain approval before adding them.
- Configure society-owned hosting/domain, environment secrets, allowlists, error alerts and analytics settings. Deploy and complete the release checklist. No site has been published or domain configured by this implementation.
- Recheck mobile performance on the actual deployed domain with final assets; measure field Core Web Vitals after sufficient traffic.
