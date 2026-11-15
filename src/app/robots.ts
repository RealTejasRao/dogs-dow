import type { MetadataRoute } from 'next';
import { isProductionSite, siteUrl } from '@/lib/site';
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: '*', allow: isProductionSite ? '/' : undefined, disallow: isProductionSite ? ['/studio', '/api'] : '/' }, sitemap: `${siteUrl}/sitemap.xml` }; }
