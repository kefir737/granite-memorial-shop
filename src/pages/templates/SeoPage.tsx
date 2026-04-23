import { Link } from 'react-router-dom';
import { SiteSettings, MenuItem, Portfolio } from '@/data/siteData';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import { Page } from '@/lib/api';

interface Props {
  page: Page;
  settings: SiteSettings;
  menuItems: MenuItem[];
  portfolio: Portfolio[];
  onAdminClick: () => void;
}

export default function SeoPage({ page, settings, menuItems, portfolio, onAdminClick }: Props) {
  return (
    <div className="min-h-screen bg-white">
      <Header menuItems={menuItems} settings={settings} onAdminClick={onAdminClick} />
      <main className="pt-16">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-xs font-body text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Главная</Link>
            <span>/</span>
            <span className="text-foreground">{page.title}</span>
          </div>
        </div>

        {/* SEO text block */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="font-display text-5xl font-light text-foreground mb-8">{page.title}</h1>
          <div
            className="prose prose-stone max-w-none font-body text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>

        {/* Portfolio */}
        {portfolio.length > 0 && (
          <section className="py-16 bg-stone-50">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="font-display text-3xl font-light text-foreground mb-8">Наши работы</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {portfolio.slice(0, 6).map(item => (
                  <div key={item.id} className="group relative overflow-hidden aspect-[4/3] bg-stone-100">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="font-display text-base text-white">{item.title}</div>
                      <div className="font-body text-xs text-white/70">{item.material} · {item.year}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer settings={settings} menuItems={menuItems} />
    </div>
  );
}
