import { useEffect } from 'react';
import { SiteSettings, MenuItem } from '@/data/siteData';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';

interface Props {
  settings: SiteSettings;
  menuItems: MenuItem[];
  onAdminClick: () => void;
}

export default function ConstructorPage({ settings, menuItems, onAdminClick }: Props) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Конструктор оформления памятников — Гранит Север';
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header menuItems={menuItems} settings={settings} onAdminClick={onAdminClick} />
      <main className="pt-16">
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <h1 className="font-display text-3xl md:text-4xl font-light text-foreground text-center mb-6">
            Конструктор оформления памятников
          </h1>
          <p className="text-center text-muted-foreground font-body mb-6 max-w-2xl mx-auto">
            Создайте эскиз оформления памятника онлайн и отправьте его нам для расчёта стоимости.
          </p>
        </div>
        <iframe
          src="/embed/konstruktor/index.html"
          title="Конструктор оформления памятников"
          className="w-full border-0 block"
          style={{ minHeight: '920px' }}
        />
      </main>
      <Footer settings={settings} menuItems={menuItems} />
    </div>
  );
}
