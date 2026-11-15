import type { Metadata } from 'next';
import { isProductionSite, siteUrl } from './site';

export const brandName = 'dogs & dow';
export const alternateBrandName = 'dogs and dow';
export const homeTitle = 'dogs & dow - Student led advisory for real businesses';
export const brandDescription = 'dogs & dow (dogs and dow) is an independent, India-based student-led advisory collective helping businesses with strategy, M&A, finance and market research.';

export function indexingMetadata(indexable = isProductionSite): Metadata['robots'] {
  return indexable
    ? { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } }
    : { index: false, follow: false };
}

export function pageMetadata(path: string, title: string, description: string): Metadata {
  const fullTitle = path === '/' ? title : `${title} - ${brandName}`;
  const image = { url: '/opengraph-image', width: 1200, height: 630, alt: 'dogs & dow - Student-led advisory for real businesses' };
  return {
    title: { absolute: fullTitle }, description,
    alternates: { canonical: path },
    openGraph: { type: 'website', locale: 'en_IN', siteName: brandName, url: path, title: fullTitle, description, images: [image] },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [image] },
  };
}

export function organizationData(linkedin?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization', '@id': `${siteUrl}/#organization`,
    name: brandName, alternateName: alternateBrandName, url: `${siteUrl}/`,
    description: 'Independent, India-based student-led advisory for real businesses, bringing together undergraduate and postgraduate students across colleges.',
    logo: { '@type': 'ImageObject', url: `${siteUrl}/images/logo_black.png`, width: 2000, height: 2000 },
    ...(linkedin ? { sameAs: [linkedin] } : {}),
  };
}

export function websiteData() {
  return {
    '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${siteUrl}/#website`,
    name: brandName, alternateName: alternateBrandName, url: `${siteUrl}/`,
    inLanguage: 'en-IN', publisher: { '@id': `${siteUrl}/#organization` },
  };
}

export function serializeJsonLd(data: unknown) { return JSON.stringify(data).replace(/</g, '\\u003c'); }
