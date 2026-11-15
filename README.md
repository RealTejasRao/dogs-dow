# dogs & dow

Student-led advisory for real businesses. An independent, India-based collective bringing together students across colleges.

Production website for **https://dogsanddow.com**, built with Next.js App Router, TypeScript, Tailwind CSS, Motion, optional Sanity/Cloudinary integrations, and Formspree company enquiries.

## Run locally

Requires Node.js 22.12+; Node 24 is used in CI.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000. Do not overwrite an existing `.env.local` when updating an established checkout. Environment files, dependencies, build output and test reports are excluded from Git.

## Pages

- `/`: video hero, college logos, value propositions, process, leadership, expertise, company/student links, FAQs and footer.
- `/contact`: company enquiry form, with accessible validation and provider-confirmed success.
- `/apply`: recruitment announcement and countdown to 15 January 2027 (estimated date), with no application form displayed.
- `/privacy`: privacy notice.
- `/studio`: optional authenticated Sanity editorial interface.

The design uses white surfaces, dark typography and the society orange `#f0502b`. Public content uses supplied photography and leadership details. College logos describe members' educational backgrounds, not institutional endorsements.

## Company enquiries

Set `NEXT_PUBLIC_FORMSPREE_ID=xeagewbz` in your hosting environment before building. The notification recipient is configured privately in Formspree; never publish that address as an environment variable intended for display. Without a form ID, submission stays disabled.

Provider-side validation, Formshield and a honeypot are configured. Turnstile is optional and requires matching provider configuration. See [company-enquiries.md](docs/company-enquiries.md) for delivery setup and live verification. Automated tests must never send real enquiries.

## Media

The hero uses `public/videos/hero-day-hd.mp4` and `hero-day-mobile.mp4`, directly encoded H.264 video with no audio and progressive-playback metadata. Both production renditions are committed. The 155 MB original `vid2.mp4` and superseded experiments remain local and are excluded from Git; they are not required to build or run the site.

To regenerate the videos, restore the original at `public/videos/vid2.mp4` and run `python scripts/encode-hero.py --ffmpeg PATH_TO_FFMPEG`. The poster is `public/images/hero-day-poster.jpg`. Playback respects reduced motion, data saving, offscreen visibility and the visitor's pause choice. Confirm the footage licence before public launch.

The Garet font licence is included alongside the font. DM Sans is supplied through its font package.

## Optional editorial integrations

Copy the relevant settings from `.env.example` for Sanity and Cloudinary. Use society-owned accounts and least-privilege server-only credentials. The site works with its supplied content when Sanity is unconfigured. Studio previews require authentication; publishing webhooks require a signature. Cloudinary upload signing remains server-side. Never place confidential project or enquiry data in a public CMS dataset.

Future recruitment submission infrastructure is retained but is not displayed or enabled by the countdown. See [recruitment.md](docs/recruitment.md) before enabling it.

## Checks

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
npx playwright install chromium firefox webkit
npm run test:e2e
npm audit --audit-level=high
```

CI installs from the committed lockfile and runs the checks. End-to-end tests use a local development server, expect development pages to be noindex, and mock provider submissions. Run them without live CMS integration variables. Review [verification.md](docs/verification.md) for verification scope and limitations.

## Deploy

Import this repository into Vercel, choose Next.js and Node 24, and set production environment variables before building:

- `NEXT_PUBLIC_SITE_URL=https://dogsanddow.com`
- `NEXT_PUBLIC_FORMSPREE_ID=xeagewbz`
- Optional CMS, image, monitoring and verification settings from `.env.example`.

Attach the apex and www domains, use the hosting provider's exact Cloudflare DNS instructions, and redirect www to the apex. Configure Search Console ownership and submit the sitemap. Follow [seo-launch.md](docs/seo-launch.md) and [launch-checklist.md](docs/launch-checklist.md) for the release steps.

Production public pages allow indexing; local development, Vercel previews and authenticated drafts do not. Secrets must stay in hosting configuration. GitHub pushes do not by themselves provision hosting, configure DNS or submit the site to Google. Rankings are not guaranteed.

For rollback, promote a previous successful Vercel deployment. Restore CMS revisions separately if content also changed. Maintain at least two society administrators for the repository and production services.
