import Link from 'next/link';
import { brandDescription, homeTitle, pageMetadata, serializeJsonLd, websiteData } from '@/lib/seo';
import { garet } from './fonts';
import Image from 'next/image';
import howWeWorkPhoto from '../../public/images/howwework2.jpg';
import getInTouchPhoto from '../../public/images/getintouch.png';
import joinPhoto from '../../public/images/joindogsanddow.png';
import './how-we-work.css';
import './leadership.css';
import './expertise.css';
import './pathways.css';
import { Eye, ScanSearch, ListChecks, Handshake, Compass, ChartNoAxesCombined, Megaphone, Plus } from 'lucide-react';
import { Arrow, ButtonLink, PersonTile } from '@/components/ui';
import { Reveal } from '@/components/reveal';
import { getContent } from '@/lib/content';
import { HeroVideo } from '@/components/hero-video';
import { ValueSection } from '@/components/value-section';
import { CollegeStrip } from '@/components/college-strip';
import { FrequentlyAskedQuestions } from '@/components/faqs';
import { cloudinaryUrl } from '@/lib/cloudinary';

export const metadata = pageMetadata('/', homeTitle, brandDescription);
const expertiseIcons = { ma: Handshake, strategy: Compass, finance: ChartNoAxesCombined, research: ScanSearch, marketing: Megaphone, other: Plus };
export default async function Home() {
  const { settings, services, people } = await getContent();
  const leaders = people.filter(person => person.leadership).sort((a, b) => Number(b.role.toLowerCase() === 'president') - Number(a.role.toLowerCase() === 'president')).slice(0, 4);
  return <div className="homepage">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteData()) }} />
    <section className="cinematic-hero" aria-labelledby="hero-title">
      <HeroVideo posterSrc={settings.heroImage ? cloudinaryUrl(settings.heroImage, 1920) : undefined} />
      <div className="cinematic-content wrap">
        <h1 id="hero-title" className="cinematic-headline">
          <span className="hero-title-line"><span className="hero-title-part hero-title-first">Student-led advisory</span></span>
          <span className="hero-title-line"><span className="hero-title-mask"><span className="hero-title-part hero-title-for">for</span></span>{' '}<span className="hero-title-mask"><span className="hero-title-part hero-title-businesses">real businesses.</span></span></span>
        </h1>
        <p className="cinematic-description">{settings.description}</p>
        <div className="cinematic-actions">
          <Link className="audience-link" href="/apply">I am a student<Arrow /></Link>
          <Link className="audience-link audience-link-company" href="/contact">I am a company<Arrow /></Link>
        </div>
      </div>
    </section>
    <CollegeStrip />
    <ValueSection>
      <div className="wrap value-inner">
        <h2 id="value-title" className={garet.className}><span className="value-heading-text">What we bring to the table</span></h2>
        <div className="value-grid">
          {[
            { Icon: Eye, title: 'Fresh perspectives, better decisions.', text: "We bring a different set of eyes to the table. Unburdened by conventional thinking, we're willing to ask difficult questions, challenge assumptions, and explore possibilities others might overlook." },
            { Icon: ScanSearch, title: 'Research that goes deeper.', text: "We don't believe in surface-level answers. Whether it's evaluating an acquisition, studying a market, or analysing a business, we dig into the numbers, question the evidence, and get to the details that matter." },
            { Icon: ListChecks, title: 'Clear answers. Real recommendations.', text: "Complex problems don't need complicated answers. We turn detailed research into clear conclusions, actionable recommendations, and a practical way forward." },
          ].map(({ Icon, title, text }) => <article key={title} className="value-point">
              <span className="value-icon"><Icon size={29} strokeWidth={1.45} aria-hidden="true" /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>)}
        </div>
      </div>
    </ValueSection>
    <section className="how-section" id="how-we-work" aria-labelledby="how-title">
      <div className="wrap how-inner">
        <Reveal><div className="how-heading"><h2 id="how-title" className={garet.className}>How we work.</h2><ButtonLink href="/contact">Connect Now</ButtonLink></div></Reveal>
        <div className="how-layout">
          <ol className="how-steps">
            {[
              ['We listen.', "We start with a conversation to understand your business, your challenges, and what you're looking to achieve. We then agree on the scope, timelines, and deliverables."],
              ['We get to work.', 'We dive into the research, analyse the numbers, and explore every relevant angle. We keep you involved and informed as the work progresses.'],
              ['We deliver clarity.', 'We bring it all together into clear findings, well-founded recommendations, and concrete next steps that help you make informed decisions with confidence.'],
            ].map(([title, text], index) => <li key={title}>
              <Reveal delay={index * .16} className="how-step"><span className="how-number" aria-hidden="true">{index + 1}.</span><div><h3>{title}</h3><p>{text}</p></div></Reveal>
            </li>)}
          </ol>
          <Reveal className="how-photo" delay={.15}><Image src={howWeWorkPhoto} alt="Three people discussing documents together" sizes="(max-width: 760px) calc(100vw - 48px), (max-width: 1280px) 40vw, 560px" placeholder="blur" /></Reveal>
        </div>
        {settings.processNote && <p className="how-note">{settings.processNote}</p>}
      </div>
    </section>
    {leaders.length > 0 && <section className="leadership-section" id="leadership" aria-labelledby="leadership-title">
      <div className="wrap leadership-inner">
        <Reveal><div className="leadership-heading"><h2 id="leadership-title" className={garet.className}>Meet the Leadership.</h2></div></Reveal>
        <div className="leadership-grid">{leaders.map((person, index) => <Reveal key={person._id} delay={index * .12} className={`leadership-profile ${person.role.toLowerCase() === 'president' ? 'leadership-president' : ''}`}><PersonTile person={person} /></Reveal>)}</div>
      </div>
    </section>}
    <section className="expertise-section" id="expertise" aria-labelledby="expertise-title">
      <div className="wrap expertise-inner">
        <Reveal><h2 id="expertise-title" className={garet.className}>Our Areas of Expertise</h2></Reveal>
        <div className="expertise-grid">{services.map((service, index) => {
          const Icon = expertiseIcons[service._id as keyof typeof expertiseIcons] ?? Compass;
          return <Reveal key={service._id} delay={(index % 2) * .22} className="expertise-item"><Link className="expertise-card" href="/contact" aria-label={`Discuss ${service.title}`}>
            <span className="expertise-card-icon"><Icon size={28} strokeWidth={1.45} aria-hidden="true" /></span>
            <div className="expertise-card-copy"><h3>{service.title}</h3><p>{service.description}</p></div>
            <Arrow className="expertise-card-arrow" />
          </Link></Reveal>;
        })}</div>
      </div>
    </section>
    <section className="pathways-section" aria-label="Connect with dogs & dow">
      <div className="wrap pathways-inner"><Reveal><div className="path-panels">
        {[
          { title: 'Get in touch.', href: '/contact', photo: getInTouchPhoto, label: 'Get in touch with dogs & dow about a company project' },
          { title: 'Join dogs & dow.', href: '/apply', photo: joinPhoto, label: 'Join dogs & dow' },
        ].map(({ title, href, photo, label }) => <Link key={href} href={href} className="path-panel" aria-label={label}>
          <Image src={photo} alt="" fill sizes="(max-width: 760px) calc(100vw - 96px), 80vw" placeholder="blur" />
          <span className="path-shade" aria-hidden="true" />
          <h2>{title}</h2><span className="path-arrow" aria-hidden="true"><Arrow /></span>
        </Link>)}
      </div></Reveal></div>
    </section>
    <FrequentlyAskedQuestions headingClassName={garet.className} />
  </div>;
}
