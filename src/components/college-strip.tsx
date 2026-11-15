import Image from 'next/image';

const colleges = [
  ['srcc', 'SRCC'], ['sscbs', 'SSCBS'], ['bimtech', 'BIMTECH'],
  ['nujs', 'NUJS'], ['nsut', 'NSUT'], ['nit_rourkela', 'NIT Rourkela'],
  ['manipal', 'Manipal'], ['dduc', 'DDUC'], ['xavieruni_kolkata', 'St. Xavier’s University, Kolkata'],
];

export function CollegeStrip() {
  return <section className="college-strip" aria-label="Our members’ educational backgrounds">
    <div className="wrap college-strip-inner">
      <p className="college-caption">Bringing together talent from</p>
      <div className="college-window" tabIndex={0} role="region" aria-label="College logos. Focus or hover to pause scrolling.">
        <div className="college-track">
          {[false, true].map(duplicate => <ul className="college-group" key={String(duplicate)} aria-hidden={duplicate || undefined}>
            {colleges.map(([file, name]) => <li key={file}><Image src={`/images/colleges/optimized/${file}.webp`} width={140} height={60} unoptimized loading="eager" fetchPriority="low" alt={duplicate ? '' : name} /></li>)}
          </ul>)}
        </div>
      </div>
    </div>
    <p className="sr-only">Colleges represent members’ educational backgrounds, without implying institutional endorsement.</p>
  </section>;
}
