import { GraniteType } from '@/data/siteData';
import { useState } from 'react';

interface GraniteSectionProps {
  graniteTypes: GraniteType[];
}

export default function GraniteSection({ graniteTypes }: GraniteSectionProps) {
  const [active, setActive] = useState(0);

  const current = graniteTypes[active];

  return (
    <section id="granite" className="py-24" style={{ background: 'hsl(0,0%,97%)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8" style={{ background: 'hsl(214,60%,42%)' }} />
            <span className="text-xs font-body tracking-[0.3em] uppercase text-muted-foreground">Материалы</span>
          </div>
          <h2 className="font-display text-5xl font-light text-foreground">Виды гранита и камня</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Tabs */}
          <div className="space-y-0">
            {graniteTypes.map((granite, i) => (
              <button
                key={granite.id}
                onClick={() => setActive(i)}
                className={`w-full text-left p-6 border-b border-border transition-all duration-200 group ${
                  active === i ? 'bg-white' : 'hover:bg-white/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-display text-xl transition-colors ${active === i ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                      {granite.name}
                    </h3>
                    <div className="font-body text-xs text-muted-foreground mt-1">{granite.origin} · {granite.color}</div>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full transition-colors shrink-0 ${active === i ? '' : 'bg-transparent border border-border'}`}
                    style={active === i ? { background: 'hsl(214,60%,42%)' } : {}}
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Content */}
          {current && (
            <div className="animate-fade-in" key={current.id}>
              <div className="aspect-[4/3] overflow-hidden mb-6 bg-stone-200">
                <img
                  src={current.image}
                  alt={current.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white border border-border">
                    <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">Происхождение</div>
                    <div className="font-display text-lg text-foreground">{current.origin}</div>
                  </div>
                  <div className="p-4 bg-white border border-border">
                    <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">Твёрдость</div>
                    <div className="font-display text-lg text-foreground">{current.hardness}</div>
                  </div>
                </div>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {current.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
