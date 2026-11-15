'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Enhance server-rendered content without hiding it before JavaScript loads. */
export function ScrollChoreography() {
  const pathname = usePathname();
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches) return;
    const elements = document.querySelectorAll<HTMLElement>([
      '.college-strip-inner', '.page-content > .page-heading',
      '.page-content .project-grid > .project', '.join-details > section',
      '.join-benefits', '.join-list', '.case-body > section',
      '.case-cta', '.company-contact-intro', '.footer-colophon',
    ].join(','));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.setAttribute('data-scroll-entered', 'true');
        observer.unobserve(entry.target);
      });
    }, { threshold: .1 });
    elements.forEach(element => observer.observe(element));
    const stop = () => {
      observer.disconnect();
      elements.forEach(element => element.removeAttribute('data-scroll-entered'));
    };
    preference.addEventListener('change', stop);
    return () => { stop(); preference.removeEventListener('change', stop); };
  }, [pathname]);
  return null;
}
