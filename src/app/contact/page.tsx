import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { garet } from '../fonts';
import { ContactForm } from '@/components/contact-form';
import { getContent } from '@/lib/content';
import { contactEmail } from '@/lib/site';
import './contact.css';

export const metadata = pageMetadata('/contact', 'Contact', 'Talk business with dogs & dow. Tell our student-led advisory team about your strategy, finance, marketing or research challenge.');

export default async function ContactPage() {
  const { settings } = await getContent();
  const email = contactEmail(settings.contactEmail);
  return <section className="company-contact" aria-labelledby="contact-title">
    <div className="wrap company-contact-layout">
      <div className="company-contact-intro">
        <h1 id="contact-title" className={garet.className}>Let’s talk business.</h1>
        <p>Tell us about your business, the challenge you’re facing, and what you’d like to achieve. We’ll explore how our team can help.</p>
        {email && <a className="contact-page-email" href={`mailto:${email}`}>{email}</a>}
        <p className="contact-student-note">Looking to join the team? <Link href="/apply">Head this way.</Link></p>
      </div>
      <div className="company-contact-form"><ContactForm email={email} /></div>
    </div>
  </section>;
}
