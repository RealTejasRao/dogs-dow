import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/dm-sans';
import './globals.css';
import './hero.css';
import './motion.css';
import './brand-theme.css';
import { ScrollChoreography } from '@/components/scroll-choreography';
import { Analytics } from '@vercel/analytics/next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { getContent } from '@/lib/content';
import { contactEmail, isProductionSite, siteUrl } from '@/lib/site';
import { draftMode } from 'next/headers';
import { brandName, brandDescription, homeTitle, indexingMetadata, organizationData, pageMetadata, serializeJsonLd } from '@/lib/seo';

const baseMetadata: Metadata = {
  ...pageMetadata('/', homeTitle, brandDescription),
  manifest: '/favicon/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png?v=2', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png?v=2', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  metadataBase: new URL(siteUrl),
  applicationName: brandName, creator: brandName, publisher: brandName,
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
};
export async function generateMetadata(): Promise<Metadata> {
  const preview = (await draftMode()).isEnabled;
  return { ...baseMetadata, robots: indexingMetadata(isProductionSite && !preview) };
}
export const viewport: Viewport = { themeColor: '#f0502b' };
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { settings } = await getContent();
  const preview = (await draftMode()).isEnabled;
  return <html lang="en-IN" data-scroll-behavior="smooth"><body>
    <a className="skip-link" href="#main">Skip to content</a>
    {preview && <aside className="preview-banner">Draft preview — unpublished content <a href="/api/draft/disable">Exit preview</a></aside>}
    <Header /><main id="main">{children}</main><Footer email={contactEmail(settings.contactEmail)} linkedin={settings.linkedin} /><ScrollChoreography />
    {process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' && isProductionSite && <Analytics />}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationData(settings.linkedin)) }} />
  </body></html>;
}
