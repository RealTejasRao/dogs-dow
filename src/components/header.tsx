'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { BrandLogo } from './brand-logo';

const links = [{ label: 'Expertise', href: '/#expertise' }, { label: 'How we work', href: '/#how-we-work' }, { label: 'Leadership', href: '/#leadership' }, { label: 'Join', href: '/apply' }];
export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [pastHero, setPastHero] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (pathname !== '/') return;
    const hero = document.querySelector('.cinematic-hero');
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => {
      setPastHero(entry.boundingClientRect.bottom <= 0);
    }, { threshold: 0 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, [pathname]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape' && open) { setOpen(false); menuButton.current?.focus(); } };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);
  return <header className={`header ${pathname === '/' ? `header-dark ${pastHero ? 'header-is-sticky' : ''}` : ''}`}>
    <Link className="logo-link" href="/" onClick={() => setOpen(false)} aria-label="dogs and dow home"><BrandLogo light={pathname === '/' && !pastHero} /></Link>
    <nav className="desktop-nav" aria-label="Main navigation">{links.map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined}>{link.label}</Link>)}</nav>
    <Link href="/contact" className="header-cta" onClick={() => setOpen(false)}>Work with us<ArrowUpRight size={17} aria-hidden="true" /></Link>
    <button ref={menuButton} className="menu-button" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    <nav id="mobile-nav" className={`mobile-nav ${open ? 'is-open' : ''}`} aria-label="Mobile navigation" hidden={!open}>
      {links.map(link => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}<ArrowUpRight size={22} aria-hidden="true" /></Link>)}
      <Link href="/contact" onClick={() => setOpen(false)}>Work with us<ArrowUpRight size={22} aria-hidden="true" /></Link>
    </nav>
  </header>;
}
