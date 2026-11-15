import { describe, expect, it, vi, beforeEach } from 'vitest';
vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }));
import { revalidateTag } from 'next/cache';
import { POST } from '@/app/api/revalidate/route';
import { encodeSignatureHeader } from '@sanity/webhook';
describe('publishing webhook', () => {
  beforeEach(() => { vi.clearAllMocks(); process.env.SANITY_REVALIDATE_SECRET = 'test-secret'; });
  it('rejects unsigned requests without invalidating content', async () => { const response = await POST(new Request('https://example.com/api/revalidate', { method: 'POST', body: '{"_type":"project"}' })); expect(response.status).toBe(401); expect(revalidateTag).not.toHaveBeenCalled(); });
  it('rejects forged signatures', async () => { const response = await POST(new Request('https://example.com/api/revalidate', { method: 'POST', body: '{"_type":"project"}', headers: { 'sanity-webhook-signature': 'forged' } })); expect(response.status).toBe(401); expect(revalidateTag).not.toHaveBeenCalled(); });
  it('rejects an unavailable configuration', async () => { delete process.env.SANITY_REVALIDATE_SECRET; expect((await POST(new Request('https://example.com/api/revalidate', { method: 'POST' }))).status).toBe(503); });
  it('invalidates content only after a genuine signature', async () => { const body = JSON.stringify({ _type: 'project' }); const signature = await encodeSignatureHeader(body, Date.now(), 'test-secret'); const response = await POST(new Request('https://example.com/api/revalidate', { method: 'POST', body, headers: { 'sanity-webhook-signature': signature } })); expect(response.status).toBe(200); expect(revalidateTag).toHaveBeenCalledWith('content', { expire: 0 }); });
  it('rejects a tampered body', async () => { const body = JSON.stringify({ _type: 'project' }); const signature = await encodeSignatureHeader(body, Date.now(), 'test-secret'); const response = await POST(new Request('https://example.com/api/revalidate', { method: 'POST', body: body + ' ', headers: { 'sanity-webhook-signature': signature } })); expect(response.status).toBe(401); expect(revalidateTag).not.toHaveBeenCalled(); });
});
