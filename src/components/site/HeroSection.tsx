import { SiteSettings } from '@/data/siteData';

interface HeroSectionProps {
  settings: SiteSettings;
}

export default function HeroSection({ settings }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-foreground">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{ backgroundImage: `url(${settings.heroImage || 'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/b0b1004c-737e-475d-8c92-a90dd637541f.jpg'})` }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/80 to-transparent" />
      {/* Blue accent line */}
      <div className="absolute top-0 left-0 w-1 h-full bg-blue" style={{ background: 'hsl(214, 60%, 42%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="h-px w-8" style={{ background: 'hsl(214, 60%, 42%)' }} />
            <span className="text-xs font-body tracking-[0.3em] uppercase" style={{ color: 'hsl(214, 60%, 65%)' }}>
              Собственное производство
            </span>
          </div>

          {/* Main heading */}
          <h1
            className="font-display text-6xl md:text-7xl font-light text-white leading-[1.05] mb-6 animate-fade-in"
            style={{ animationDelay: '0.2s' }}
          >
            {settings.heroTitle}
          </h1>

          {/* Subtitle */}
          <p
            className="font-body text-lg text-white/60 mb-10 leading-relaxed animate-fade-in"
            style={{ animationDelay: '0.3s' }}
          >
            {settings.heroSubtitle}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
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
            className="flex gap-10 mt-16 pt-10 border-t border-white/10 animate-fade-in"
            style={{ animationDelay: '0.5s' }}
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