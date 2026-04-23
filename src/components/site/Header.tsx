import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { MenuItem, SiteSettings } from '@/data/siteData';

interface HeaderProps {
  menuItems: MenuItem[];
  settings: SiteSettings;
  onAdminClick: () => void;
}

export default function Header({ menuItems, settings, onAdminClick }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = [...menuItems]
    .filter(m => m.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-foreground flex items-center justify-center">
              <span className="text-background font-display text-sm font-semibold">Г</span>
            </div>
            <div>
              <div className="font-display text-lg font-semibold leading-none text-foreground">
                {settings.companyName}
              </div>
              <div className="text-[10px] text-muted-foreground font-body tracking-widest uppercase">
                Памятники из гранита
              </div>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {visibleItems.map(item => (
              item.href.startsWith('#')
                ? <a key={item.id} href={item.href} className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors tracking-wide">{item.label}</a>
                : <Link key={item.id} to={item.href} className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors tracking-wide">{item.label}</Link>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-4">
            <a
              href={`tel:${settings.phone}`}
              className="hidden md:flex items-center gap-2 text-sm font-body text-foreground hover:text-blue transition-colors"
            >
              <Icon name="Phone" size={14} />
              {settings.phone}
            </a>
            <button
              onClick={onAdminClick}
              className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border px-3 py-1.5"
              title="Войти в админ-панель"
            >
              <Icon name="Settings" size={12} />
              Управление
            </button>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Icon name={mobileOpen ? 'X' : 'Menu'} size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border animate-fade-in">
          <div className="px-6 py-4 space-y-4">
            {visibleItems.map(item => (
              item.href.startsWith('#')
                ? <a key={item.id} href={item.href} className="block text-sm font-body text-foreground py-2 border-b border-border last:border-0" onClick={() => setMobileOpen(false)}>{item.label}</a>
                : <Link key={item.id} to={item.href} className="block text-sm font-body text-foreground py-2 border-b border-border last:border-0" onClick={() => setMobileOpen(false)}>{item.label}</Link>
            ))}
            <a href={`tel:${settings.phone}`} className="block text-sm text-blue font-body py-2">
              {settings.phone}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}