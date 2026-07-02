import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Monument, SiteSettings, MenuItem } from '@/data/siteData';
import { getMonumentBySlug } from '@/lib/api';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import MonumentPage from './MonumentPage';

interface Props {
  settings: SiteSettings;
  menuItems: MenuItem[];
  monuments: Monument[];
  onAdminClick: () => void;
}

export default function MonumentRoutePage({ settings, menuItems, monuments, onAdminClick }: Props) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [monument, setMonument] = useState<Monument | null | undefined>(() =>
    slug ? monuments.find(m => m.slug === slug && m.inStock !== false) : undefined,
  );

  useEffect(() => {
    if (!slug) {
      setMonument(null);
      return;
    }
    const local = monuments.find(m => m.slug === slug && m.inStock !== false);
    if (local) {
      setMonument(local);
      return;
    }
    setMonument(undefined);
    getMonumentBySlug(slug)
      .then(setMonument)
      .catch(() => setMonument(null));
  }, [slug, monuments]);

  useEffect(() => {
    if (monument?.name) {
      document.title = `${monument.name} — ${settings.companyName}`;
    }
  }, [monument?.name, settings.companyName]);

  if (monument === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!monument || monument.inStock === false) {
    return (
      <div className="min-h-screen bg-white">
        <Header menuItems={menuItems} settings={settings} onAdminClick={onAdminClick} />
        <main className="pt-16 max-w-4xl mx-auto px-6 py-24 text-center">
          <h1 className="font-display text-4xl font-light text-foreground mb-4">Страница не найдена</h1>
          <p className="font-body text-muted-foreground mb-8">Памятник не найден или снят с публикации.</p>
          <button
            type="button"
            onClick={() => navigate('/#catalog')}
            className="px-6 py-3 bg-foreground text-white text-sm font-body hover:bg-foreground/80 transition-colors"
          >
            Вернуться в каталог
          </button>
        </main>
        <Footer settings={settings} menuItems={menuItems} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header menuItems={menuItems} settings={settings} onAdminClick={onAdminClick} />
      <main className="pt-16">
        <MonumentPage
          monument={monument}
          settings={settings}
          onBack={() => navigate('/#catalog')}
        />
      </main>
      <Footer settings={settings} menuItems={menuItems} />
    </div>
  );
}
