// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { ContactForm } from '@/components/contact-form';
vi.mock('next/script', () => ({ default: function MockScript({ onReady }: { onReady: () => void }) { useEffect(() => { onReady(); }, [onReady]); return null; } }));
vi.mock('@/components/tracked-link', () => ({ trackEvent: vi.fn() }));
const fetchMock = vi.fn();
function fill(service: string | null = 'Strategy') {
  fireEvent.change(screen.getByLabelText(/Your name/), { target: { value: 'A Founder' } });
  fireEvent.change(screen.getByLabelText(/Email address/), { target: { value: 'founder@gmail.com' } });
  fireEvent.change(screen.getByLabelText(/^Company \*/i), { target: { value: 'New Company' } });
  if (service) fireEvent.click(screen.getByRole('radio', { name: service }));
  fireEvent.change(screen.getByLabelText(/A little about/), { target: { value: 'We need a detailed assessment of a new market.' } });
  fireEvent.click(screen.getByRole('checkbox'));
}
beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_FORMSPREE_ID', 'test-form'); vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'test-site-key');
  vi.stubGlobal('fetch', fetchMock); fetchMock.mockReset();
  window.turnstile = { render: vi.fn((_element, options) => { (options.callback as (token: string) => void)('valid-test-token'); return 'widget'; }), reset: vi.fn(), remove: vi.fn() };
});
afterEach(() => { cleanup(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe('company enquiry interaction', () => {
  it('accepts the marketing service and sends the chosen timeline', async () => { vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', ''); fetchMock.mockResolvedValue({ ok: true }); render(<ContactForm />); fill('Marketing & Branding'); fireEvent.click(screen.getByRole('radio', { name: '4–6 weeks' })); fireEvent.click(screen.getByRole('button', { name: /talk business/ })); await screen.findByText(/has been received/); const data = fetchMock.mock.calls[0][1].body as FormData; expect(data.get('service')).toBe('Marketing & Branding'); expect(data.get('timeline')).toBe('4–6 weeks'); });
  it('focuses the service choices when a required selection is missing', () => { render(<ContactForm />); fill(null); fireEvent.click(screen.getByRole('button', { name: /talk business/ })); expect(screen.getByText('Please choose an area.')).toBeTruthy(); expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Finance' })); expect(fetchMock).not.toHaveBeenCalled(); });
  it('names the missing privacy acknowledgement and clears its error when checked', () => { render(<ContactForm />); fill(); fireEvent.click(screen.getByRole('checkbox')); fireEvent.click(screen.getByRole('button', { name: /talk business/ })); expect(screen.getAllByText('Please tick the privacy notice checkbox before sending your enquiry.')).toHaveLength(2); expect(document.activeElement).toBe(screen.getByRole('checkbox')); expect(fetchMock).not.toHaveBeenCalled(); fireEvent.click(screen.getByRole('checkbox')); expect(screen.queryByText(/Please tick the privacy/)).toBeNull(); });
  it('requires a configured provider before enabling submission', () => { vi.stubEnv('NEXT_PUBLIC_FORMSPREE_ID', ''); render(<ContactForm email="hello@example.com" />); expect((screen.getByRole('button', { name: /talk business/ }) as HTMLButtonElement).disabled).toBe(true); expect(fetchMock).not.toHaveBeenCalled(); });
  it('supports provider spam filtering without requiring a public recipient or optional CAPTCHA', async () => { vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', ''); fetchMock.mockResolvedValue({ ok: true }); render(<ContactForm />); fill(); fireEvent.click(screen.getByRole('button', { name: /talk business/ })); await screen.findByText(/has been received/); expect(fetchMock).toHaveBeenCalledTimes(1); expect((fetchMock.mock.calls[0][1].body as FormData).has('cf-turnstile-response')).toBe(false); });
  it('validates fields and focuses the first error without sending', async () => { render(<ContactForm email="hello@example.com" />); fireEvent.click(screen.getByRole('button', { name: /talk business/ })); expect(screen.getByText('Please enter your name.')).toBeTruthy(); expect(document.activeElement).toBe(screen.getByLabelText(/Your name/)); expect(fetchMock).not.toHaveBeenCalled(); });
  it('preserves values and avoids success when the provider rejects spam', async () => { fetchMock.mockResolvedValue({ ok: false, status: 429 }); render(<ContactForm email="hello@example.com" />); fill(); fireEvent.click(screen.getByRole('button', { name: /talk business/ })); await screen.findByText(/couldn’t confirm/); expect((screen.getByLabelText(/Email address/) as HTMLInputElement).value).toBe('founder@gmail.com'); expect(screen.queryByText(/has been received/)).toBeNull(); expect(window.turnstile?.reset).toHaveBeenCalled(); });
  it('shows success only after acceptance and prevents repeated pending submissions', async () => { let finish!: (result: { ok: boolean }) => void; fetchMock.mockImplementation(() => new Promise(resolve => { finish = resolve; })); render(<ContactForm email="hello@example.com" />); fill(); const button = screen.getByRole('button', { name: /talk business/ }); fireEvent.click(button); fireEvent.click(button); expect(fetchMock).toHaveBeenCalledTimes(1); expect((screen.getByRole('button', { name: /Sending enquiry/ }) as HTMLButtonElement).disabled).toBe(true); finish({ ok: true }); await waitFor(() => expect(screen.getByText(/has been received/)).toBeTruthy()); });
});
