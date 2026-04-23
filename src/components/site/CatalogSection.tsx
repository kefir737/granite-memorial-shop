import { useState, useEffect, useRef } from 'react';
import { Monument } from '@/data/siteData';
import Icon from '@/components/ui/icon';

interface CatalogSectionProps {
  monuments: Monument[];
  onMonumentClick: (slug: string) => void;
}

const MATERIALS = ['Все', 'Чёрный гранит', 'Карельский гранит', 'Габбро-диабаз', 'Белый мрамор'];
const STYLES = ['Все', 'Классический', 'Арочный', 'Семейный', 'Религиозный', 'Эксклюзивный', 'Детский'];
const PER_PAGE = 6;

function LazyImage({ src, alt }: { src: string; alt: string }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className="w-full h-full bg-stone-100">
      {visible && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 group-hover:scale-105 transition-transform duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
}

export default function CatalogSection({ monuments, onMonumentClick }: CatalogSectionProps) {
  const [material, setMaterial] = useState('Все');
  const [style, setStyle] = useState('Все');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [page, setPage] = useState(1);

  const filtered = monuments.filter(m => {
    const byMat = material === 'Все' || m.material === material;
    const byStyle = style === 'Все' || m.style === style;
    const min = priceMin ? m.price >= Number(priceMin) : true;
    const max = priceMax ? m.price <= Number(priceMax) : true;
    return byMat && byStyle && min && max;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const resetFilters = () => {
    setMaterial('Все');
    setStyle('Все');
    setPriceMin('');
    setPriceMax('');
    setPage(1);
  };

  const onFilter = (fn: () => void) => { fn(); setPage(1); };

  return (
    <section id="catalog" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8" style={{ background: 'hsl(214,60%,42%)' }} />
            <span className="text-xs font-body tracking-[0.3em] uppercase text-muted-foreground">Каталог</span>
          </div>
          <h2 className="font-display text-5xl font-light text-foreground">Памятники из гранита</h2>
        </div>

        {/* Filters */}
        <div className="mb-10 p-5 border border-border bg-stone-50 space-y-5" style={{ background: 'hsl(0,0%,97%)' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <div className="text-xs font-body text-muted-foreground mb-2 tracking-wider uppercase">Материал</div>
              <div className="flex flex-wrap gap-1.5">
                {MATERIALS.map(m => (
                  <button key={m} onClick={() => onFilter(() => setMaterial(m))}
                    className={`px-3 py-1.5 text-xs font-body border transition-colors ${material === m ? 'bg-foreground text-white border-foreground' : 'bg-white text-foreground border-border hover:border-foreground/40'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-body text-muted-foreground mb-2 tracking-wider uppercase">Стиль</div>
              <div className="flex flex-wrap gap-1.5">
                {STYLES.map(s => (
                  <button key={s} onClick={() => onFilter(() => setStyle(s))}
                    className={`px-3 py-1.5 text-xs font-body border transition-colors ${style === s ? 'bg-foreground text-white border-foreground' : 'bg-white text-foreground border-border hover:border-foreground/40'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-body text-muted-foreground mb-2 tracking-wider uppercase">Цена, ₽</div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="от"
                  value={priceMin}
                  onChange={e => onFilter(() => setPriceMin(e.target.value))}
                  className="field-input w-24 text-sm"
                />
                <span className="text-muted-foreground text-sm">—</span>
                <input
                  type="number"
                  placeholder="до"
                  value={priceMax}
                  onChange={e => onFilter(() => setPriceMax(e.target.value))}
                  className="field-input w-24 text-sm"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="font-body text-xs text-muted-foreground">Найдено: {filtered.length}</span>
            {(material !== 'Все' || style !== 'Все' || priceMin || priceMax) && (
              <button onClick={resetFilters} className="flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="X" size={12} />
                Сбросить фильтры
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {paginated.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground font-body">
            По выбранным фильтрам ничего не найдено
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map((monument, i) => (
                <div
                  key={monument.id}
                  className="group border border-border hover:border-foreground/30 transition-all duration-300 hover-scale bg-white animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => onMonumentClick(monument.slug)}
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <LazyImage src={monument.image} alt={monument.name} />
                    {!monument.inStock && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span className="font-body text-sm text-foreground/60 border border-foreground/20 px-3 py-1 bg-white">
                          Под заказ
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-xl font-medium text-foreground mb-2">{monument.name}</h3>
                    <div className="text-xs font-body text-muted-foreground mb-3 space-y-1">
                      <div className="flex gap-3">
                        <span>{monument.material}</span>
                        <span className="text-border">|</span>
                        <span>{monument.style}</span>
                      </div>
                      <div>{monument.width}×{monument.height}×{monument.depth} см</div>
                    </div>
                    <p className="text-sm font-body text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                      {monument.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <div>
                          <span className="font-body text-xs text-muted-foreground">{monument.priceFrom ? 'от ' : ''}</span>
                          <span className="font-display text-xl font-medium text-foreground">
                            {monument.price.toLocaleString('ru-RU')} ₽
                          </span>
                        </div>
                        {monument.installPrice > 0 && (
                          <div className="text-xs font-body text-muted-foreground mt-0.5">
                            Установка от {monument.installPrice.toLocaleString('ru-RU')} ₽
                          </div>
                        )}
                      </div>
                      <button
                        className="px-4 py-2 bg-foreground text-white text-xs font-body hover:bg-foreground/80 transition-colors tracking-wide"
                        onClick={e => { e.stopPropagation(); onMonumentClick(monument.slug); }}
                      >
                        Подробнее
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-9 h-9 flex items-center justify-center border border-border text-foreground hover:border-foreground/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Icon name="ChevronLeft" size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 flex items-center justify-center border text-sm font-body transition-colors ${
                      p === page
                        ? 'bg-foreground text-white border-foreground'
                        : 'border-border text-foreground hover:border-foreground/40'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-9 h-9 flex items-center justify-center border border-border text-foreground hover:border-foreground/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Icon name="ChevronRight" size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
