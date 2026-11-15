'use client';

import Link from 'next/link';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { studentApplicationSchema } from '@/lib/models';
import { recruitmentIsOpen } from '@/lib/recruitment';
import { trackEvent } from './tracked-link';

class ApplicationError extends Error {}

export function StudentApplicationForm({ enabled, configured }: { enabled: boolean; configured: boolean }) {
  const [now, setNow] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'error' | 'success'>('idle');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const captcha = useRef<HTMLDivElement>(null);
  const widget = useRef<string | undefined>(undefined);
  const busy = useRef(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const open = now !== null && recruitmentIsOpen(enabled, now);
  const available = open && configured;
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!available || !ready || !captcha.current || !siteKey || !window.turnstile) return;
    const api = window.turnstile;
    widget.current = api.render(captcha.current, { sitekey: siteKey, theme: 'light', callback: (value: string) => setToken(value), 'expired-callback': () => setToken(''), 'error-callback': () => { setToken(''); setMessage('The security check could not load. Please reload and try again.'); } });
    return () => { if (widget.current) api.remove(widget.current); };
  }, [available, ready, siteKey]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!available || busy.current) return;
    const data = new FormData(event.currentTarget);
    const payload = { ...Object.fromEntries(data), privacy: data.get('privacy') === 'on' };
    const parsed = studentApplicationSchema.safeParse(payload);
    if (!parsed.success) {
      const fields = Object.fromEntries(parsed.error.issues.map(issue => [String(issue.path[0]), issue.message]));
      setErrors(fields); setStatus('error'); setMessage('Please check the highlighted fields.');
      const first = event.currentTarget.elements.namedItem(Object.keys(fields)[0]);
      if (first instanceof HTMLElement) first.focus();
      return;
    }
    setErrors({});
    if (!token) { setStatus('error'); setMessage('Please complete the security check.'); return; }
    busy.current = true; setStatus('pending'); setMessage('');
    try {
      const response = await fetch('/api/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, token }), signal: AbortSignal.timeout(30000) });
      const result = await response.json();
      if (!response.ok || result.ok !== true) {
        if (result.fields) setErrors(result.fields);
        throw new ApplicationError(typeof result.error === 'string' ? result.error : 'We couldn’t confirm your application. Please try again.');
      }
      setStatus('success');
      trackEvent('student_application_success');
    } catch (error) {
      setStatus('error'); setMessage(error instanceof ApplicationError ? error.message : 'We couldn’t confirm your application. Your answers are still here. Please try again.');
      if (widget.current) window.turnstile?.reset(widget.current);
      setToken('');
    } finally { busy.current = false; }
  }
  const field = (name: string) => ({ 'aria-invalid': Boolean(errors[name]), 'aria-describedby': errors[name] ? `application-${name}-error` : undefined });
  const error = (name: string) => errors[name] && <span id={`application-${name}-error`} className="field-error">{errors[name]}</span>;
  if (status === 'success') return <div className="form-success" role="status"><span className="success-icon"><Check aria-hidden="true" /></span><h3>Application received.</h3><p>Thank you for applying to dogs & dow. Our recruitment team will review your application.</p></div>;
  return <form className="contact-form student-application-form" onSubmit={submit} noValidate aria-label="Student application">
    <p id="application-status" className="application-status">{!open ? 'Applications are not open yet. You can preview the questions below; submissions begin when recruitment opens.' : !configured ? 'Applications are temporarily unavailable. Please check back soon.' : 'Tell us about yourself. Fields marked * are required.'}</p>
    <fieldset disabled={!available || status === 'pending'} aria-describedby="application-status">
      <legend className="sr-only">Your application to dogs & dow</legend>
      <div className="form-grid">
        <label>Full name <span>*</span><input name="name" autoComplete="name" maxLength={100} required {...field('name')} />{error('name')}</label>
        <label>Email address <span>*</span><input name="email" type="email" autoComplete="email" maxLength={254} required {...field('email')} />{error('email')}</label>
        <label className="full-width">College or university <span>*</span><input name="institution" autoComplete="organization" maxLength={180} required {...field('institution')} />{error('institution')}</label>
        <label>Level of study <span>*</span><select name="level" defaultValue="" required {...field('level')}><option disabled value="">Select your level</option><option>Undergraduate</option><option>Postgraduate</option></select>{error('level')}</label>
        <label>Course and year <span>*</span><input name="course" placeholder="e.g. BCom, second year" maxLength={150} required {...field('course')} />{error('course')}</label>
        <label className="full-width">Area of interest <span>*</span><select name="interest" defaultValue="" required {...field('interest')}><option disabled value="">Select an area</option>{['M&A', 'Strategy', 'Finance & Valuation', 'Market Research', 'Marketing & Brand Strategy', 'Technology', 'Law', 'Other'].map(area => <option key={area}>{area}</option>)}</select>{error('interest')}</label>
        <label className="full-width">Why would you like to join dogs & dow? <span>*</span><textarea name="motivation" rows={4} minLength={50} maxLength={3000} required {...field('motivation')} />{error('motivation')}</label>
        <label className="full-width">Relevant experience or projects <small>Optional</small><textarea name="experience" rows={3} maxLength={3000} {...field('experience')} />{error('experience')}</label>
        <label className="full-width">LinkedIn profile <small>Optional</small><input name="linkedin" type="url" placeholder="https://www.linkedin.com/in/…" maxLength={500} {...field('linkedin')} />{error('linkedin')}</label>
      </div>
      <div className="honeypot" aria-hidden="true"><label>Leave this empty<input name="_gotcha" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="privacy-check"><input name="privacy" type="checkbox" required {...field('privacy')} /><span>I’ve read the <Link href="/privacy">privacy notice</Link> and understand how my application will be handled.</span></label>{error('privacy')}
    </fieldset>
    {available && <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="lazyOnload" onReady={() => setReady(true)} onError={() => setMessage('The security check could not load. Please reload and try again.')} /><div className="captcha" ref={captcha} /></>}
    <div role="status" aria-live="polite">{message && <p className="form-message">{message}</p>}</div>
    <button type="submit" className="button" disabled={!available || !token || status === 'pending'}>{status === 'pending' ? 'Sending application…' : 'Submit application'}<ArrowUpRight size={19} aria-hidden="true" /></button>
    <noscript><p className="form-note">Please enable JavaScript to complete the security check and submit your application.</p></noscript>
  </form>;
}
