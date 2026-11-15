import { ChevronDown } from 'lucide-react';
import { Reveal } from './reveal';
import { ButtonLink } from './ui';
import '@/app/faqs.css';

const questions = [
  ['How much do your services cost?', "We take on both pro bono and paid projects, depending on the nature and scope of the work. We'll discuss the requirements with you and agree on everything upfront. No surprises."],
  ['What kind of companies do you work with?', "We've worked with companies ranging from multibillion-dollar businesses to early-stage startups, across different industries. Regardless of size, we bring the same level of commitment and rigour to every engagement."],
  ['How long does a typical project take?', 'Most projects take around 4–6 weeks, depending on their scope and complexity. We establish clear timelines, milestones, and deliverables before getting started.'],
  ['Who will actually work on our project?', "Each project is handled by a dedicated seven-member team: one Project Leader, two Consultants, and four Analysts. Our members come from India's leading business schools, with expertise spanning finance, consulting, strategy, technology, and law."],
  ['How do we get started?', "We begin with a call to understand your business and requirements. Based on our discussion, we prepare a detailed project brief outlining the scope, objectives, timelines, and deliverables. Once you've reviewed and approved it, we get to work."],
];

export function FrequentlyAskedQuestions({ headingClassName }: { headingClassName: string }) {
  return <section className="faq-section" id="faqs" aria-labelledby="faq-title">
    <div className="wrap faq-layout">
      <Reveal className="faq-heading"><h2 id="faq-title" className={headingClassName}>Frequently Asked Questions</h2></Reveal>
      <div className="faq-list">{questions.map(([question, answer], index) => <Reveal key={question} delay={index * .12}>
        <details className="faq-item" name="company-faq">
          <summary><h3>{question}</h3><ChevronDown size={21} strokeWidth={1.5} aria-hidden="true" /></summary>
          <div className="faq-answer"><p>{answer}</p></div>
        </details>
      </Reveal>)}</div>
      <Reveal className="faq-callout" delay={.12}><aside aria-labelledby="faq-callout-title">
        <h3 id="faq-callout-title">Have something in mind?</h3>
        <p>Big challenge or small question, we’d love to hear what you’re working on.</p>
        <ButtonLink href="/contact">Let’s talk</ButtonLink>
      </aside></Reveal>
    </div>
  </section>;
}
