import { pageMetadata } from '@/lib/seo';
import Image from 'next/image';
import { garet } from '../fonts';
import applyPhoto from '../../../public/apply.png';
import { RecruitmentCountdown } from '@/components/recruitment-countdown';
import { Reveal } from '@/components/reveal';
import '../recruitment.css';
import './apply.css';

export const metadata = pageMetadata('/apply', 'Join', 'Join dogs & dow, an independent student-led advisory collective across Indian colleges. Recruitment is expected to begin on 15 January 2027; the date may change.');

export default function ApplyPage() {
  return <div className="apply-announcement">
    <div className="wrap apply-announcement-layout">
      <Reveal className="apply-announcement-copy"><h1 className={garet.className}>Recruitment begins next semester.</h1><RecruitmentCountdown minimal /></Reveal>
      <Reveal className="apply-announcement-photo" delay={.16}><Image src={applyPhoto} alt="Illuminated city buildings at night" sizes="(max-width: 760px) calc(100vw - 96px), 40vw" placeholder="blur" preload /></Reveal>
    </div>
  </div>;
}
