import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SiteSettings, MenuItem, Monument } from '@/data/siteData';
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
  onMonumentClick: (slug: string) => void;
}

const MATERIALS = ['Все', 'Чёрный гранит', 'Карельский гранит', 'Габбро-диабаз', 'Белый мрамор'];
const STYLES = ['Все', 'Классический', 'Арочный', 'Семейный', 'Религиозный', 'Эксклюзивный', 'Детский'];
const BUDGETS = ['Все', 'до 30 000', '30 000–50 000', '50 000–80 000', 'от 80 000'];

const PAGE_SIZE = 9;

export default function CatalogPage({ page, settings, menuItems, monuments, onAdminClick, onMonumentClick }: Props) {
  const [material, setMaterial] = useState('Все');
  const [style, setStyle] = useState('Все');
  const [budget, setBudget] = useState('Все');
  const [shown, setShown] = useState(PAGE_SIZE);

  const filtered = monuments.filter(m => {
    if (material !== 'Все' && m.material !== material) return false;
    if (style !== 'Все' && m.style !== style) return false;
    if (budget !== 'Все') {
      if (budget === 'до 30 000' && m.price >= 30000) return false;
      if (budget === '30 000–50 000' && (m.price < 30000 || m.price > 50000)) return false;
      if (budget === '50 000–80 000' && (m.price < 50000 || m.price > 80000)) return false;
      if (budget === 'от 80 000' && m.price < 80000) return false;
    }
    return true;
  });

  const visible = filtered.slice(0, shown);

  return (
    <div className="min-h-screen bg-white">
      <Header menuItems={menuItems} settings={settings} onAdminClick={onAdminClick} />
      <main className="pt-16">
        {/* Header block */}
        <div className="bg-stone-50 border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center gap-2 text-xs font-body text-muted-foreground mb-3">
              <Link to="/" className="hover:text-foreground transition-colors">Главная</Link>
              <span>/</span>
              <span className="text-foreground">{page.title}</span>
            </div>
            <h1 className="font-display text-4xl font-light text-foreground mb-2">{page.title}</h1>
            {page.content && (
              <div className="font-body text-sm text-muted-foreground max-w-2xl leading-relaxed"
                dangerouslySetInnerHTML={{ __html: page.content }} />
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-border bg-white sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap gap-3 items-center">
            <Icon name="SlidersHorizontal" size={14} className="text-muted-foreground" />
            <select className="field-input text-sm py-1.5 w-auto" value={material} onChange={e => { setMaterial(e.target.value); setShown(PAGE_SIZE); }}>
              {MATERIALS.map(m => <option key={m}>{m}</option>)}
            </select>
            <select className="field-input text-sm py-1.5 w-auto" value={style} onChange={e => { setStyle(e.target.value); setShown(PAGE_SIZE); }}>
              {STYLES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select className="field-input text-sm py-1.5 w-auto" value={budget} onChange={e => { setBudget(e.target.value); setShown(PAGE_SIZE); }}>
              {BUDGETS.map(b => <option key={b}>{b}</option>)}
            </select>
            <span className="font-body text-xs text-muted-foreground ml-auto">{filtered.length} позиций</span>
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {visible.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground font-body">Ничего не найдено</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {visible.map(m => (
                <div key={m.id} className="group border border-border bg-white hover:border-foreground/30 transition-colors cursor-pointer"
                  onClick={() => onMonumentClick(m.slug)}>
                  <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                    <img src={m.image} alt={m.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-4">
                    <div className="font-body text-xs text-muted-foreground mb-1">{m.material} · {m.style}</div>
                    <h3 className="font-display text-lg text-foreground mb-2">{m.name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="font-body text-sm text-foreground">
                        {m.priceFrom && <span className="text-muted-foreground mr-1">от</span>}
                        <span className="font-medium">{m.price.toLocaleString('ru-RU')} ₽</span>
                      </div>
                      <span className="text-xs font-body text-muted-foreground">{m.width}×{m.height}×{m.depth} см</span>
                    </div>
                    <button className="mt-3 w-full py-2 border border-foreground text-foreground text-sm font-body hover:bg-foreground hover:text-white transition-colors">
                      Подробнее
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {shown < filtered.length && (
            <div className="text-center mb-12">
              <button onClick={() => setShown(s => s + PAGE_SIZE)}
                className="px-8 py-3 border border-foreground text-foreground font-body text-sm hover:bg-foreground hover:text-white transition-colors">
                Показать ещё ({filtered.length - shown})
              </button>
            </div>
          )}

          {/* SEO footer */}
          {page.content && (
            <div className="mt-16 pt-12 border-t border-border">
              <div className="prose prose-stone max-w-none font-body text-sm text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: page.content }} />
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 bg-stone-50 border border-border p-8 text-center">
            <h2 className="font-display text-2xl font-light text-foreground mb-2">Не нашли нужный вариант?</h2>
            <p className="font-body text-sm text-muted-foreground mb-6">Составим индивидуальный проект под ваши пожелания и бюджет</p>
            <ContactForm settings={settings} />
          </div>
        </div>
      </main>
      <Footer settings={settings} menuItems={menuItems} />
    </div>
  );
}
