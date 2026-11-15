import { validatePreviewUrl } from '@sanity/preview-url-secret';
import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';
import { sanityClient, sanityConfigured } from '@/lib/content';
export async function GET(request: Request) {
  if (!sanityConfigured || !process.env.SANITY_API_READ_TOKEN) return new Response('Preview unavailable', { status: 503 });
  try {
    const { isValid, redirectTo = '/' } = await validatePreviewUrl(sanityClient(process.env.SANITY_API_READ_TOKEN), request.url);
    if (!isValid) return new Response('Invalid preview credentials', { status: 401 });
    const url = new URL(request.url); const destination = new URL(redirectTo, url.origin);
    if (destination.origin !== url.origin || !destination.pathname.startsWith('/') || destination.pathname.startsWith('/api') || destination.pathname.startsWith('/studio')) return new Response('Invalid destination', { status: 400 });
    (await draftMode()).enable();
    return NextResponse.redirect(destination, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return new Response('Preview authentication failed', { status: 401 }); }
}
