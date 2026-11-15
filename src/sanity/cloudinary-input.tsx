'use client';
import { useRef, useState } from 'react';
import { type ObjectInputProps, set, useClient } from 'sanity';

type Asset = { public_id: string; width: number; height: number };
export function CloudinaryInput(props: ObjectInputProps) {
  const client = useClient({ apiVersion: '2026-01-01' });
  const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]); const file = useRef<HTMLInputElement>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  async function request(method: 'GET' | 'POST', body?: FormData, cursor?: string) {
    const token = client.config().token;
    if (!token) throw new Error('Your Sanity session has no bearer token. Sign in again to use the asset library.');
    const response = await fetch(`/api/cloudinary/assets${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`, { method, headers: { Authorization: `Bearer ${token}` }, body });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Asset operation failed.');
    return data;
  }
  function select(asset: Asset) {
    props.onChange(set({ ...(props.value || {}), _type: 'cloudImage', publicId: asset.public_id, width: asset.width, height: asset.height, crop: 'auto' }));
    setAssets([]); setNextCursor(undefined); setMessage('Image selected. Add meaningful alternative text below before publishing.');
  }
  async function browse(cursor?: string) { setBusy(true); try { const data = await request('GET', undefined, cursor); setAssets(previous => cursor ? [...previous, ...data.resources] : data.resources); setNextCursor(data.nextCursor || undefined); setMessage(data.resources.length ? 'Choose an image below.' : 'No images yet. Upload your first image.'); } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not load assets.'); } finally { setBusy(false); } }
  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0]; if (!chosen) return;
    if (chosen.size > 4 * 1024 * 1024) { setMessage('Choose an image smaller than 4 MB.'); return; }
    setBusy(true); try { const body = new FormData(); body.set('file', chosen); select(await request('POST', body)); } catch (error) { setMessage(error instanceof Error ? error.message : 'Upload failed.'); } finally { setBusy(false); event.target.value = ''; }
  }
  return <div>{!props.readOnly && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}><button type="button" disabled={busy || !cloud} onClick={() => browse()} style={{ padding: 10 }}>Browse Cloudinary</button><button type="button" disabled={busy || !cloud} onClick={() => file.current?.click()} style={{ padding: 10 }}>{busy ? 'Working…' : 'Upload photograph'}</button><input type="file" ref={file} accept="image/jpeg,image/png,image/webp" hidden onChange={upload} /></div>}
    {!cloud && <p>Connect Cloudinary in the environment settings to use the asset library.</p>}
    <p role="status" style={{ fontSize: 13, marginBottom: 10 }}>{message}</p>
    {assets.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, maxHeight: 350, overflow: 'auto', marginBottom: 15 }}>{assets.map(asset => <button type="button" key={asset.public_id} onClick={() => select(asset)} style={{ padding: 5, textAlign: 'left' }}><span style={{ display: 'block', height: 90, backgroundImage: `url(https://res.cloudinary.com/${encodeURIComponent(cloud!)}/image/upload/c_fill,w_160,h_90/${asset.public_id.split('/').map(encodeURIComponent).join('/')})`, backgroundSize: 'cover' }} /><span style={{ fontSize: 10, overflowWrap: 'anywhere' }}>{asset.public_id}</span></button>)}</div>}
    {nextCursor && <button type="button" disabled={busy || props.readOnly} onClick={() => browse(nextCursor)} style={{ padding: 10, marginBottom: 15 }}>Load more images</button>}
    {props.renderDefault(props)}
  </div>;
}
