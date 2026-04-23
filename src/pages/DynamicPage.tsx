import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPages, Page } from '@/lib/api';
import { SiteSettings, MenuItem } from '@/data/siteData';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';

interface Props {
  settings: SiteSettings;
  menuItems: MenuItem[];
  onAdminClick: () => void;
}

export default function DynamicPage({ settings, menuItems, onAdminClick }: Props) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPages().then(pages => {
      const found = pages.find(p => p.slug === `/${slug}`);
      if (found) {
        setPage(found);
      } else {
        navigate('/404', { replace: true });
      }
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

  return (
    <div className="min-h-screen bg-white">
      <Header menuItems={menuItems} settings={settings} onAdminClick={onAdminClick} />
      <main className="pt-16 max-w-4xl mx-auto px-6 py-16">
        <h1 className="font-display text-5xl font-light text-foreground mb-8">{page.title}</h1>
        <div className="font-body text-base text-foreground/80 leading-relaxed whitespace-pre-wrap">
          {page.content}
        </div>
      </main>
      <Footer settings={settings} menuItems={menuItems} />
    </div>
  );
}
