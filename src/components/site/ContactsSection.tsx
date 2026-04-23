import Icon from '@/components/ui/icon';
import { SiteSettings } from '@/data/siteData';

interface ContactsSectionProps {
  settings: SiteSettings;
}

export default function ContactsSection({ settings }: ContactsSectionProps) {
  return (
    <section id="contacts" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8" style={{ background: 'hsl(214,60%,42%)' }} />
            <span className="text-xs font-body tracking-[0.3em] uppercase text-muted-foreground">Как нас найти</span>
          </div>
          <h2 className="font-display text-5xl font-light text-foreground">Контакты</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info */}
          <div className="space-y-8">
            <div className="space-y-5">
              {[
                { icon: 'Phone', label: 'Телефон', value: settings.phone, href: `tel:${settings.phone}` },
                { icon: 'Phone', label: 'Бесплатно', value: settings.phone2, href: `tel:${settings.phone2}` },
                { icon: 'Mail', label: 'Email', value: settings.email, href: `mailto:${settings.email}` },
                { icon: 'MapPin', label: 'Адрес', value: settings.address, href: undefined },
                { icon: 'Clock', label: 'Часы работы', value: settings.workHours, href: undefined },
              ].map(item => (
                <div key={item.label} className="flex gap-4 items-start">
                  <div className="w-9 h-9 border border-border flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name={item.icon} size={15} className="text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-xs font-body text-muted-foreground mb-0.5 uppercase tracking-wide">{item.label}</div>
                    {item.href ? (
                      <a href={item.href} className="font-body text-base text-foreground hover:text-blue transition-colors" style={{ '--tw-text-opacity': '1' } as React.CSSProperties}>
                        {item.value}
                      </a>
                    ) : (
                      <p className="font-body text-base text-foreground">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="border border-border p-6">
              <h3 className="font-display text-2xl font-light text-foreground mb-5">Оставить заявку</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Ваше имя"
                  className="w-full border border-border px-4 py-3 font-body text-sm focus:outline-none focus:border-foreground transition-colors bg-white"
                />
                <input
                  type="tel"
                  placeholder="Телефон"
                  className="w-full border border-border px-4 py-3 font-body text-sm focus:outline-none focus:border-foreground transition-colors bg-white"
                />
                <textarea
                  placeholder="Ваш вопрос или пожелание"
                  rows={3}
                  className="w-full border border-border px-4 py-3 font-body text-sm focus:outline-none focus:border-foreground transition-colors bg-white resize-none"
                />
                <button className="w-full py-3 bg-foreground text-white font-body text-sm tracking-wide hover:bg-foreground/80 transition-colors">
                  Отправить заявку
                </button>
              </div>
              <p className="text-xs font-body text-muted-foreground mt-3">
                Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
              </p>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="h-full min-h-[400px] bg-stone-100 border border-border flex items-center justify-center">
            <div className="text-center">
              <Icon name="MapPin" size={32} className="text-muted-foreground mx-auto mb-3" />
              <p className="font-body text-sm text-muted-foreground">{settings.address}</p>
              <p className="font-body text-xs text-muted-foreground/60 mt-1">Карта будет отображена здесь</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
