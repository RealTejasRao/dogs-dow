'use client';
import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';

export function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  const [entered, setEntered] = useState(false);
  return <motion.div className={`scroll-reveal ${className}`} data-revealed={entered || undefined} initial={false}
    onViewportEnter={() => setEntered(true)}
    whileInView={reduced ? undefined : { y: [36, 0] }}
    viewport={{ once: true, amount: 0.12 }} transition={{ duration: 1.8, delay, ease: [0.22, 0.45, 0.2, 1] }}>{children}</motion.div>;
}
