import { createHash } from 'node:crypto';
import { sanityClient, sanityConfigured } from '@/lib/content';
export const runtime = 'nodejs';
const noStore = { 'Cache-Control': 'private, no-store' };
async function authorize(request: Request) {
  const token = request.headers.get('authorization')?.match(/^Bearer ([\w.-]+)$/)?.[1];
  if (!token || !sanityConfigured) return false;
  if (request.method === 'POST' && request.headers.get('origin') !== new URL(request.url).origin) return false;
  try {
    const client = sanityClient(token);
    const [user, project] = await Promise.all([client.users.getById('me'), client.projects.getById(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!)]);
    return project.members.some(member => member.id === user.id && ['administrator', 'editor', 'developer'].includes(member.role));
  } catch { return false; }
}
function credentials() { const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; const key = process.env.CLOUDINARY_API_KEY; const secret = process.env.CLOUDINARY_API_SECRET; return cloud && key && secret ? { cloud, key, secret } : undefined; }
export async function GET(request: Request) {
  if (!await authorize(request)) return Response.json({ error: 'An authorised Sanity editor session is required.' }, { status: 401, headers: noStore });
  const creds = credentials(); if (!creds) return Response.json({ error: 'Cloudinary is not configured.' }, { status: 503, headers: noStore });
  const cursor = new URL(request.url).searchParams.get('cursor');
  if (cursor && cursor.length > 2048) return Response.json({ error: 'Invalid library cursor.' }, { status: 400, headers: noStore });
  try {
    const params = new URLSearchParams({ prefix: 'dogs-and-dow/', max_results: '50' });
    if (cursor) params.set('next_cursor', cursor);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(creds.cloud)}/resources/image/upload?${params}`, { headers: { Authorization: `Basic ${Buffer.from(`${creds.key}:${creds.secret}`).toString('base64')}` }, cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('Upstream error');
    const data = await response.json();
    return Response.json({ resources: data.resources.map((item: { public_id: string; width: number; height: number }) => ({ public_id: item.public_id, width: item.width, height: item.height })), nextCursor: data.next_cursor || null }, { headers: noStore });
  } catch { return Response.json({ error: 'The image library could not be loaded. Try again.' }, { status: 502, headers: noStore }); }
}
export async function POST(request: Request) {
  if (!await authorize(request)) return Response.json({ error: 'An authorised Sanity editor session is required.' }, { status: 401, headers: noStore });
  const creds = credentials(); if (!creds) return Response.json({ error: 'Cloudinary is not configured.' }, { status: 503, headers: noStore });
  if (Number(request.headers.get('content-length')) > 4.2 * 1024 * 1024) return Response.json({ error: 'Maximum image size is 4 MB.' }, { status: 413, headers: noStore });
  try {
    const data = await request.formData(); const file = data.get('file');
    if (!(file instanceof File) || file.size > 4 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return Response.json({ error: 'Use a JPEG, PNG or WebP image smaller than 4 MB.' }, { status: 400, headers: noStore });
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const valid = file.type === 'image/jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 : file.type === 'image/png' ? [137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b) : String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
    if (!valid) return Response.json({ error: 'The file contents do not match the image format.' }, { status: 400, headers: noStore });
    const timestamp = Math.floor(Date.now() / 1000); const folder = 'dogs-and-dow';
    const signature = createHash('sha1').update(`folder=${folder}&timestamp=${timestamp}${creds.secret}`).digest('hex');
    const body = new FormData(); body.set('file', file); body.set('folder', folder); body.set('timestamp', String(timestamp)); body.set('api_key', creds.key); body.set('signature', signature);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(creds.cloud)}/image/upload`, { method: 'POST', body, signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error('Upload failed');
    const asset = await response.json();
    return Response.json({ public_id: asset.public_id, width: asset.width, height: asset.height }, { headers: noStore });
  } catch { return Response.json({ error: 'The image could not be uploaded. Please retry.' }, { status: 502, headers: noStore }); }
}
