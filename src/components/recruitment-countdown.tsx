'use client';

import { useEffect, useState } from 'react';
import { countdownParts, RECRUITMENT_OPENS_AT, recruitmentOpeningTime } from '@/lib/recruitment';

export function RecruitmentCountdown({ enabled = false, minimal = false }: { enabled?: boolean; minimal?: boolean }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const reached = now !== null && now >= recruitmentOpeningTime;
  const parts = now === null ? null : countdownParts(now);
  return <section className={`recruitment-countdown${minimal ? ' countdown-minimal' : ''}`} aria-label="Estimated recruitment date: 15 January 2027, midnight India Standard Time. The date may change.">
    {!minimal && <div className="countdown-intro"><span className="countdown-kicker">{reached ? enabled ? 'APPLICATIONS OPEN' : 'RECRUITMENT UPDATE' : 'NEXT SEMESTER. NEW POSSIBILITIES.'}</span>
      <h2>{reached ? enabled ? 'Your next chapter is open.' : 'The next chapter is coming.' : 'Recruitment begins next semester.'}</h2>
      <p>{reached ? enabled ? 'Applications are now open on our website.' : 'Check back here for the next application update.' : <>Estimated opening <time dateTime={RECRUITMENT_OPENS_AT}>15 January 2027</time></>}</p>
    </div>}
    <div className="countdown-clock" aria-hidden="true">{(['days', 'hours', 'minutes', 'seconds'] as const).map(unit => <div key={unit} className="countdown-unit"><span className="countdown-number">{parts ? String(parts[unit]).padStart(2, '0') : '––'}</span><span className="countdown-label">{unit}</span></div>)}</div>
    {minimal && <div className="countdown-date"><time dateTime={RECRUITMENT_OPENS_AT}>15 January 2027</time><p>This is a rough estimate. The date may vary.</p>{reached && <p>Check back here for recruitment updates.</p>}</div>}
  </section>;
}
