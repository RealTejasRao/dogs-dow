import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { countdownParts, recruitmentIsOpen, recruitmentOpeningTime } from '@/lib/recruitment';
import { studentApplicationSchema } from '@/lib/models';
const mocks = vi.hoisted(() => ({ content: vi.fn(), fetch: vi.fn() }));
vi.mock('@/lib/content', () => ({ getContent: mocks.content }));
import { POST } from '@/app/api/apply/route';

const application = { name: 'A Student', email: 'student@gmail.com', institution: 'An Indian College', level: 'Undergraduate', course: 'BCom, second year', interest: 'Strategy', motivation: 'I want to work on real business challenges and learn from a diverse team of students.', experience: '', linkedin: '', privacy: true, token: 'test-token' };
const request = (body: unknown = application) => new Request('https://example.com/api/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2027-01-15T00:01:00+05:30'));
  mocks.content.mockResolvedValue({ recruitment: { open: true } }); mocks.fetch.mockReset();
  vi.stubGlobal('fetch', mocks.fetch); vi.stubEnv('RECRUITMENT_FORMSPREE_ID', 'testform'); vi.stubEnv('TURNSTILE_SECRET_KEY', 'private-key');
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('recruitment timing', () => {
  it('uses midnight in India, never the visitor timezone', () => { expect(new Date(recruitmentOpeningTime).toISOString()).toBe('2027-01-14T18:30:00.000Z'); expect(countdownParts(recruitmentOpeningTime - 90061000)).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 1 }); });
  it('clamps an expired countdown and respects the CMS closing switch', () => { expect(countdownParts(recruitmentOpeningTime + 1)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 }); expect(recruitmentIsOpen(true, recruitmentOpeningTime - 1)).toBe(false); expect(recruitmentIsOpen(true, recruitmentOpeningTime)).toBe(true); expect(recruitmentIsOpen(false, recruitmentOpeningTime + 1)).toBe(false); });
});
describe('student application validation and delivery', () => {
  it('accepts personal email and rejects incomplete motivation, unsafe links and missing consent', () => { expect(studentApplicationSchema.safeParse(application).success).toBe(true); for (const changes of [{ motivation: 'Hi' }, { linkedin: 'javascript:alert(1)' }, { privacy: false }]) expect(studentApplicationSchema.safeParse({ ...application, ...changes }).success).toBe(false); });
  it('rejects early submissions even if recruitment is enabled', async () => { vi.setSystemTime(recruitmentOpeningTime - 1); expect((await POST(request())).status).toBe(403); expect(mocks.fetch).not.toHaveBeenCalled(); });
  it('rejects closed and unconfigured submissions', async () => { mocks.content.mockResolvedValueOnce({ recruitment: { open: false } }); expect((await POST(request())).status).toBe(403); vi.stubEnv('TURNSTILE_SECRET_KEY', ''); expect((await POST(request())).status).toBe(503); expect(mocks.fetch).not.toHaveBeenCalled(); });
  it('rejects invalid input and honeypots before contacting providers', async () => { expect((await POST(request({ ...application, motivation: 'Hi' }))).status).toBe(400); expect((await POST(request({ ...application, _gotcha: 'spam' }))).status).toBe(400); expect(mocks.fetch).not.toHaveBeenCalled(); });
  it('rejects a failed security check without forwarding the application', async () => { mocks.fetch.mockResolvedValueOnce(Response.json({ success: false })); expect((await POST(request())).status).toBe(403); expect(mocks.fetch).toHaveBeenCalledTimes(1); });
  it('rejects oversized or malformed requests before contacting providers', async () => { expect((await POST(request({ ...application, motivation: 'x'.repeat(25000) }))).status).toBe(413); expect((await POST(new Request('https://example.com/api/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' }))).status).toBe(400); expect(mocks.fetch).not.toHaveBeenCalled(); });
  it('reports success only after verification and provider acceptance, without forwarding tokens', async () => { mocks.fetch.mockResolvedValueOnce(Response.json({ success: true })).mockResolvedValueOnce(Response.json({ ok: true })); const response = await POST(request()); expect(response.status).toBe(200); expect(await response.json()).toEqual({ ok: true }); const sent = JSON.parse(mocks.fetch.mock.calls[1][1].body); expect(sent.email).toBe(application.email); expect(sent).not.toHaveProperty('token'); expect(sent).not.toHaveProperty('_gotcha'); });
  it('does not report success when storage or delivery fails', async () => { mocks.fetch.mockResolvedValueOnce(Response.json({ success: true })).mockResolvedValueOnce(new Response('Rejected', { status: 500 })); expect((await POST(request())).status).toBe(502); });
});
