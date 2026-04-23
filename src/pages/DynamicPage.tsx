import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPages, Page } from '@/lib/api';
import { SiteSettings, MenuItem, Monument, Portfolio } from '@/data/siteData';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import SeoPage from './templates/SeoPage';
import CatalogPage from './templates/CatalogPage';
import OrderPage from './templates/OrderPage';
import ProductPage from './templates/ProductPage';

interface Props {
  settings: SiteSettings;
  menuItems: MenuItem[];
  monuments: Monument[];
  portfolio: Portfolio[];
  onAdminClick: () => void;
}

export default function DynamicPage({ settings, menuItems, monuments, portfolio, onAdminClick }: Props) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPages().then(pages => {
      const found = pages.find(p => p.slug === `/${slug}`);
      if (found) setPage(found);
      else navigate('/404', { replace: true });
    }).catch(() => navigate('/404', { replace: true }))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!page) return null;

  const shared = { page, settings, menuItems, onAdminClick };

  // Кастомный HTML перекрывает шаблон
  if (page.customHtml) {
    return (
      <div className="min-h-screen bg-white">
        <Header menuItems={menuItems} settings={settings} onAdminClick={onAdminClick} />
        <div dangerouslySetInnerHTML={{ __html: page.customHtml }} />
        <Footer settings={settings} menuItems={menuItems} />
      </div>
    );
  }

  if (page.template === 'catalog') return <CatalogPage {...shared} monuments={monuments} onMonumentClick={() => {}} />;
  if (page.template === 'contacts') return <OrderPage {...shared} />;
  if (page.template === 'landing') return <ProductPage {...shared} monuments={monuments} />;
  if (page.template === 'content') return <SeoPage {...shared} portfolio={portfolio} />;

  return (
    <div className="min-h-screen bg-white">
      <Header menuItems={menuItems} settings={settings} onAdminClick={onAdminClick} />
      <main className="pt-16 max-w-4xl mx-auto px-6 py-16">
        <h1 className="font-display text-5xl font-light text-foreground mb-8">{page.title}</h1>
        <div
          className="prose prose-stone max-w-none font-body leading-relaxed"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </main>
      <Footer settings={settings} menuItems={menuItems} />
    </div>
  );
}