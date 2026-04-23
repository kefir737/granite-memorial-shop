import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { MenuItem, SiteSettings } from '@/data/siteData';

interface HeaderProps {
  menuItems: MenuItem[];
  settings: SiteSettings;
  onAdminClick: () => void;
}

function NavLink({ item, onClick }: { item: MenuItem; onClick?: () => void }) {
  const cls = "text-sm font-body text-muted-foreground hover:text-foreground transition-colors tracking-wide";
  if (item.href.startsWith('#')) return <a href={item.href} className={cls} onClick={onClick}>{item.label}</a>;
  return <Link to={item.href} className={cls} onClick={onClick}>{item.label}</Link>;
}

export default function Header({ menuItems, settings, onAdminClick }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const headerItems = [...menuItems]
    .filter(m => m.visible && (m.menuType === 'header' || m.menuType === 'both' || !m.menuType))
    .sort((a, b) => a.order - b.order);

  const topLevel = headerItems.filter(i => !i.parentId);
  const getChildren = (id: number) => headerItems.filter(i => i.parentId === id);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-foreground flex items-center justify-center">
              <span className="text-background font-display text-sm font-semibold">Г</span>
            </div>
            <div>
              <div className="font-display text-lg font-semibold leading-none text-foreground">{settings.companyName}</div>
              <div className="text-[10px] text-muted-foreground font-body tracking-widest uppercase">Памятники из гранита</div>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {topLevel.map(item => {
              const kids = getChildren(item.id);
              return (
                <div key={item.id} className="relative"
                  onMouseEnter={() => kids.length ? setOpenDropdown(item.id) : undefined}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <div className="flex items-center gap-1">
                    <NavLink item={item} />
                    {kids.length > 0 && <Icon name="ChevronDown" size={12} className="text-muted-foreground" />}
                  </div>
                  {kids.length > 0 && openDropdown === item.id && (
                    <div className="absolute top-full left-0 pt-2 z-50">
                      <div className="bg-white border border-border shadow-lg min-w-[180px] py-1">
                        {kids.map(child => (
                          <div key={child.id} className="px-4 py-2 hover:bg-stone-50">
                            <NavLink item={child} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-4">
            <a href={`tel:${settings.phone}`} className="hidden md:flex items-center gap-2 text-sm font-body text-foreground hover:text-blue transition-colors">
              <Icon name="Phone" size={14} />
              {settings.phone}
            </a>
            <button onClick={onAdminClick}
              className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border px-3 py-1.5"
              title="Войти в админ-панель">
              <Icon name="Settings" size={12} />
              Управление
            </button>
            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              <Icon name={mobileOpen ? 'X' : 'Menu'} size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-border animate-fade-in">
          <div className="px-6 py-4 space-y-1">
            {topLevel.map(item => {
              const kids = getChildren(item.id);
              return (
                <div key={item.id}>
                  <div className="py-2 border-b border-border">
                    <NavLink item={item} onClick={() => setMobileOpen(false)} />
                  </div>
                  {kids.map(child => (
                    <div key={child.id} className="pl-4 py-1.5 border-b border-border/50">
                      <NavLink item={child} onClick={() => setMobileOpen(false)} />
                    </div>
                  ))}
                </div>
              );
            })}
            <a href={`tel:${settings.phone}`} className="block text-sm text-blue font-body py-2">{settings.phone}</a>
          </div>
        </div>
      )}
    </header>
  );
}
