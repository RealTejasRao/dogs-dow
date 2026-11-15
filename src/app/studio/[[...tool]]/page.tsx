import type { Metadata } from 'next';
import Studio from '@/sanity/studio';
export const metadata: Metadata = { title: 'Editorial studio', robots: { index: false, follow: false } };
export default function StudioPage() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) return <div className="studio-unconfigured"><h1>Your editorial home.</h1><p>Sanity is not connected yet. Follow the setup guide in README.md, add the project ID and dataset to your environment, and restart the app.</p></div>;
  return <Studio />;
}
