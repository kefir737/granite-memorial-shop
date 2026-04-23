import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Monument, SiteSettings, MenuItem } from '@/data/siteData';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import Icon from '@/components/ui/icon';
import { Page } from '@/lib/api';
import ContactForm from '@/components/site/ContactForm';

interface Props {
  page: Page;
  settings: SiteSettings;
  menuItems: MenuItem[];
  monuments: Monument[];
  onAdminClick: () => void;
}

export default function ProductPage({ page, settings, menuItems, monuments, onAdminClick }: Props) {
  const monument = monuments[0];
  const [activeImg, setActiveImg] = useState(0);

  if (!monument) {
    return (
      <div className="min-h-screen bg-white">
        <Header menuItems={menuItems} settings={settings} onAdminClick={onAdminClick} />
        <div className="max-w-4xl mx-auto px-6 py-24 text-center font-body text-muted-foreground">
          Товар не найден. Добавьте памятники в каталог.
        </div>
        <Footer settings={settings} menuItems={menuItems} />
      </div>
    );
  }

  const images = monument.images?.length ? monument.images : [monument.image];

  return (
    <div className="min-h-screen bg-white">
      <Header menuItems={menuItems} settings={settings} onAdminClick={onAdminClick} />
      <main className="pt-16">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-xs font-body text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Главная</Link>
            <span>/</span>
            <Link to="/catalog" className="hover:text-foreground">Каталог</Link>
            <span>/</span>
            <span className="text-foreground">{monument.name}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
            {/* Gallery */}
            <div>
              <div className="aspect-[4/3] overflow-hidden bg-stone-100 mb-3 relative">
                <img src={images[activeImg]} alt={monument.name} className="w-full h-full object-cover" />
                {!monument.inStock && (
                  <div className="absolute top-4 left-4 bg-amber-50 border border-amber-200 px-3 py-1">
                    <span className="font-body text-xs text-amber-700">Изготавливается под заказ</span>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`w-16 h-16 overflow-hidden border-2 transition-colors ${activeImg === i ? 'border-foreground' : 'border-border hover:border-foreground/40'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-6" style={{ background: 'hsl(214,60%,42%)' }} />
                <span className="text-xs font-body text-muted-foreground tracking-widest uppercase">{monument.style}</span>
              </div>
              <h1 className="font-display text-4xl font-light text-foreground mb-6">{page.title || monument.name}</h1>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'Материал', value: monument.material },
                  { label: 'Размеры (Ш×В×Г)', value: `${monument.width}×${monument.height}×${monument.depth} см` },
                ].map(spec => (
                  <div key={spec.label} className="border border-border p-3">
                    <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">{spec.label}</div>
                    <div className="font-body text-sm text-foreground font-medium">{spec.value}</div>
                  </div>
                ))}
              </div>

              <div className="border border-border p-5 mb-6">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">Стоимость</div>
                    <div className="font-display text-4xl font-light text-foreground">
                      {monument.priceFrom && <span className="text-2xl text-muted-foreground mr-1">от</span>}
                      {monument.price.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                  {monument.installPrice > 0 && (
                    <div className="text-right">
                      <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">Установка</div>
                      <div className="font-body text-base text-muted-foreground">от {monument.installPrice.toLocaleString('ru-RU')} ₽</div>
                    </div>
                  )}
                </div>
              </div>

              {page.content ? (
                <div className="prose prose-sm max-w-none font-body text-sm text-muted-foreground mb-8 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: page.content }} />
              ) : (
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8">
                  {monument.fullDescription || monument.description}
                </p>
              )}

              <div className="border border-border p-6">
                <h3 className="font-display text-xl font-light text-foreground mb-4">Оставить заявку</h3>
                <ContactForm settings={settings} monumentName={monument.name} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer settings={settings} menuItems={menuItems} />
    </div>
  );
}
