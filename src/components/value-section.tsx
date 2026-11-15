'use client';

import { useEffect, useRef } from 'react';

export function ValueSection({ children }: { children: React.ReactNode }) {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches) return;

    element.classList.add('value-motion-ready');
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    }, { threshold: .12 });
    observer.observe(element);
    const points = element.querySelectorAll('.value-point');
    points.forEach(point => observer.observe(point));

    return () => {
      observer.disconnect();
      element.classList.remove('value-motion-ready', 'is-revealed');
      points.forEach(point => point.classList.remove('is-revealed'));
    };
  }, []);

  return <section ref={section} className="value-section" aria-labelledby="value-title">{children}</section>;
}
