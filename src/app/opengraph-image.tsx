import { ImageResponse } from 'next/og';
export const alt = 'dogs & dow - Student-led advisory for real businesses';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() { return new ImageResponse(<div style={{ background: '#ffffff', color: '#171915', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '64px', justifyContent: 'space-between', fontFamily: 'sans-serif', borderBottom: '12px solid #f0502b' }}><div style={{ display: 'flex', fontSize: 44, fontWeight: 700 }}>dogs & dow<span style={{ color: '#f0502b' }}>.</span></div><div style={{ display: 'flex', flexDirection: 'column', fontSize: 78, letterSpacing: '-4px', lineHeight: 1.05 }}><span>Student-led advisory</span><span>for real businesses.</span></div><div style={{ color: '#56554e', fontSize: 20 }}>Independent. India-based. Across campuses.</div></div>, size); }
