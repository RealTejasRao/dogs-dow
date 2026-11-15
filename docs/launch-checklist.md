# Launch and handover

## Content approval

- [ ] Supplied black/white logos reviewed; hero video licence confirmed, desktop/mobile crop checked, play/pause and still fallback verified.
- [ ] Team members approve their names, educational background, portrait and links.
- [ ] Leadership flags and team function/order reviewed at current size and with longer future lists.
- [ ] Client logos and stories have documented permission; claims and outcomes substantiated.
- [ ] Every project narrative complete; confidential details excluded.
- [ ] Service descriptions and supervision/review statement reflect actual practice.
- [ ] Recruitment status, eligibility, application URL and process confirmed.
- [ ] Privacy contact, processing providers and actual retention workflow reviewed by the society.

## Technical release gate

For domain setup, search indexing and Google Search Console, follow [seo-launch.md](seo-launch.md).

- [ ] Typecheck, lint, unit tests and production build pass on the committed lockfile.
- [ ] Playwright Chromium, Firefox, WebKit and mobile journeys pass.
- [ ] Manually review 360px, 390px, tablet, laptop and wide desktop layouts; no overflow or clipped titles.
- [ ] Keyboard-only navigation, focus, native details, mobile menu Escape behaviour and form errors checked.
- [ ] Reduced-motion preference suppresses movement; content remains visible without animations.
- [ ] Axe scans have no serious violations; manually review reading order, contrast and alt text.
- [ ] Run mobile Lighthouse against a production preview; target LCP ≤2.5s and CLS ≤0.1. Investigate regressions, never substitute a score for usability.
- [ ] Real enquiries stored and delivered; invalid required fields rejected upstream. Keep Formshield enabled; if CAPTCHA is configured, verify invalid tokens are rejected. See [company-enquiries.md](company-enquiries.md).
- [ ] Form loading, provider failure, timeout, duplicate clicks and retry tested without losing entries.
- [ ] Published CMS changes visible after signed webhook; draft-only changes never reach a clean browser.
- [ ] Delete/unpublish project and confirm 404 after refresh; restore approved content.
- [ ] Unauthorised Cloudinary listing/upload denied; editor upload and selection successful.
- [ ] Test `/apply` before and after 15 January 2027, with recruitment enabled and disabled. Configure the separate application inbox and server-side Turnstile verification; see [recruitment.md](recruitment.md).
- [ ] Canonical URLs, social image, sitemap, robots, HTTPS and security headers verified on the real domain.
- [ ] Preview deployment protection enabled; tokens absent from browser bundles and logs.
- [ ] Dependency audit reviewed; production advisories remediated or documented before release.

## Society-owned services

Record owners and renewal/billing contacts in the society's private password manager, never this repository.

- [ ] Domain / DNS; Git repository; Vercel hosting.
- [ ] Sanity project/dataset, editor invitations, viewer token and webhook secret.
- [ ] Cloudinary API credentials and original asset rights.
- [ ] Formspree archive/notifications/quotas; Cloudflare Turnstile keys and domain restrictions.
- [ ] Real company enquiry and privacy inboxes, with named responsible members.
- [ ] Sentry project, redaction verified with a test event; analytics reviewed.
- [ ] Two administrators can access each service; departing-member access revoked.

## Editor quick start

Open `/studio` and sign in. Add or edit structured documents, save drafts, preview from Presentation, then publish only after approval. Upload/select images and fill alt text. Use order values to arrange entries. Toggle recruitment only after supplying a valid HTTPS application URL. Review the public page in a clean browser after publishing. Contact the technical owner if webhook delivery fails.

## Release record

Record the deployment URL, Git commit, reviewer, date, last passing checks, and any accepted limitations in your internal release log. Preserve the previous deployment for rollback. Recheck live enquiry delivery and the primary navigation immediately after promotion.
