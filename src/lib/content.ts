import 'server-only';
import { cache } from 'react';
import { draftMode } from 'next/headers';
import { createClient } from 'next-sanity';
import * as Sentry from '@sentry/nextjs';
import { clientSchema, personSchema, projectSchema, recruitmentSchema, serviceSchema, settingsSchema, validDocuments } from './models';
import { defaultPeople, defaultRecruitment, defaultServices, defaultSettings } from './defaults';

export const sanityConfigured = Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
export function sanityClient(token?: string) {
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!, dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2026-01-01', useCdn: false, token,
  });
}
const query = `{
  "settings": *[_type == "siteSettings"][0],
  "services": *[_type == "service"] | order(order asc),
  "people": *[_type == "person"] | order(order asc, name asc),
  "clients": *[_type == "client" && approved == true] | order(order asc),
  "projects": *[_type == "project" && approved == true] | order(order asc){..., "slug": slug.current},
  "recruitment": *[_type == "recruitment"][0]
}`;

export const getContent = cache(async () => {
  const fallback = { settings: defaultSettings, services: defaultServices, people: defaultPeople, clients: [], projects: [], recruitment: defaultRecruitment };
  if (!sanityConfigured) return fallback;
  const preview = (await draftMode()).isEnabled && Boolean(process.env.SANITY_API_READ_TOKEN);
  try {
    const data = await sanityClient(preview ? process.env.SANITY_API_READ_TOKEN : undefined).fetch(query, {}, {
      perspective: preview ? 'drafts' : 'published',
      ...(preview ? { cache: 'no-store' as const } : { next: { revalidate: 3600, tags: ['content'] } }),
    });
    const settings = settingsSchema.safeParse(data.settings);
    const recruitment = recruitmentSchema.safeParse(data.recruitment);
    return {
      settings: settings.success ? settings.data : defaultSettings,
      services: validDocuments(serviceSchema, data.services),
      people: validDocuments(personSchema, data.people), clients: validDocuments(clientSchema, data.clients),
      projects: validDocuments(projectSchema, data.projects),
      recruitment: recruitment.success ? recruitment.data : defaultRecruitment,
    };
  } catch (error) {
    Sentry.captureException(error, { tags: { subsystem: 'content' } });
    // Keep a published site available during a transient CMS outage; never substitute client claims.
    return fallback;
  }
});
