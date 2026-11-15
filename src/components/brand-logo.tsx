/** ViewBox removes the supplied PNG's transparent padding without altering the artwork. */
export function BrandLogo({ light = false, className = '' }: { light?: boolean; className?: string }) {
  return <svg className={`brand-logo ${className}`} viewBox="391 570 1231 723" aria-hidden="true" focusable="false">
    <image href={`/images/logo_${light ? 'white' : 'black'}.png`} width="2000" height="2000" />
  </svg>;
}
