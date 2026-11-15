# dogs & dow

Editorial advisory website built with Next.js App Router, TypeScript, Tailwind, Motion, Sanity, and Cloudinary. The repository deliberately contains no invented member identities, client endorsements, or project outcomes.

## Run locally

Requires Node.js 22.12+ (Node 24 LTS recommended).

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000. Without credentials, the full site runs with the supplied skyline video, confirmed service categories, honest empty directories, closed recruitment, and a disabled enquiry form. No messages are sent in this mode.

### Hero media and logos

The interface uses a minimal charcoal, white and neutral-grey palette. The homepage navigation overlays the video with a transparent background, at 56px high on desktop and 44px on mobile. Hero copy, calls to action and the video control fit within the initial viewport, including short laptop screens.

The homepage uses the daytime NYC footage supplied as `public/videos/vid2.mp4`. Its production renditions are encoded directly with FFmpeg: `hero-day-hd.mp4` (1920×1080, approximately 36 MiB, 5 Mbps peak) and `hero-day-mobile.mp4` (1280×720, approximately 18 MiB, 2.5 Mbps peak). Both preserve all 1,446 source frames at 24000/1001 fps, last 60.310 seconds, have audio removed, and place MP4 metadata at the start for progressive playback. The old canvas-recorded WebM/MP4 files are no longer referenced by the website.

The original 4K source is retained and is not downloaded by the hero. The clip loops silently and plays inline. Playback stops offscreen or in a hidden tab, respects the visitor's pause choice, and does not download the clip automatically when reduced motion or data saving is enabled. A visible play/pause control remains available. The mobile rendition is selected once at initial playback on viewports at or below 760px; resizing does not restart the video.

`public/images/hero-day-poster.jpg` is a still extracted directly from the source, used while playback loads, when autoplay is blocked, or when motion is disabled. The optional Sanity hero image overrides this still only. To regenerate media, install a full FFmpeg binary and run `python scripts/encode-hero.py --ffmpeg PATH_TO_FFMPEG`. Alternatively, run `python -m pip install --target .tools/python imageio-ffmpeg` and then `python scripts/encode-hero.py`; `.tools/` is ignored. No browser or development server is needed. Only the pre-encoded assets are used in production. Re-run performance checks when changing media; earlier static-hero measurements do not describe video-transfer costs.

The supplied black and white logo PNGs are used as-is, with an SVG viewBox excluding transparent padding. The homepage masthead uses white artwork; light pages, the footer and the collective section use black artwork.

```powershell
npm run typecheck
npm run lint
npm run test
npm run build
npx playwright install chromium firefox webkit
npm run test:e2e
```

The end-to-end suite assumes an unconfigured local environment. Use a separate clean checkout or remove integration variables for that suite. Tests never send real enquiries.

## Connect editorial content

1. Create a society-owned Sanity project with a **public** `production` dataset. Public content must be safe to publish; do not store enquiry details, personal applications, internal notes or client confidential files here. Drafts remain authenticated.
2. Add the project ID and dataset from `.env.example`. Add localhost and the production domain as exact allowed CORS origins with credentials in Sanity project settings. Avoid wildcard origins.
3. Create a least-privilege viewer token for `SANITY_API_READ_TOKEN`. This stays on the server. Invite at least two society administrators, and give content editors only the roles they need.
4. Open `/studio`, sign in, and create Site settings and Recruitment. Add services, people, client logos, and project stories. Display order is numerical; team function determines grouping. Leadership is featured on the homepage (first four in order).
5. Add an optional hero poster still, contact email, privacy contact, approved operating/review practices, and an accurate enquiry retention statement to Site settings. Add only confirmed recruitment expectations and selection steps.
6. Projects need every narrative field, a valid slug, at least one deliverable, and public-use approval. Client logos need an approved image. Incomplete/unapproved content is filtered from public lists and project routes. Names of institutions describe member backgrounds, not endorsements.

### Draft preview

In Studio, open **Presentation**. Sanity generates a temporary preview secret, which `/api/draft/enable` validates using the server-only read token before enabling Next.js Draft Mode. The destination is restricted to this site's non-API pages. The preview banner provides an exit link. CMS reads in preview use authenticated, uncached `drafts`; ordinary requests explicitly use `published` without an auth token. Never share your browser's draft cookie.

Preview is a live page preview: reload the page after draft edits to see the latest state. Inline click-to-edit overlays are not enabled. Production and Studio use the same origin so the default frame-ancestor restriction allows this workflow.

### Publishing webhook

Create a Sanity GROQ-powered webhook pointing to `https://YOUR-DOMAIN/api/revalidate`:

- Methods: POST; triggers: create, update, delete.
- Filter: `_type in ["siteSettings", "service", "person", "client", "project", "recruitment"] && !(_id in path("drafts.**"))`.
- Projection: `{_type}`.
- Secret: a long random value, also stored as `SANITY_REVALIDATE_SECRET` in Vercel.
- Enable the webhook and verify successful deliveries in Sanity.

