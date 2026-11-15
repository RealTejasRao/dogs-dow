import { expect, test } from '@playwright/test';

test('published pages have unique metadata and canonical brand URLs', async ({ page, request }) => {
  const descriptions = new Set<string>();
  for (const [route, title] of [['/', 'dogs & dow - Student led advisory for real businesses'], ['/contact', 'Contact - dogs & dow'], ['/apply', 'Join - dogs & dow'], ['/privacy', 'Privacy notice - dogs & dow']]) {
    await page.goto(route);
    await expect(page).toHaveTitle(title);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(new URL(canonical!).href).toBe(`https://dogsanddow.com${route}`);
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description?.length).toBeGreaterThan(50); descriptions.add(description!);
    const socialUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
    expect(new URL(socialUrl!).href).toBe(`https://dogsanddow.com${route}`);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
    expect(await page.locator('meta[name="robots"]').getAttribute('content')).toContain('noindex');
  }
  expect(descriptions.size).toBe(4);
  const image = await request.get('/opengraph-image');
  expect(image.ok()).toBe(true); expect(image.headers()['content-type']).toContain('image/png');
});

test('homepage exposes both brand names in server-rendered structured data', async ({ request }) => {
  const response = await request.get('/');
  const html = await response.text();
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
  expect(blocks.find(block => block['@type'] === 'WebSite')).toMatchObject({ name: 'dogs & dow', alternateName: 'dogs and dow', url: 'https://dogsanddow.com/' });
  expect(blocks.find(block => block['@type'] === 'Organization')).toMatchObject({ name: 'dogs & dow', alternateName: 'dogs and dow' });
  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toContain('Disallow: /');
  expect(await robots.text()).toContain('Sitemap: https://dogsanddow.com/sitemap.xml');
});
