import { NextResponse } from 'next/server';
import { getContent } from '@/lib/content';
import { studentApplicationSchema } from '@/lib/models';
import { recruitmentIsOpen } from '@/lib/recruitment';

export async function POST(request: Request) {
  const { recruitment } = await getContent();
  if (!recruitmentIsOpen(recruitment.open)) return NextResponse.json({ error: 'Applications are currently closed.' }, { status: 403 });
  const formId = process.env.RECRUITMENT_FORMSPREE_ID;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!formId || !/^[a-z0-9]+$/i.test(formId) || !secret) return NextResponse.json({ error: 'Applications are temporarily unavailable. Please check back soon.' }, { status: 503 });
  if (!request.headers.get('content-type')?.includes('application/json')) return NextResponse.json({ error: 'Unsupported request format.' }, { status: 415 });
  // Bound the body even when Content-Length is missing or supplied incorrectly.
  const reader = request.body?.getReader();
  if (!reader) return NextResponse.json({ error: 'Please check your application.' }, { status: 400 });
  const decoder = new TextDecoder();
  let size = 0;
  let raw = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 24000) { await reader.cancel(); return NextResponse.json({ error: 'Your application is too long.' }, { status: 413 }); }
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
  } catch { return NextResponse.json({ error: 'Please check your application.' }, { status: 400 }); }
  finally { reader.releaseLock(); }
  let body: Record<string, unknown>;
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Please check your application.' }, { status: 400 }); }
  if (!body || typeof body !== 'object' || body._gotcha) return NextResponse.json({ error: 'Please check your application.' }, { status: 400 });
  const parsed = studentApplicationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Please check the highlighted fields.', fields: Object.fromEntries(parsed.error.issues.map(issue => [String(issue.path[0]), issue.message])) }, { status: 400 });
  if (typeof body.token !== 'string' || !body.token || body.token.length > 2048) return NextResponse.json({ error: 'Please complete the security check.' }, { status: 403 });
  try {
    const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: new URLSearchParams({ secret, response: body.token }), signal: AbortSignal.timeout(10000), cache: 'no-store' });
    const verification = await check.json();
    if (!check.ok || verification.success !== true) return NextResponse.json({ error: 'The security check expired. Please try again.' }, { status: 403 });
    const accepted = await fetch(`https://formspree.io/f/${formId}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...parsed.data, _subject: 'Student application — dogs & dow' }), signal: AbortSignal.timeout(15000), cache: 'no-store' });
    if (!accepted.ok) return NextResponse.json({ error: 'We couldn’t confirm your application. Your answers are still here. Please try again.' }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'We couldn’t confirm your application. Your answers are still here. Please try again.' }, { status: 502 });
  }
}
