import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('homepage has one clear heading and no horizontal overflow', async ({ page }) => {
  await page.goto('/'); await expect(page.getByRole('heading', { level: 1 })).toHaveText('Student-led advisoryfor real businesses.');
  await expect(page.getByRole('link', { name: 'I am a student', exact: true })).toHaveAttribute('href', '/apply');
  await expect(page.getByRole('link', { name: 'I am a company', exact: true })).toHaveAttribute('href', '/contact');
  await expect(page.locator('form.contact-form')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze(); expect(results.violations).toEqual([]);
});
test('navigation works on desktop and mobile', async ({ page, isMobile }) => {
  await page.goto('/'); if (isMobile) { await page.getByRole('button', { name: 'Open menu' }).click(); await page.locator('#mobile-nav').getByRole('link', { name: 'Join', exact: true }).click(); } else { await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'Join', exact: true }).click(); }
  await expect(page).toHaveURL('/apply'); await expect(page.getByRole('heading', { level: 1 })).toHaveText('Recruitment begins next semester.');
});
test('removed pages return the custom 404', async ({ page }) => { for (const route of ['/join', '/team', '/work', '/work/not-a-published-project']) { const response = await page.goto(route); expect(response?.status()).toBe(404); await expect(page.getByRole('link', { name: 'Back to dogs & dow' })).toHaveAttribute('href', '/'); } });

test('student applications show a live countdown and cannot submit before recruitment opens', async ({ page, request }) => {
  await page.goto('/apply');
  await expect(page.getByRole('heading', { name: 'Recruitment begins next semester.' })).toBeVisible();
  await expect(page.locator('time')).toHaveAttribute('datetime', '2027-01-15T00:00:00+05:30');
  await expect(page.locator('.countdown-number').first()).not.toHaveText('––');
  await expect(page.locator('form')).toHaveCount(0); await expect(page.getByText('This is a rough estimate. The date may vary.')).toBeVisible();
  expect((await request.post('/api/apply', { data: { name: 'Early applicant' } })).status()).toBe(403);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('company enquiry availability matches provider configuration', async ({ page }) => { await page.goto('/contact'); if (await page.locator('form.contact-form').getAttribute('action')) { await expect(page.getByRole('button', { name: 'Let’s talk business' })).toBeEnabled(); } else { await expect(page.getByRole('button', { name: 'Let’s talk business' })).toBeDisabled(); } await expect(page.getByText('Online enquiries are not open yet.', { exact: false })).toHaveCount(0); await expect(page.getByText('Big questions welcome. A clear brief is a great start.')).toHaveCount(0); });
test('editorial and draft access fail closed before setup', async ({ request }) => { expect((await request.get('/api/draft/enable')).status()).toBe(503); expect((await request.get('/api/cloudinary/assets')).status()).toBe(401); expect((await request.post('/api/revalidate', { data: {} })).status()).toBe(503); });
test('expertise enquiries work from the keyboard', async ({ page }) => { await page.goto('/#expertise'); const link = page.getByRole('link', { name: 'Discuss Mergers & Acquisitions', exact: true }); await link.focus(); await page.keyboard.press('Enter'); await expect(page).toHaveURL('/contact'); await expect(page.getByRole('heading', { level: 1 })).toHaveText('Let’s talk business.'); await expect(page.locator('form.contact-form')).toBeVisible(); });
test('reduced motion and narrow screens keep content accessible', async ({ page }) => { await page.setViewportSize({ width: 360, height: 800 }); await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/'); expect(await page.locator('h1').evaluate(element => getComputedStyle(element).animationName)).toBe('none'); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await page.getByRole('button', { name: 'Open menu' }).click(); await page.keyboard.press('Escape'); await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused(); await expect(page.locator('#mobile-nav')).toBeHidden(); });
test('supporting pages meet automated accessibility checks', async ({ page }) => { for (const route of ['/apply', '/contact', '/privacy']) { await page.goto(route); const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze(); expect(results.violations, route).toEqual([]); } });

test('every internal link targets a published page or existing section', async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const routes = ['/', '/apply', '/contact', '/privacy'];
  const pages = new Map<string, { links: string[]; ids: string[] }>();
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    pages.set(route, await page.evaluate(() => ({ links: Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'), a => a.href), ids: Array.from(document.querySelectorAll('[id]'), e => e.id) })));
  }
  const origin = new URL(page.url()).origin;
  for (const [source, content] of pages) for (const href of content.links) {
    const target = new URL(href);
    if (target.origin !== origin) continue;
    expect(routes, `${source} → ${href}`).toContain(target.pathname);
    if (target.hash) expect(pages.get(target.pathname)?.ids, `${source} → ${href}`).toContain(decodeURIComponent(target.hash.slice(1)));
  }
  const xml = await (await request.get('/sitemap.xml')).text();
  const sitemapPaths = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g), match => new URL(match[1]).pathname);
  expect(sitemapPaths.sort()).toEqual([...routes].sort());
});
test('reduced motion shows the still without downloading the background video', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const videoRequests: string[] = [];
  page.on('request', request => { if (/\/videos\/.*\.(mp4|webm)/.test(request.url())) videoRequests.push(request.url()); });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Play background video' })).toBeVisible();
  await expect(page.locator('.hero-poster')).toBeVisible();
  expect(await page.locator('video').getAttribute('src')).toBeNull();
  expect(videoRequests).toEqual([]);
});
test('background video can be paused and stays paused after scrolling away', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Playback is verified with the bundled Chromium video decoder.');
  await page.goto('/');
  await page.getByRole('button', { name: 'Pause background video' }).click();
  await expect(page.getByRole('button', { name: 'Play background video' })).toBeVisible();
  await page.locator('#expertise').scrollIntoViewIfNeeded();
  await page.locator('.cinematic-hero').scrollIntoViewIfNeeded();
  expect(await page.locator('video').evaluate((video: HTMLVideoElement) => video.paused)).toBe(true);
  await page.getByRole('button', { name: 'Play background video' }).click();
  await expect(page.getByRole('button', { name: 'Pause background video' })).toBeVisible();
});
