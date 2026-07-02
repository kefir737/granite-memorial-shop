import { useEffect, useState } from 'react';
import { SiteSettings } from '@/data/siteData';

const DEFAULT_HERO = '/images/hero.jpg';

interface HeroSectionProps {
  settings: SiteSettings;
}

export default function HeroSection({ settings }: HeroSectionProps) {
  const [heroSrc, setHeroSrc] = useState<string | null>(null);

  useEffect(() => {
    const url = settings.heroImage || DEFAULT_HERO;
    const load = () => setHeroSrc(url);
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(load, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }
    const t = window.setTimeout(load, 300);
    return () => window.clearTimeout(t);
  }, [settings.heroImage]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-foreground">
      {heroSrc && (
        <img
          src={heroSrc}
          alt=""
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-opacity duration-700"
          onLoad={(e) => e.currentTarget.classList.replace('opacity-0', 'opacity-25')}
        />
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/80 to-transparent" />
      {/* Blue accent line */}
      <div className="absolute top-0 left-0 w-1 h-full bg-blue" style={{ background: 'hsl(214, 60%, 42%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8">
            <div className="h-px w-8" style={{ background: 'hsl(214, 60%, 42%)' }} />
            <span className="text-xs font-body tracking-[0.3em] uppercase" style={{ color: 'hsl(214, 60%, 65%)' }}>
              Собственное производство
            </span>
          </div>

          {/* Main heading */}
          <h1
            className="font-display text-6xl md:text-7xl font-light text-white leading-[1.05] mb-6"
          >
            {settings.heroTitle}
          </h1>

          {/* Subtitle */}
          <p
            className="font-body text-lg text-white/60 mb-10 leading-relaxed"
          >
            {settings.heroSubtitle}
          </p>

          {/* CTA buttons */}
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

          {/* Stats */}
          <div
            className="flex gap-10 mt-16 pt-10 border-t border-white/10"
          >
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
