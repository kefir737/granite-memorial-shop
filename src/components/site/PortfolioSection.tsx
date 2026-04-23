import { Portfolio } from '@/data/siteData';

interface PortfolioSectionProps {
  portfolio: Portfolio[];
}

export default function PortfolioSection({ portfolio }: PortfolioSectionProps) {
  return (
    <section id="portfolio" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8" style={{ background: 'hsl(214,60%,42%)' }} />
            <span className="text-xs font-body tracking-[0.3em] uppercase text-muted-foreground">Наши работы</span>
          </div>
          <h2 className="font-display text-5xl font-light text-foreground">Портфолио</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {portfolio.map((item, i) => (
            <div
              key={item.id}
              className={`group relative overflow-hidden cursor-pointer ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
            >
              <div className={`${i === 0 ? 'aspect-square' : 'aspect-[4/3]'} bg-stone-100`}>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="font-display text-xl text-white font-medium">{item.title}</h3>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-body text-xs text-white/70">{item.material}</span>
                  <span className="font-body text-xs text-white/50">{item.year}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
