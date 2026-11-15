// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { StudentApplicationForm } from '@/components/student-application-form';
vi.mock('next/script', () => ({ default: function MockScript({ onReady }: { onReady: () => void }) { useEffect(() => { onReady(); }, [onReady]); return null; } }));
vi.mock('@/components/tracked-link', () => ({ trackEvent: vi.fn() }));
const fetchMock = vi.fn();
beforeEach(() => {
  vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2027-01-15T01:00:00+05:30'));
  vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'test-key');
  vi.stubGlobal('fetch', fetchMock); fetchMock.mockReset();
  window.turnstile = { render: vi.fn((_element, options) => { (options.callback as (token: string) => void)('test-token'); return 'widget'; }), reset: vi.fn(), remove: vi.fn() };
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
async function fill() {
  await waitFor(() => expect((screen.getByRole('button', { name: 'Submit application' }) as HTMLButtonElement).disabled).toBe(false), { timeout: 2500 });
  for (const [label, value] of [[/Full name/, 'A Student'], [/Email address/, 'student@gmail.com'], [/College or university/, 'Indian College'], [/Level of study/, 'Undergraduate'], [/Course and year/, 'BCom second year'], [/Area of interest/, 'Strategy'], [/Why would you/, 'I want to learn through real business challenges and contribute research to a student team.']] as const) fireEvent.change(screen.getByLabelText(label), { target: { value } });
  fireEvent.click(screen.getByRole('checkbox'));
}
describe('on-site student applications', () => {
  it('does not collect or submit applications while closed', () => { render(<StudentApplicationForm enabled={false} configured />); expect((screen.getByRole('button', { name: 'Submit application' }) as HTMLButtonElement).disabled).toBe(true); fireEvent.submit(screen.getByRole('form', { name: 'Student application' })); expect(fetchMock).not.toHaveBeenCalled(); });
  it('keeps answers and gives a retry message after rejection', async () => { fetchMock.mockResolvedValueOnce({ ok: false, json: async () => ({ error: 'Please retry your application.' }) }); render(<StudentApplicationForm enabled configured />); await fill(); fireEvent.submit(screen.getByRole('form', { name: 'Student application' })); await screen.findByText('Please retry your application.'); expect((screen.getByLabelText(/Full name/) as HTMLInputElement).value).toBe('A Student'); expect(screen.queryByText('Application received.')).toBeNull(); });
  it('prevents duplicate requests and confirms only an accepted application', async () => { let finish!: (value: unknown) => void; fetchMock.mockReturnValue(new Promise(resolve => { finish = resolve; })); render(<StudentApplicationForm enabled configured />); await fill(); const form = screen.getByRole('form', { name: 'Student application' }); fireEvent.submit(form); fireEvent.submit(form); expect(fetchMock).toHaveBeenCalledTimes(1); expect((screen.getByRole('button', { name: 'Sending application…' }) as HTMLButtonElement).disabled).toBe(true); finish({ ok: true, json: async () => ({ ok: true }) }); await screen.findByText('Application received.'); });
});
