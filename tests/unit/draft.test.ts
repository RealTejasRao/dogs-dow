import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ validate: vi.fn(), enable: vi.fn(), disable: vi.fn() }));
vi.mock('@/lib/content', () => ({ sanityConfigured: true, sanityClient: vi.fn() }));
vi.mock('@sanity/preview-url-secret', () => ({ validatePreviewUrl: mocks.validate }));
vi.mock('next/headers', () => ({ draftMode: async () => ({ enable: mocks.enable, disable: mocks.disable }) }));
import { GET } from '@/app/api/draft/enable/route';
beforeEach(() => { vi.clearAllMocks(); vi.stubEnv('SANITY_API_READ_TOKEN', 'server-only-token'); });
describe('draft authentication and redirects', () => {
  it('rejects invalid preview credentials before setting a cookie', async () => { mocks.validate.mockResolvedValue({ isValid: false }); expect((await GET(new Request('https://example.com/api/draft/enable'))).status).toBe(401); expect(mocks.enable).not.toHaveBeenCalled(); });
  it('rejects off-site and API redirects', async () => { for (const redirectTo of ['https://attacker.example', '//attacker.example', '/api/cloudinary/assets', '/studio']) { mocks.validate.mockResolvedValue({ isValid: true, redirectTo }); expect((await GET(new Request('https://example.com/api/draft/enable'))).status).toBe(400); } expect(mocks.enable).not.toHaveBeenCalled(); });
  it('enables authenticated same-origin previews', async () => { mocks.validate.mockResolvedValue({ isValid: true, redirectTo: '/apply' }); const response = await GET(new Request('https://example.com/api/draft/enable')); expect(response.status).toBe(307); expect(response.headers.get('location')).toBe('https://example.com/apply'); expect(mocks.enable).toHaveBeenCalledOnce(); });
});
