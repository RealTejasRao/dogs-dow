export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://dogsanddow.com').origin;
export function allowsIndexing(url: string, nodeEnv?: string, deploymentEnv?: string) {
  const { protocol, hostname } = new URL(url);
  return protocol === 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(hostname)
    && nodeEnv === 'production' && (!deploymentEnv || deploymentEnv === 'production');
}
export const isProductionSite = allowsIndexing(siteUrl, process.env.NODE_ENV, process.env.VERCEL_ENV);
export function contactEmail(cmsEmail?: string) { return cmsEmail || process.env.NEXT_PUBLIC_CONTACT_EMAIL || undefined; }
