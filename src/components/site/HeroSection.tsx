import { useEffect, useState } from 'react';
import { SiteSettings } from '@/data/siteData';
import { preferWebp } from '@/lib/siteImage';
import { dismissStaticHero } from '@/lib/bootstrapStaticHero';

const DEFAULT_HERO = '/images/hero.webp';
const FALLBACK_ID = 'hero-fallback';

interface HeroSectionProps {
  settings: SiteSettings;
}

function syncHeroFallback(settings: SiteSettings) {
  const el = document.getElementById(FALLBACK_ID);
  if (!el) return;
  const h1 = el.querySelector('h1');
  const sub = el.querySelector('.hero-critical__subtitle');
  const phone = el.querySelector('.hero-critical__actions .btn-outline') as HTMLAnchorElement | null;
  if (h1) h1.textContent = settings.heroTitle;
  if (sub) sub.textContent = settings.heroSubtitle;
  if (phone && settings.phone) {
    phone.textContent = settings.phone;
    phone.href = `tel:${settings.phone.replace(/\s/g, '')}`;
  }
}

export default function HeroSection({ settings }: HeroSectionProps) {
  const [heroSrc, setHeroSrc] = useState<string | null>(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const [fallbackRemoved, setFallbackRemoved] = useState(
    typeof document === 'undefined' || !document.getElementById(FALLBACK_ID),
  );

  useEffect(() => {
    const el = document.getElementById(FALLBACK_ID);
    if (!el) return;
    syncHeroFallback(settings);
    dismissStaticHero();
    setFallbackRemoved(true);
  }, [settings.heroTitle, settings.heroSubtitle, settings.phone]);

  useEffect(() => {
    if (!fallbackRemoved) return;
    if (window.matchMedia('(max-width: 767px)').matches) return;

    const url = preferWebp(settings.heroImage || DEFAULT_HERO);
    const load = () => setHeroSrc(url);
    const schedule = () => window.setTimeout(load, 2500);

    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });
  }, [settings.heroImage, fallbackRemoved]);

  useEffect(() => {
    if (!heroSrc) return;
    setHeroVisible(false);
    const img = new Image();
    img.onload = () => setHeroVisible(true);
    img.src = heroSrc;
  }, [heroSrc]);

  if (!fallbackRemoved) return null;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-foreground">
      {heroSrc && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 pointer-events-none ${heroVisible ? 'opacity-25' : 'opacity-0'}`}
          style={{ backgroundImage: `url(${heroSrc})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/80 to-transparent" />
      <div className="absolute top-0 left-0 w-1 h-full bg-blue" style={{ background: 'hsl(214, 60%, 42%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 mb-8">
            <div className="h-px w-8" style={{ background: 'hsl(214, 60%, 42%)' }} />
            <span className="text-xs font-body tracking-[0.3em] uppercase" style={{ color: 'hsl(214, 60%, 65%)' }}>
              Собственное производство
            </span>
          </div>

          <h1 className="font-display text-6xl md:text-7xl font-light text-white leading-[1.05] mb-6">
            {settings.heroTitle}
          </h1>

          <p className="font-body text-lg text-white/60 mb-10 leading-relaxed">
            {settings.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="#catalog"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-foreground font-body text-sm tracking-wide hover:bg-white/90 transition-colors"
            >
              Смотреть каталог
            </a>
            <a
              href={`tel:${settings.phone}`}
              className="inline-flex items-center justify-center px-8 py-4 border border-white/30 text-white font-body text-sm tracking-wide hover:border-white/60 transition-colors"
            >
              {settings.phone}
            </a>
          </div>

          <div className="flex gap-10 mt-16 pt-10 border-t border-white/10">
            {[
              { value: '15+', label: 'лет на рынке' },
              { value: '3 200', label: 'установленных памятников' },
              { value: '30 дней', label: 'средний срок изготовления' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="font-display text-3xl text-white font-light">{stat.value}</div>
                <div className="font-body text-xs text-white/40 mt-1 leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