The endpoint verifies the raw-body Sanity signature before immediately expiring the shared content cache. The next page request fetches the new published data. A one-hour TTL is a recovery path if a delivery fails. Deleting/unpublishing a project removes it from both its index and detail route after invalidation. CMS outages fall back to the factual, unconfigured site and are reported to Sentry if enabled.

## Cloudinary

Use a society-owned account. Set cloud name, API key and API secret. Never enable unsigned uploads for this app. `/studio` image fields provide upload and selection from `dogs-and-dow/`, with a paginated library for growing teams. You can also paste an existing public ID and metadata from the Cloudinary console.

Asset API requests require a Sanity bearer session and membership of this project with administrator, editor or developer role. Custom Sanity roles are denied by default; extend the explicit allowlist only after reviewing their permissions. Uploads check origin, size (4 MB), supported MIME type and file signature before using server-held credentials. Only JPEG, PNG and WebP are accepted. Crop metadata selects auto, centre or face gravity. Images use Cloudinary responsive transformation URLs and bypass Next's image optimiser.

Upload original photography and approved client logos. Enter meaningful alt text and dimensions before publishing. Add profile photos only with the member's permission. The hero uses the supplied stock video; confirm its licence before public launch.

## Open company enquiries

1. Create a society-owned Formspree form. Set `NEXT_PUBLIC_FORMSPREE_ID` to its ID.
2. Configure the recipient inbox, submission archive capacity/retention, notification workflow, and provider-side validation. Required fields: name, email, company, service, brief and privacy acknowledgement; brief length 20–5000. Optional website must be HTTPS. Do not reject personal email addresses.
3. Create a Cloudflare Turnstile widget limited to the real domain (and localhost only for testing), set its public site key locally, and configure its secret **in Formspree**, not in public environment variables. Enable CAPTCHA in Formspree. Client-side checks alone do not protect a public form endpoint.
4. Enable Formspree spam filtering and the `_gotcha` honeypot. Set notification recipients to authorised members only. Keep archive access restricted. Set your plan's submission-limit alerts so the form cannot silently exceed quota.
5. Configure a real fallback email in Site settings or `NEXT_PUBLIC_CONTACT_EMAIL`, and the privacy contact and retention statement. Configure an appropriate retention period in the provider and schedule a regular archive review.
6. Verify a legitimate submission is stored **and** its email arrives. Confirm direct invalid submissions and invalid/expired Turnstile tokens are rejected by Formspree. Confirm errors do not erase entered text. Then remove test submissions.

The client sends directly to Formspree. It reports success only for an accepted response. A 20-second timeout is ambiguous (the provider might have accepted it); the UI says it could not confirm receipt and preserves details. Do not automatically retry such requests. No attachments are accepted. There is no custom application database or enquiry backend.

## Deploy to Vercel

1. Push to a society-owned Git repository and import it into Vercel. Select Next.js and use the committed lockfile with `npm ci`; build with `npm run build`. Select a supported Node LTS version.
2. Set the environment variables in Vercel. Keep tokens and secrets server-only. Use separate preview content/form resources when testing integrations. Never point automated tests at a live recipient inbox.
3. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS canonical domain (no trailing slash), attach the domain and follow Vercel's exact DNS instructions. Set one canonical hostname and redirect the alternative at the hosting layer.
4. Preview deployments must remain private using Vercel deployment protection. They carry `noindex` when `VERCEL_ENV=preview`; public localhost defaults are also noindex. Do not treat noindex as access control.
5. Configure all service allowlists, URLs and the signed webhook for the real domain. Verify headers, metadata, social image, sitemap, robots, 404 responses, CMS publishing, enquiries, and recruitment links.
6. Promote the approved deployment only after completing `docs/launch-checklist.md`.

The source is prepared for Vercel; no account, domain, paid service, or deployment is provisioned automatically. Cloud hosting remains blocked until society credentials and production content are supplied. A manual deployment is not required when Git integration is connected.

## Monitoring and operations

- Enable Sentry with the DSN and optional organisation/project/auth token for private source maps. Request bodies, users, breadcrumbs, sensitive object keys, email addresses and URL query strings are removed from error events. Session replay and performance tracing are disabled. Never add form values to exception messages or logs.
- Set `NEXT_PUBLIC_ENABLE_ANALYTICS=true` only on production. The script is additionally gated by the canonical URL and Vercel environment. Events: `enquiry_success`, `application_click`, `project_engagement` (project slug only). Review providers and the privacy notice before enabling analytics.
- Configure error alerts in Sentry and uptime monitoring for the canonical homepage. Review Formspree quota/delivery failures and Sanity webhook failures regularly. Monitor real-user Core Web Vitals after sufficient traffic; lab results are not a guarantee of field INP.
- Roll back through Vercel's deployment history by promoting the previous working deployment. CMS content changes require restoring a Sanity revision separately; rolling back code does not roll back content. Revalidate after restoring content.
- Maintain two society admins, rotate credentials during leadership handover, remove departing editors, retain repository access, and export/backup content according to provider capabilities and your retention policy.

See `docs/launch-checklist.md` for the release gate and content handover.
# dogs-dow
