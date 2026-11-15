import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ user: vi.fn(), project: vi.fn(), fetch: vi.fn() }));
vi.mock('@/lib/content', () => ({ sanityConfigured: true, sanityClient: () => ({ users: { getById: mocks.user }, projects: { getById: mocks.project } }) }));
import { GET, POST } from '@/app/api/cloudinary/assets/route';
const headers = { Authorization: 'Bearer session-token', origin: 'https://example.com' };
beforeEach(() => { vi.clearAllMocks(); vi.stubEnv('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', 'test-cloud'); vi.stubEnv('CLOUDINARY_API_KEY', 'server-key'); vi.stubEnv('CLOUDINARY_API_SECRET', 'server-secret'); mocks.user.mockResolvedValue({ id: 'editor' }); mocks.project.mockResolvedValue({ members: [{ id: 'editor', role: 'editor' }] }); vi.stubGlobal('fetch', mocks.fetch); });
describe('editor asset permissions', () => {
  it('denies anonymous requests', async () => { expect((await GET(new Request('https://example.com/api/cloudinary/assets'))).status).toBe(401); expect(mocks.fetch).not.toHaveBeenCalled(); });
  it('denies viewers and users outside the project', async () => { for (const member of [{ id: 'editor', role: 'viewer' }, { id: 'other', role: 'administrator' }]) { mocks.project.mockResolvedValue({ members: [member] }); expect((await GET(new Request('https://example.com/api/cloudinary/assets', { headers }))).status).toBe(401); } });
  it('rejects cross-origin uploads', async () => { expect((await POST(new Request('https://example.com/api/cloudinary/assets', { method: 'POST', headers: { ...headers, origin: 'https://attacker.example' } }))).status).toBe(401); });
  it('returns a private asset list without credentials', async () => { mocks.fetch.mockResolvedValue({ ok: true, json: async () => ({ resources: [{ public_id: 'dogs-and-dow/team', width: 100, height: 100, secret: 'never-return' }] }) }); const response = await GET(new Request('https://example.com/api/cloudinary/assets', { headers })); expect(response.headers.get('cache-control')).toContain('no-store'); expect(await response.text()).not.toMatch(/server-secret|never-return/); });
  it('rejects a spoofed image before sending it to Cloudinary', async () => { const body = new FormData(); body.set('file', new File(['not a jpeg'], 'fake.jpg', { type: 'image/jpeg' })); const response = await POST(new Request('https://example.com/api/cloudinary/assets', { method: 'POST', headers, body })); expect(response.status).toBe(400); expect(mocks.fetch).not.toHaveBeenCalled(); });
});
