import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';
export default function sitemap(): MetadataRoute.Sitemap { return ['', '/apply', '/contact', '/privacy'].map(path => ({ url: `${siteUrl}${path}` })); }
