import { useState } from 'react';
import { Monument } from '@/data/siteData';

interface CatalogSectionProps {
  monuments: Monument[];
}

const MATERIALS = ['Все', 'Чёрный гранит', 'Карельский гранит', 'Габбро-диабаз', 'Белый мрамор'];
const STYLES = ['Все', 'Классический', 'Арочный', 'Семейный', 'Религиозный', 'Эксклюзивный', 'Детский'];

const complexityColor = {
  простой: 'bg-green-50 text-green-700',
  средний: 'bg-amber-50 text-amber-700',
  сложный: 'bg-red-50 text-red-700',
};

export default function CatalogSection({ monuments }: CatalogSectionProps) {
  const [material, setMaterial] = useState('Все');
  const [style, setStyle] = useState('Все');

  const filtered = monuments.filter(m => {
    const byMat = material === 'Все' || m.material === material;
    const byStyle = style === 'Все' || m.style === style;
    return byMat && byStyle;
  });

  return (
    <section id="catalog" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-blue" style={{ background: 'hsl(214,60%,42%)' }} />
            <span className="text-xs font-body tracking-[0.3em] uppercase text-muted-foreground">Каталог</span>
          </div>
          <h2 className="font-display text-5xl font-light text-foreground">Памятники из гранита</h2>
        </div>

        {/* Filters */}
        <div className="mb-10 space-y-4">
          <div>
            <div className="text-xs font-body text-muted-foreground mb-2 tracking-wider uppercase">Материал</div>
            <div className="flex flex-wrap gap-2">
              {MATERIALS.map(m => (
                <button
                  key={m}
                  onClick={() => setMaterial(m)}
                  className={`px-4 py-2 text-sm font-body border transition-colors ${
                    material === m
                      ? 'bg-foreground text-white border-foreground'
                      : 'bg-white text-foreground border-border hover:border-foreground'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-body text-muted-foreground mb-2 tracking-wider uppercase">Стиль</div>
            <div className="flex flex-wrap gap-2">
              {STYLES.map(s => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`px-4 py-2 text-sm font-body border transition-colors ${
                    style === s
                      ? 'bg-foreground text-white border-foreground'
                      : 'bg-white text-foreground border-border hover:border-foreground'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground font-body">
            По выбранным фильтрам ничего не найдено
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(monument => (
              <div key={monument.id} className="group border border-border hover:border-foreground/30 transition-all duration-300 hover-scale bg-white">
                <div className="aspect-[4/3] overflow-hidden bg-stone-100 relative">
                  <img
                    src={monument.image}
                    alt={monument.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {!monument.inStock && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <span className="font-body text-sm text-foreground/60 border border-foreground/20 px-3 py-1">
                        Под заказ
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display text-xl font-medium text-foreground">{monument.name}</h3>
                    <span className={`text-xs px-2 py-0.5 font-body ${complexityColor[monument.complexity]}`}>
                      {monument.complexity}
                    </span>
                  </div>
                  <div className="text-xs font-body text-muted-foreground mb-3 space-y-1">
                    <div className="flex gap-4">
                      <span>{monument.material}</span>
                      <span className="text-border">|</span>
                      <span>{monument.style}</span>
                    </div>
                    <div className="flex gap-4">
                      <span>{monument.width}×{monument.height}×{monument.depth} см</span>
                      <span className="text-border">|</span>
                      <span>{monument.weight} кг</span>
                    </div>
                  </div>
                  <p className="text-sm font-body text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                    {monument.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <span className="font-body text-xs text-muted-foreground">{monument.priceFrom ? 'от ' : ''}</span>
                      <span className="font-display text-xl font-medium text-foreground">
                        {monument.price.toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                    <button className="px-4 py-2 bg-foreground text-white text-xs font-body hover:bg-foreground/80 transition-colors tracking-wide">
                      Узнать подробнее
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
