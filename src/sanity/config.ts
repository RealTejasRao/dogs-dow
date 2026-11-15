'use client';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { presentationTool } from 'sanity/presentation';
import { schemaTypes } from './schema';

const singletons = new Set(['siteSettings', 'recruitment']);
export const config = defineConfig({
  name: 'dogs-and-dow', title: 'dogs & dow — Editorial',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'unconfigured', dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  basePath: '/studio',
  plugins: [structureTool({ structure: S => S.list().title('Content').items([
    S.listItem().title('Site settings').child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    S.listItem().title('Recruitment').child(S.document().schemaType('recruitment').documentId('recruitment')),
    ...S.documentTypeListItems().filter(item => !singletons.has(item.getId() || '')),
  ]) }), presentationTool({ previewUrl: { origin: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', previewMode: { enable: '/api/draft/enable', disable: '/api/draft/disable' } } })],
  schema: { types: schemaTypes, templates: templates => templates.filter(template => !singletons.has(template.schemaType)) },
  document: { actions: (actions, context) => singletons.has(context.schemaType) ? actions.filter(action => !['delete', 'duplicate', 'unpublish'].includes(action.action || '')) : actions },
});
