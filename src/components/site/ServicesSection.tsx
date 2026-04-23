import Icon from '@/components/ui/icon';
import { Service } from '@/data/siteData';

interface ServicesSectionProps {
  services: Service[];
}

export default function ServicesSection({ services }: ServicesSectionProps) {
  return (
    <section id="services" className="py-24 bg-stone-50" style={{ background: 'hsl(0,0%,97%)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8" style={{ background: 'hsl(214,60%,42%)' }} />
            <span className="text-xs font-body tracking-[0.3em] uppercase text-muted-foreground">Что мы делаем</span>
          </div>
          <h2 className="font-display text-5xl font-light text-foreground">Услуги</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <div
              key={service.id}
              className="bg-white p-8 border border-border hover:border-foreground/20 transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="w-10 h-10 mb-6 flex items-center justify-center border border-border group-hover:border-foreground/40 transition-colors">
                <Icon name={service.icon} fallback="Star" size={18} className="text-foreground" />
              </div>
              <h3 className="font-display text-2xl font-medium text-foreground mb-3">{service.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">{service.description}</p>
              <div className="pt-4 border-t border-border">
                <span className="font-body text-sm" style={{ color: 'hsl(214,60%,42%)' }}>{service.price}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 p-10 bg-foreground text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-3xl font-light mb-2">Нужна консультация?</h3>
            <p className="font-body text-sm text-white/60">Бесплатно рассчитаем стоимость и подберём лучший вариант</p>
          </div>
          <a
            href="#contacts"
            className="shrink-0 px-8 py-4 bg-white text-foreground font-body text-sm tracking-wide hover:bg-white/90 transition-colors"
          >
            Написать нам
          </a>
        </div>
      </div>
    </section>
  );
}