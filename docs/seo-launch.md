# Search launch: dogsanddow.com

## Implemented

- Canonical origin: `https://dogsanddow.com`. `NEXT_PUBLIC_SITE_URL` can override it; set it to the same origin in the production deployment.
- Existing approved homepage browser title retained: `dogs & dow - Student led advisory for real businesses`.
- Distinct titles, descriptions, canonical links, Open Graph URLs and Twitter metadata for all four public pages.
- `Organization` and homepage `WebSite` JSON-LD connect **dogs & dow** with the alternate name **dogs and dow**. The organization references the society's existing public LinkedIn profile and supplied logo. No invented ratings, address, affiliations or legal status.
- Four-page sitemap at `/sitemap.xml`. No fabricated modification dates, keyword lists, doorway pages or duplicate spelling-specific pages.
- Production HTTPS deployments are indexable. Development, Vercel previews and authenticated draft previews carry `noindex, nofollow`. Local `robots.txt` disallows crawling; production allows public pages and disallows `/studio` and `/api`.
- Self-hosted fonts, optimized photography, mobile layouts, semantic headings, crawlable links and readable server-rendered content remain in place. The hero video is decorative, so no misleading video structured data or video sitemap is added.
- Brand social image at `/opengraph-image`, a legible small favicon, and Apple/Android home-screen icons.

## Domain and hosting release

1. In the society-owned Vercel project, add `dogsanddow.com` and `www.dogsanddow.com`. Set the apex domain as primary and configure **www → apex** as a permanent redirect. Use Vercel's exact DNS instructions in Cloudflare; do not guess record values or change mail records.
2. Set `NEXT_PUBLIC_SITE_URL=https://dogsanddow.com` in Vercel's **Production** environment. Redeploy after environment changes. Leave Vercel's automatic `VERCEL_ENV` intact. A production build enables indexing only when it also has a public HTTPS canonical origin.
3. Confirm valid HTTPS, HTTP → HTTPS redirects, and www → apex redirects without loops. Keep previews protected. A robots file is crawl guidance, not access control.
4. On the **actual production domain**, inspect all four pages: exactly one correct canonical, unique title/description, `index, follow`, correct `og:url`, working social image, and no localhost or preview URLs. Confirm `/robots.txt` allows `/` and advertises `https://dogsanddow.com/sitemap.xml`.
5. Verify the sitemap and every listed page return 200; removed routes should return 404. Confirm no hosting-wide `X-Robots-Tag: noindex` survives on production. Draft/editor pages must remain excluded.

## Google Search Console

1. Open [Google Search Console](https://search.google.com/search-console) using a society-owned Google account with continuity access.
2. Add a **Domain property** for `dogsanddow.com`. Copy Google's verification TXT record into Cloudflare DNS exactly as supplied, then verify. A Domain property covers HTTP/HTTPS and www/non-www.
3. Submit `https://dogsanddow.com/sitemap.xml` in **Sitemaps**.
4. Run URL Inspection on `https://dogsanddow.com/`, use **Test live URL**, confirm indexing is allowed, then **Request indexing**. Inspect `/contact` and `/apply` too. Repeated requests do not accelerate crawling.
5. If using a URL-prefix property instead of DNS verification, the optional `GOOGLE_SITE_VERIFICATION` deployment variable renders Google's HTML verification meta tag. Set only the token Google provides; no placeholder is emitted.
6. Check indexing, manual actions, security issues and Core Web Vitals after launch. Use **Performance → Search results** to track queries containing `dogs & dow`, `dogs and dow` and the domain. Allow time for discovery, crawling and processing; there is no guaranteed indexing date or first-place ranking.

## Brand signals outside the website

- Add `https://dogsanddow.com/` as the website on the existing [dogs & dow LinkedIn page](https://www.linkedin.com/company/dogs-dow/), and on society-owned social profiles.
- Use the same society name and description consistently. A natural profile introduction may mention “dogs & dow (dogs and dow)” once. Do not rename the brand to a keyword list.
- Ask approved partners to link to the real society website when they already discuss the work. Publish only substantiated projects and outcomes when those are ready. Avoid paid link schemes and bulk directory submissions.
- Do not create a Google Business Profile using a college address or fictitious office. Use only profiles for which the society genuinely qualifies.

## Verify and monitor

Local verification completed on 15 November 2026: lint and TypeScript passed; 54 unit tests passed; 28 Chromium desktop/mobile SEO, navigation, link and accessibility journeys passed; the optimized production build passed. A separate production server returned 200 for all four public pages with `index, follow` and canonical URLs on `dogsanddow.com`. Its robots file, four-page sitemap and PNG social image were verified. This does not verify the live domain or field Core Web Vitals.

- Run `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` and the Playwright SEO checks. Browser checks use the running local server and deliberately expect **noindex** there.
- Test deployed structured data with [Schema Markup Validator](https://validator.schema.org/). Google's Rich Results Test may not offer a rich result for every valid schema type; that is not itself a failure.
- Run mobile PageSpeed Insights against production, record the baseline, and investigate LCP/CLS regressions. Review Search Console field data once there is enough traffic. Do not report local development performance as production Core Web Vitals.
- Keep recruitment dates and privacy wording current. Keep brand profile links under society control. Re-run metadata and link checks after route, hostname or CMS changes.

## Google references

- [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Site names and alternate names](https://developers.google.com/search/docs/appearance/site-names)
- [Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Robots.txt limits](https://developers.google.com/search/docs/crawling-indexing/robots/intro)

Local implementation and verification do not publish the site, configure DNS, verify Search Console ownership, or submit an indexing request. Record those live actions after they have actually been completed.
