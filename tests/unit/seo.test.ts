import { describe, expect, it } from 'vitest';
import { allowsIndexing, siteUrl } from '@/lib/site';
import { indexingMetadata, organizationData, pageMetadata, serializeJsonLd, websiteData } from '@/lib/seo';
import sitemap from '@/app/sitemap';

describe('search engine configuration', () => {
  it('indexes only public HTTPS production deployments', () => {
    expect(allowsIndexing('https://dogsanddow.com', 'production', 'production')).toBe(true);
    expect(allowsIndexing('https://dogsanddow.com', 'production')).toBe(true);
    expect(allowsIndexing('https://dogsanddow.com', 'production', 'preview')).toBe(false);
    expect(allowsIndexing('https://dogsanddow.com', 'development')).toBe(false);
    expect(allowsIndexing('http://dogsanddow.com', 'production')).toBe(false);
    expect(allowsIndexing('https://localhost', 'production')).toBe(false);
    expect(indexingMetadata(false)).toEqual({ index: false, follow: false });
    expect(indexingMetadata(true)).toMatchObject({ index: true, follow: true });
  });
  it('uses the same canonical identity for both brand spellings', () => {
    expect(organizationData()).toMatchObject({ name: 'dogs & dow', alternateName: 'dogs and dow', url: `${siteUrl}/` });
    expect(websiteData()).toMatchObject({ name: 'dogs & dow', alternateName: 'dogs and dow', publisher: { '@id': `${siteUrl}/#organization` } });
    expect(organizationData('https://www.linkedin.com/company/dogs-dow/').sameAs).toEqual(['https://www.linkedin.com/company/dogs-dow/']);
  });
  it('keeps structured data parseable and prevents script termination', () => {
    const value = { name: '</script><script>alert(1)</script>' };
    const serialized = serializeJsonLd(value);
    expect(serialized).not.toContain('<'); expect(JSON.parse(serialized)).toEqual(value);
  });
  it('gives supporting pages their own social titles, descriptions and canonical URLs', () => {
    const metadata = pageMetadata('/contact', 'Contact', 'Discuss a project.');
    expect(metadata.title).toEqual({ absolute: 'Contact - dogs & dow' });
    expect(metadata.alternates?.canonical).toBe('/contact');
    expect(metadata.openGraph).toMatchObject({ url: '/contact', title: 'Contact - dogs & dow', description: 'Discuss a project.' });
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image', title: 'Contact - dogs & dow' });
  });
  it('lists only the four published canonical pages without invented modification dates', () => {
    const entries = sitemap();
    expect(entries.map(entry => entry.url)).toEqual(['', '/apply', '/contact', '/privacy'].map(path => `${siteUrl}${path}`));
    expect(entries.every(entry => entry.lastModified === undefined)).toBe(true);
  });
});
