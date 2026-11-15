'use client';
import Link from 'next/link';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { enquirySchema } from '@/lib/models';
import { trackEvent } from './tracked-link';

type TurnstileApi = { render: (element: HTMLElement, options: Record<string, unknown>) => string; reset: (id: string) => void; remove: (id: string) => void };
declare global { interface Window { turnstile?: TurnstileApi } }
export function ContactForm({ email }: { email?: string }) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState('');
  const captcha = useRef<HTMLDivElement>(null);
  const widget = useRef<string | undefined>(undefined);
  const busy = useRef(false);
  const formId = process.env.NEXT_PUBLIC_FORMSPREE_ID;
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const configured = Boolean(formId);
  const captchaEnabled = Boolean(configured && siteKey);
  useEffect(() => {
    if (!ready || !captcha.current || !siteKey || !window.turnstile) return;
    widget.current = window.turnstile.render(captcha.current, { sitekey: siteKey, theme: 'light', callback: (value: string) => setToken(value), 'expired-callback': () => setToken(''), 'error-callback': () => { setToken(''); setMessage('The security check could not load. Please retry, or contact us by email.'); } });
    return () => { if (widget.current) window.turnstile?.remove(widget.current); };
  }, [ready, siteKey]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || !configured) return;
    const data = new FormData(event.currentTarget);
    const result = enquirySchema.safeParse({ ...Object.fromEntries(data), privacy: data.get('privacy') === 'on' });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => { fieldErrors[String(issue.path[0])] = issue.message; });
      setErrors(fieldErrors); setStatus('error');
      setMessage(fieldErrors.privacy
        ? `${fieldErrors.privacy}${Object.keys(fieldErrors).length > 1 ? ' Please also check the other highlighted fields.' : ''}`
        : 'Please check the highlighted fields.');
      const first = event.currentTarget.elements.namedItem(Object.keys(fieldErrors)[0]);
      if (first instanceof HTMLElement) first.focus();
      else if (first instanceof RadioNodeList) (first.item(0) as HTMLElement | null)?.focus();
      return;
    }
    setErrors({});
    if (captchaEnabled && !token) { setStatus('error'); setMessage('Please complete the security check before sending.'); return; }
    busy.current = true; setStatus('pending'); setMessage('');
    if (captchaEnabled) data.set('cf-turnstile-response', token);
    data.set('_subject', 'New company enquiry — dogs & dow');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(`https://formspree.io/f/${formId}`, { method: 'POST', body: data, headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!response.ok) throw new Error('Submission rejected');
      setStatus('success'); setMessage('Your enquiry has been received. Thank you for getting in touch.');
      trackEvent('enquiry_success');
    } catch {
      setStatus('error'); setMessage('We couldn’t confirm your enquiry. Your details are still here. Please retry, or contact us by email.');
      if (widget.current) window.turnstile?.reset(widget.current);
      setToken('');
    } finally { window.clearTimeout(timeout); busy.current = false; }
  }
  function field(name: string) { return { 'aria-invalid': Boolean(errors[name]), 'aria-describedby': errors[name] ? `${name}-error` : undefined }; }
  function error(name: string) { return errors[name] && <span id={`${name}-error`} className="field-error">{errors[name]}</span>; }
  function choices(name: 'service' | 'timeline', title: string, options: string[], required = false) {
    return <fieldset className="enquiry-choices full-width">
      <legend>{title}{required ? <span> *</span> : <small>Optional</small>}</legend>
      <div className="enquiry-choice-list">{options.map(option => <label className="enquiry-choice" key={option}>
        <input type="radio" name={name} value={option} required={required} {...field(name)} />
        <span>{option}</span>
      </label>)}</div>
      {error(name)}
    </fieldset>;
  }
  if (status === 'success') return <div className="form-success" role="status"><span className="success-icon" aria-hidden="true"><svg className="success-orbit" viewBox="0 0 72 72"><circle cx="36" cy="36" r="33" pathLength="100" /></svg><Check className="success-check" /></span><h3>A good conversation<br />starts here.</h3><p>{message}</p></div>;
  return <form className="contact-form" data-status={status} action={formId ? `https://formspree.io/f/${formId}` : undefined} method="post" onSubmit={submit} noValidate>
    <div className="form-grid">
      <label>Your name <span>*</span><input name="name" autoComplete="name" placeholder="Alex Sharma" required maxLength={100} {...field('name')} />{error('name')}</label>
      <label>Email address <span>*</span><input name="email" type="email" autoComplete="email" placeholder="alex@company.com" required maxLength={254} {...field('email')} />{error('email')}</label>
      <label>Company <span>*</span><input name="company" autoComplete="organization" placeholder="Your organisation" required maxLength={150} {...field('company')} />{error('company')}</label>
      <label>Company website <small>Optional</small><input name="website" type="url" placeholder="https://" autoComplete="url" {...field('website')} />{error('website')}</label>
      {choices('service', 'What can we help with?', ['Finance', 'Strategy', 'Marketing & Branding', 'Something else'], true)}
      <label className="full-width">A little about your project <span>*</span><textarea name="brief" placeholder="The challenge, the opportunity, or the question on your mind…" rows={3} required minLength={20} maxLength={5000} {...field('brief')} />{error('brief')}</label>
      {choices('timeline', 'Expected timeline', ['ASAP', '4–6 weeks', 'More than 6 weeks'])}
    </div>
    <div className="honeypot" aria-hidden="true"><label>Leave this empty<input name="_gotcha" tabIndex={-1} autoComplete="off" /></label></div>
    <label className="privacy-check" data-invalid={Boolean(errors.privacy)}><input type="checkbox" name="privacy" required {...field('privacy')} onChange={event => {
      if (event.target.checked && errors.privacy) {
        const remaining = { ...errors }; delete remaining.privacy;
        setErrors(remaining);
        setMessage(Object.keys(remaining).length ? 'Please check the highlighted fields.' : '');
        setStatus(Object.keys(remaining).length ? 'error' : 'idle');
      }
    }} /><span>I’ve read the <Link href="/privacy">privacy notice</Link> and understand how my enquiry will be handled.</span></label>{error('privacy')}
    {captchaEnabled && <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="lazyOnload" onReady={() => setReady(true)} onError={() => setMessage('The security check could not load. Please reload, or contact us by email.')} /><div ref={captcha} className="captcha" /></>}
    <noscript><p className="form-note">Please enable JavaScript to submit your enquiry.{email && <> You can also email <a href={`mailto:${email}`}>{email}</a>.</>}</p></noscript>
    <div aria-live="polite" role="status">{message && <p className="form-message">{message}</p>}</div>
    <button className="button" disabled={!configured || (captchaEnabled && !ready) || status === 'pending'} type="submit">{status === 'pending' ? 'Sending enquiry…' : 'Let’s talk business'}<ArrowUpRight size={19} aria-hidden="true" /></button>
  </form>;
}
