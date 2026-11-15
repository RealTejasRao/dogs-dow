import { defineArrayMember, defineField, defineType } from 'sanity';
import { CloudinaryInput } from './cloudinary-input';

const text = (name: string, title: string, required = true) => defineField({ name, title, type: 'string', validation: rule => required ? rule.required() : rule });
const body = (name: string, title: string) => defineField({ name, title, type: 'text', rows: 4, validation: rule => rule.required() });
const order = defineField({ name: 'order', title: 'Display order', type: 'number', initialValue: 0 });
const image = (name: string, title: string) => defineField({ name, title, type: 'cloudImage' });
const strings = (name: string, title: string) => defineField({ name, title, type: 'array', of: [defineArrayMember({ type: 'string' })] });
const https = (name: string, title: string) => defineField({ name, title, type: 'url', validation: rule => rule.uri({ scheme: ['https'] }) });
const approval = defineField({ name: 'approved', title: 'Approved for public use', description: 'Only enable after client permission and factual review. Unapproved records are never displayed.', type: 'boolean', initialValue: false });

export const schemaTypes = [
  defineType({ name: 'cloudImage', title: 'Cloudinary image', type: 'object', components: { input: CloudinaryInput }, fields: [
    text('publicId', 'Cloudinary public ID'), defineField({ name: 'width', type: 'number', validation: rule => rule.required().positive() }),
    defineField({ name: 'height', type: 'number', validation: rule => rule.required().positive() }), text('alt', 'Alternative text'),
    defineField({ name: 'crop', type: 'string', options: { list: ['auto', 'center', 'faces'] }, initialValue: 'auto', validation: rule => rule.required() }),
  ] }),
  defineType({ name: 'siteSettings', title: 'Site settings', type: 'document', fields: [
    body('description', 'Homepage introduction'), image('heroImage', 'Hero video poster (optional still image)'),
    defineField({ name: 'contactEmail', type: 'string', validation: rule => rule.email() }),
    defineField({ name: 'privacyContact', type: 'string', validation: rule => rule.email() }),
    https('linkedin', 'Society LinkedIn'), defineField({ name: 'processNote', type: 'text', description: 'Describe confirmed supervision and review practices. Do not imply professional review unless it exists.' }),
    defineField({ name: 'retentionNote', type: 'text', description: 'State the actual enquiry retention and deletion process, matching your Formspree configuration.' }),
  ], preview: { prepare: () => ({ title: 'Site settings' }) } }),
  defineType({ name: 'service', title: 'Service', type: 'document', fields: [text('title', 'Title'), body('description', 'Description'), strings('deliverables', 'Example deliverables'), order] }),
  defineType({ name: 'person', title: 'Person', type: 'document', fields: [
    text('name', 'Name'), text('role', 'Role'), text('group', 'Team / function'), text('institution', 'Educational institution', false),
    https('linkedin', 'LinkedIn profile'), image('image', 'Portrait'),
    defineField({ name: 'leadership', title: 'Leadership / homepage feature', type: 'boolean', initialValue: false }), order,
  ], preview: { select: { title: 'name', subtitle: 'role' } } }),
  defineType({ name: 'client', title: 'Client', type: 'document', fields: [text('name', 'Client name'),
    defineField({ name: 'logo', title: 'Approved logo', type: 'cloudImage', validation: rule => rule.required() }), approval, order,
  ], preview: { select: { title: 'name' } } }),
  defineType({ name: 'project', title: 'Project story', type: 'document', fields: [
    text('title', 'Project title'), defineField({ name: 'slug', type: 'slug', options: { source: 'title', maxLength: 90 }, validation: rule => rule.required().custom(value => !value?.current || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current) || 'Use lowercase letters, numbers and single hyphens.') }),
    text('clientName', 'Approved client name (or approved anonymous description)'), text('category', 'Service / category'),
    body('summary', 'Short summary'), body('challenge', 'The challenge'), body('approach', 'Our approach'),
    defineField({ name: 'deliverables', type: 'array', of: [{ type: 'string' }], validation: rule => rule.required().min(1) }),
    body('outcome', 'Approved outcome — use substantiated claims only'), image('image', 'Project image'), approval,
    defineField({ name: 'featured', title: 'Feature on homepage', type: 'boolean', initialValue: false }), order,
  ] }),
  defineType({ name: 'recruitment', title: 'Recruitment', type: 'document', fields: [
    defineField({ name: 'open', title: 'Enable on-site applications', description: 'Applications can only be submitted from 15 January 2027, 12:00 AM IST. The recruitment inbox and spam protection must also be configured.', type: 'boolean', initialValue: false }),
    text('nextOpening', 'Next update / opening (confirmed only)', false), strings('expectations', 'Membership expectations'), strings('process', 'Selection process'),
  ], preview: { prepare: () => ({ title: 'Recruitment' }) } }),
];
