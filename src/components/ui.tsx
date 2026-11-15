import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { cloudinaryUrl } from '@/lib/cloudinary';
import type { CloudImage, Person } from '@/lib/models';

export function Arrow({ diagonal = true, className = '' }: { diagonal?: boolean; className?: string }) {
  const Icon = diagonal ? ArrowUpRight : ArrowDownRight;
  return <Icon size={19} strokeWidth={1.5} className={className} aria-hidden="true" />;
}
export function ButtonLink({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  return <Link className={`button ${light ? 'button-light' : ''}`} href={href}>{children}<Arrow /></Link>;
}
export function Eyebrow({ children, number }: { children: React.ReactNode; number?: string }) {
  return <div className="eyebrow">{number && <span className="section-number">{number}</span>}<span>{children}</span></div>;
}
export function CloudinaryImage({ image, className = '', priority = false, aspectRatio }: { image: CloudImage; className?: string; priority?: boolean; aspectRatio?: number }) {
  const source = cloudinaryUrl(image, 1600, aspectRatio);
  if (!source) return <div className={`image-unavailable ${className}`} aria-label={image.alt} role="img" />;
  // Cloudinary alone performs optimisation. Responsive sources avoid Next's second transform.
  return <picture><source srcSet={[400, 800, 1200, 1600].map(w => `${cloudinaryUrl(image, w, aspectRatio)} ${w}w`).join(', ')} sizes="(max-width: 700px) 100vw, 50vw" /><Image unoptimized src={source} alt={image.alt} width={image.width} height={aspectRatio ? Math.round(image.width / aspectRatio) : image.height}
    className={className} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'}
    sizes="(max-width: 700px) 100vw, 50vw"
    /></picture>;
}
export function PersonTile({ person }: { person: Person }) {
  return <article className="person">
    {person.image ? <CloudinaryImage image={person.image} className="portrait" aspectRatio={4/5} /> : person.localImage ? <Image src={person.localImage} alt={person.name} className="portrait" width={600} height={750} sizes="(max-width: 760px) 80vw, 35vw" /> : <div className="portrait portrait-initials" aria-hidden="true">{person.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</div>}
    <div className="person-title"><h3>{person.name}</h3>{person.linkedin && <a className="person-linkedin" href={person.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${person.name} on LinkedIn (opens in new tab)`}><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="3" fill="#0A66C2" /><path fill="#fff" d="M6.5 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM5.2 9.5h2.6V19H5.2V9.5Zm4.8 0h2.5v1.3h.04c.35-.67 1.2-1.58 2.66-1.58 2.84 0 3.37 1.87 3.37 4.3V19h-2.6v-4.86c0-1.16-.02-2.66-1.62-2.66-1.63 0-1.88 1.27-1.88 2.58V19H10V9.5Z" /></svg></a>}</div>
    <p>{person.role}</p>{person.institution && <p className="person-institution">{person.institution}</p>}
  </article>;
}
