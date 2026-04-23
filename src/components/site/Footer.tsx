import { SiteSettings, MenuItem } from '@/data/siteData';

interface FooterProps {
  settings: SiteSettings;
  menuItems: MenuItem[];
}

export default function Footer({ settings, menuItems }: FooterProps) {
  const visible = [...menuItems].filter(m => m.visible).sort((a, b) => a.order - b.order);

  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="font-display text-2xl font-light mb-3">{settings.companyName}</div>
            <p className="font-body text-sm text-white/50 leading-relaxed mb-5">
              Изготовление и установка памятников из гранита с 2009 года. Собственное производство в Москве.
            </p>
            <div className="h-px bg-white/10" />
          </div>

          {/* Nav */}
          <div>
            <div className="text-xs font-body text-white/40 uppercase tracking-widest mb-4">Разделы</div>
            <nav className="space-y-2">
              {visible.map(item => (
                <a
                  key={item.id}
                  href={item.href}
                  className="block font-body text-sm text-white/60 hover:text-white transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Contacts */}
          <div>
            <div className="text-xs font-body text-white/40 uppercase tracking-widest mb-4">Контакты</div>
            <div className="space-y-2">
              <a href={`tel:${settings.phone}`} className="block font-body text-sm text-white/60 hover:text-white transition-colors">
                {settings.phone}
              </a>
              <a href={`mailto:${settings.email}`} className="block font-body text-sm text-white/60 hover:text-white transition-colors">
                {settings.email}
              </a>
              <p className="font-body text-sm text-white/40 leading-relaxed mt-3">{settings.address}</p>
              <p className="font-body text-xs text-white/30">{settings.workHours}</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10">
          <p className="font-body text-xs text-white/30">
            © {new Date().getFullYear()} {settings.companyName}. Все права защищены.
          </p>
          <div className="flex gap-6">
            <a href="#" className="font-body text-xs text-white/30 hover:text-white/60 transition-colors">Политика конфиденциальности</a>
            <a href="#" className="font-body text-xs text-white/30 hover:text-white/60 transition-colors">Публичная оферта</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
