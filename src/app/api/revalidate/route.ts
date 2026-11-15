import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook';
import { revalidateTag } from 'next/cache';
export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return new Response('Webhook unavailable', { status: 503 });
  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  if (!signature) return new Response('Missing signature', { status: 401 });
  const body = await request.text();
  if (body.length > 65536) return new Response('Payload too large', { status: 413 });
  try {
    if (!await isValidSignature(body, signature, secret)) return new Response('Invalid signature', { status: 401 });
    const event = JSON.parse(body);
    if (!['siteSettings', 'service', 'person', 'client', 'project', 'recruitment'].includes(event._type)) return new Response('Ignored', { status: 200 });
    revalidateTag('content', { expire: 0 });
    return Response.json({ revalidated: true });
  } catch { return new Response('Invalid webhook', { status: 400 }); }
}
