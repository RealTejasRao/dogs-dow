import Link from 'next/link';
import { Arrow } from './ui';
import { BrandLogo } from './brand-logo';
import { Reveal } from './reveal';
import './footer.css';

export function Footer({ email, linkedin }: { email?: string; linkedin?: string }) {
  return <footer className="site-footer">
    <div className="footer-base"><div className="wrap">
      <Reveal><div className="footer-directory">
        <div className="footer-identity">
          <Link href="/" className="footer-brand" aria-label="dogs and dow home"><BrandLogo light /></Link>
          <p>dogs & dow brings student-led advisory<br />to real businesses.</p>
        </div>
        <nav className="footer-nav" aria-label="Footer navigation">
          <div><span>Explore</span><Link href="/#expertise">Our expertise</Link><Link href="/#how-we-work">How we work</Link><Link href="/#leadership">Leadership</Link></div>
          <div><span>Take the next step</span><Link href="/contact">Work with us<Arrow /></Link><Link href="/apply">Join dogs & dow<Arrow /></Link>{email && <a href={`mailto:${email}`}>Email us<Arrow /></a>}{linkedin && <a href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn<Arrow /></a>}</div>
        </nav>
      </div></Reveal>
      <div className="footer-colophon"><span>© {new Date().getFullYear()} dogs & dow</span><span>Independent. India-based. Across campuses.</span><Link href="/privacy">Privacy notice</Link></div>
    </div></div>
  </footer>;
}
