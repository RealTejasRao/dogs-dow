'use client';
import Image from 'next/image';
import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const desktopVideo = '/videos/hero-day-hd.mp4';
const mobileVideo = '/videos/hero-day-mobile.mp4';
function loadSource(video: HTMLVideoElement) {
  // Select once on first play. Resizing must not restart a playing clip.
  if (!video.getAttribute('src')) video.src = window.matchMedia('(max-width: 760px)').matches ? mobileVideo : desktopVideo;
}

export function HeroVideo({ posterSrc = '/images/hero-day-poster.jpg' }: { posterSrc?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wantsPlayback = useRef(true);
  const [playing, setPlaying] = useState(false);
  const [hasFrame, setHasFrame] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (motion.matches || connection?.saveData) wantsPlayback.current = false;
    let inView = true;
    function syncPlayback() {
      if (wantsPlayback.current && inView && !document.hidden) {
        loadSource(video!);
        void video!.play().catch(() => { /* Autoplay can be denied; the still and play control remain. */ });
      } else video!.pause();
    }
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncPlayback(); }, { threshold: 0.01 });
    observer.observe(video);
    const preferenceChanged = () => { if (motion.matches) wantsPlayback.current = false; syncPlayback(); };
    motion.addEventListener('change', preferenceChanged);
    document.addEventListener('visibilitychange', syncPlayback);
    syncPlayback();
    return () => { observer.disconnect(); motion.removeEventListener('change', preferenceChanged); document.removeEventListener('visibilitychange', syncPlayback); video.pause(); };
  }, []);

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) { wantsPlayback.current = false; video.pause(); }
    else { wantsPlayback.current = true; loadSource(video); void video.play().catch(() => {}); }
  }

  function handleError() {
    const video = videoRef.current;
    if (video && !video.currentSrc.endsWith(mobileVideo)) {
      video.src = mobileVideo;
      if (wantsPlayback.current) void video.play().catch(() => {});
    } else { setFailed(true); setPlaying(false); }
  }

  return <>
    <div className="hero-media" aria-hidden="true">
      <Image src={posterSrc} alt="" fill priority sizes="100vw" unoptimized={posterSrc.startsWith('https://res.cloudinary.com/')} className="hero-poster" />
      <video ref={videoRef} className={`hero-background-video ${hasFrame && !failed ? 'has-frame' : ''}`} muted playsInline loop preload="none" tabIndex={-1}
        onLoadedData={() => setHasFrame(true)} onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={handleError} />
    </div>
    {!failed && <button type="button" className="video-control" onClick={togglePlayback} aria-label={playing ? 'Pause background video' : 'Play background video'}>
      {playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
    </button>}
  </>;
}
