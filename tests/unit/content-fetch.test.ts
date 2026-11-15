import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ fetch: vi.fn(), createClient: vi.fn(), draft: false }));
vi.mock('server-only', () => ({}));
vi.mock('react', () => ({ cache: (fn: unknown) => fn }));
vi.mock('next/headers', () => ({ draftMode: async () => ({ isEnabled: mocks.draft }) }));
vi.mock('next-sanity', () => ({ createClient: mocks.createClient }));
vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
beforeEach(() => { vi.resetModules(); mocks.draft = false; mocks.fetch.mockReset().mockResolvedValue({ services: [], projects: [], people: [], clients: [] }); mocks.createClient.mockReset().mockReturnValue({ fetch: mocks.fetch }); vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'testproject'); vi.stubEnv('SANITY_API_READ_TOKEN', 'private-read-token'); });
describe('CMS perspective isolation', () => {
  it('uses published perspective without a token for ordinary visitors', async () => { const { getContent } = await import('@/lib/content'); await getContent(); expect(mocks.createClient).toHaveBeenCalledWith(expect.objectContaining({ token: undefined })); expect(mocks.fetch).toHaveBeenCalledWith(expect.any(String), {}, expect.objectContaining({ perspective: 'published', next: { revalidate: 3600, tags: ['content'] } })); });
  it('uses uncached drafts only for an enabled preview and a server token', async () => { mocks.draft = true; const { getContent } = await import('@/lib/content'); await getContent(); expect(mocks.createClient).toHaveBeenCalledWith(expect.objectContaining({ token: 'private-read-token' })); expect(mocks.fetch).toHaveBeenCalledWith(expect.any(String), {}, { perspective: 'drafts', cache: 'no-store' }); });
  it('fails closed to published when the preview token is unavailable', async () => { mocks.draft = true; vi.stubEnv('SANITY_API_READ_TOKEN', ''); const { getContent } = await import('@/lib/content'); await getContent(); expect(mocks.fetch).toHaveBeenCalledWith(expect.any(String), {}, expect.objectContaining({ perspective: 'published' })); });
  it('returns factual fallback content on CMS errors without fabricated projects', async () => { mocks.fetch.mockRejectedValue(new Error('CMS unavailable')); const { getContent } = await import('@/lib/content'); const content = await getContent(); expect(content.projects).toEqual([]); expect(content.people.map(person => [person.name, person.role])).toEqual([['Tejas Yadav', 'President'], ['Rohit Sharma', 'Vice President'], ['Rohit Sah Teli', 'Vice President']]); expect(content.recruitment.open).toBe(false); expect(content.services).toHaveLength(6); });
});
