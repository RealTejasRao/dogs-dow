import { z } from 'zod';

export const cloudImageSchema = z.object({
  publicId: z.string().min(1), width: z.number().positive(), height: z.number().positive(),
  alt: z.string().min(1), crop: z.enum(['center', 'faces', 'auto']).default('auto'),
});
const httpsUrl = z.url().refine((url) => url.startsWith('https://'), 'Use an HTTPS URL');
export const serviceSchema = z.object({
  _id: z.string(), title: z.string().min(1), description: z.string().min(1),
  deliverables: z.array(z.string()).default([]), order: z.number().default(0),
});
export const personSchema = z.object({
  _id: z.string(), name: z.string().min(1), role: z.string().min(1), group: z.string().default('Advisory team'),
  institution: z.string().optional(), linkedin: httpsUrl.refine(url => new URL(url).hostname === 'www.linkedin.com' || new URL(url).hostname === 'linkedin.com', 'Use a LinkedIn URL').optional(),
  image: cloudImageSchema.optional(), leadership: z.boolean().default(false), order: z.number().default(0),
});
export const clientSchema = z.object({ _id: z.string(), name: z.string().min(1), logo: cloudImageSchema, approved: z.literal(true), order: z.number().default(0) });
export const projectSchema = z.object({
  _id: z.string(), title: z.string().min(1), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  clientName: z.string().min(1), category: z.string().min(1), summary: z.string().min(1),
  challenge: z.string().min(1), approach: z.string().min(1), deliverables: z.array(z.string()).min(1),
  outcome: z.string().min(1), image: cloudImageSchema.optional(), approved: z.literal(true),
  featured: z.boolean().default(false), order: z.number().default(0),
});
export const recruitmentSchema = z.object({
  open: z.boolean().default(false),
  nextOpening: z.string().optional(), expectations: z.array(z.string()).default([]),
  process: z.array(z.string()).default([]),
});
export const settingsSchema = z.object({
  description: z.string().min(1).default("Bringing together students from India's top business schools to work with companies across M&A, strategy, finance, market research, and a wide range of other business challenges."),
  contactEmail: z.email().optional(), linkedin: httpsUrl.optional(), heroImage: cloudImageSchema.optional(),
  processNote: z.string().optional(), privacyContact: z.email().optional(),
  retentionNote: z.string().optional(),
});
export type CloudImage = z.infer<typeof cloudImageSchema>;
export type Service = z.infer<typeof serviceSchema>;
// Bundled launch portraits are used until profiles have Cloudinary images in the CMS.
export type Person = z.infer<typeof personSchema> & { localImage?: string };
export type Project = z.infer<typeof projectSchema>;
export type Client = z.infer<typeof clientSchema>;
export type Recruitment = z.infer<typeof recruitmentSchema>;
export type Settings = z.infer<typeof settingsSchema>;

export function validDocuments<T>(schema: z.ZodType<T>, input: unknown): T[] {
  if (!Array.isArray(input)) return [];
  return input.flatMap(item => { const result = schema.safeParse(item); return result.success ? [result.data] : []; });
}
export const enquirySchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(100),
  email: z.email('Please enter a valid email address.').max(254),
  company: z.string().trim().min(1, 'Please enter your company name.').max(150),
  service: z.enum(['Strategy', 'Finance', 'Marketing & Branding', 'Something else'], { error: 'Please choose an area.' }),
  website: z.union([httpsUrl, z.literal('')]).optional(),
  timeline: z.string().max(100).optional(),
  brief: z.string().trim().min(20, 'Please tell us a little more (at least 20 characters).').max(5000),
  privacy: z.literal(true, { error: 'Please tick the privacy notice checkbox before sending your enquiry.' }),
});

export const studentApplicationSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name.').max(100),
  email: z.email('Please enter a valid email address.').max(254),
  institution: z.string().trim().min(2, 'Please enter your college or university.').max(180),
  level: z.enum(['Undergraduate', 'Postgraduate'], { error: 'Please select your level of study.' }),
  course: z.string().trim().min(2, 'Please enter your course and year.').max(150),
  interest: z.enum(['M&A', 'Strategy', 'Finance & Valuation', 'Market Research', 'Marketing & Brand Strategy', 'Technology', 'Law', 'Other'], { error: 'Please select an area of interest.' }),
  motivation: z.string().trim().min(50, 'Please write at least 50 characters.').max(3000),
  experience: z.string().trim().max(3000).optional(),
  linkedin: z.union([httpsUrl.max(500).refine(url => { try { return ['linkedin.com', 'www.linkedin.com'].includes(new URL(url).hostname); } catch { return false; } }, 'Please use a LinkedIn profile URL.'), z.literal('')]).optional(),
  privacy: z.literal(true, { error: 'Please acknowledge the privacy notice.' }),
});
