const FALLBACK_ID = 'hero-fallback';

/** Drop static LCP shell once React mounts on any route. */
export function dismissStaticHero() {
  document.getElementById(FALLBACK_ID)?.remove();
  document.documentElement.style.background = '';
  document.body.style.background = '';
  document.body.style.color = '';
  const root = document.getElementById('root');
  if (root) root.style.color = '';
}
