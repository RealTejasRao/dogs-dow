import { describe, expect, it } from 'vitest';
import { clientSchema, enquirySchema, personSchema, projectSchema, recruitmentSchema, validDocuments } from '@/lib/models';
import { cloudinaryUrl } from '@/lib/cloudinary';
import { redact } from '@/lib/monitoring';
const project = { _id: 'p', title: 'Market study', slug: 'market-study', clientName: 'Approved anonymous company', category: 'Strategy', summary: 'Overview', challenge: 'Challenge', approach: 'Approach', deliverables: ['Research'], outcome: 'Report delivered', approved: true };
describe('publication boundaries', () => {
  it('excludes unapproved and incomplete projects', () => { expect(validDocuments(projectSchema, [project, { ...project, approved: false }, { ...project, outcome: '' }])).toHaveLength(1); });
  it('requires client logo approval and image alternative text', () => { expect(validDocuments(clientSchema, [{ _id: 'c', name: 'Company', approved: false }])).toEqual([]); });
  it('rejects unsafe links and project path traversal', () => { expect(personSchema.safeParse({ _id: 'p', name: 'Name', role: 'Role', linkedin: 'javascript:alert(1)' }).success).toBe(false); expect(projectSchema.safeParse({ ...project, slug: '../privacy' }).success).toBe(false); });
  it('supports on-site recruitment without an external application URL', () => { expect(recruitmentSchema.safeParse({ open: true }).success).toBe(true); expect(recruitmentSchema.parse({ open: true, applicationUrl: 'https://example.org/apply' })).not.toHaveProperty('applicationUrl'); });
  it('supports a growing team without hard-coded member limits', () => { const people = Array.from({ length: 70 }, (_, i) => ({ _id: String(i), name: `Member ${i}`, role: 'Analyst' })); expect(validDocuments(personSchema, people)).toHaveLength(70); });
});
describe('enquiries', () => {
  const enquiry = { name: 'A Founder', email: 'founder@gmail.com', company: 'Early business', service: 'Strategy', website: '', timeline: '', brief: 'We would like to understand a new market.', privacy: true };
  it('accepts personal email addresses', () => { expect(enquirySchema.safeParse(enquiry).success).toBe(true); });
  it('requires a useful brief and privacy acknowledgement', () => { expect(enquirySchema.safeParse({ ...enquiry, brief: 'Hi' }).success).toBe(false); expect(enquirySchema.safeParse({ ...enquiry, privacy: false }).success).toBe(false); });
  it('rejects excessive payloads and unsafe website schemes', () => { expect(enquirySchema.safeParse({ ...enquiry, brief: 'x'.repeat(5001) }).success).toBe(false); expect(enquirySchema.safeParse({ ...enquiry, website: 'javascript:alert(1)' }).success).toBe(false); });
});
describe('privacy and assets', () => {
  it('redacts identities, request data, query strings and email addresses', () => { const result = redact({ user: { email: 'private@example.com' }, request: { body: 'secret' }, extra: { token: 'secret', info: 'private@example.com https://example.com/?secret=yes' } }); expect(JSON.stringify(result)).not.toContain('private@'); expect(JSON.stringify(result)).not.toContain('secret'); });
  it('uses a single Cloudinary transformation pipeline', () => { process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = 'test-cloud'; const url = cloudinaryUrl({ publicId: 'dogs-and-dow/photo', width: 1600, height: 1000, alt: 'Team', crop: 'auto' }, 800); expect(url).toContain('/image/upload/f_auto,q_auto,c_limit,w_800'); expect(url).not.toContain('_next'); delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; });
});
