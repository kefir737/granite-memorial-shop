import { useState } from 'react';
import Icon from '@/components/ui/icon';
import {
  Monument, Service, Portfolio, GraniteType, MenuItem, SiteSettings,
  defaultMonuments, defaultServices, defaultPortfolio, defaultGraniteTypes, defaultMenuItems, defaultSiteSettings
} from '@/data/siteData';
import MonumentsAdmin from './MonumentsAdmin';
import MenuAdmin from './MenuAdmin';
import SettingsAdmin from './SettingsAdmin';
import PagesAdmin from './PagesAdmin';

interface AdminPanelProps {
  monuments: Monument[];
  services: Service[];
  portfolio: Portfolio[];
  graniteTypes: GraniteType[];
  menuItems: MenuItem[];
  settings: SiteSettings;
  onUpdateMonuments: (v: Monument[]) => void;
  onUpdateServices: (v: Service[]) => void;
  onUpdatePortfolio: (v: Portfolio[]) => void;
  onUpdateGraniteTypes: (v: GraniteType[]) => void;
  onUpdateMenuItems: (v: MenuItem[]) => void;
  onUpdateSettings: (v: SiteSettings) => void;
  onClose: () => void;
}

type Tab = 'monuments' | 'services' | 'portfolio' | 'granite' | 'menu' | 'pages' | 'settings';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'monuments', label: 'Памятники', icon: 'Package' },
  { id: 'services', label: 'Услуги', icon: 'Hammer' },
  { id: 'portfolio', label: 'Портфолио', icon: 'Image' },
  { id: 'granite', label: 'О граните', icon: 'Layers' },
  { id: 'menu', label: 'Меню', icon: 'Menu' },
  { id: 'pages', label: 'Страницы', icon: 'FileText' },
  { id: 'settings', label: 'Настройки', icon: 'Settings' },
];

export default function AdminPanel({
  monuments, services, portfolio, graniteTypes, menuItems, settings,
  onUpdateMonuments, onUpdateServices, onUpdatePortfolio, onUpdateGraniteTypes,
  onUpdateMenuItems, onUpdateSettings, onClose,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('monuments');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="fixed inset-0 z-[100] flex bg-white font-body">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-14'} bg-foreground text-white flex flex-col transition-all duration-300 shrink-0`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {sidebarOpen && (
            <div>
              <div className="font-display text-base font-light text-white">Администратор</div>
              <div className="text-xs text-white/40 font-body">Управление сайтом</div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors ml-auto"
          >
            <Icon name={sidebarOpen ? 'PanelLeftClose' : 'PanelLeft'} size={16} />
          </button>
        </div>

        <nav className="flex-1 py-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
              title={!sidebarOpen ? tab.label : undefined}
            >
              <Icon name={tab.icon} size={16} />
              {sidebarOpen && <span className="font-body">{tab.label}</span>}
              {sidebarOpen && activeTab === tab.id && (
                <div className="ml-auto w-1 h-1 rounded-full bg-white" style={{ background: 'hsl(214,60%,65%)' }} />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className={`w-full flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors`}
            title={!sidebarOpen ? 'Вернуться на сайт' : undefined}
          >
            <Icon name="ArrowLeft" size={16} />
            {sidebarOpen && <span className="font-body">Вернуться на сайт</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl font-medium text-foreground">
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="ExternalLink" size={14} />
            <span className="font-body">Просмотр сайта</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-stone-50" style={{ background: 'hsl(0,0%,97%)' }}>
          {activeTab === 'monuments' && (
            <MonumentsAdmin monuments={monuments} onUpdate={onUpdateMonuments} />
          )}
          {activeTab === 'services' && (
            <ServicesAdminSimple services={services} onUpdate={onUpdateServices} />
          )}
          {activeTab === 'portfolio' && (
            <PortfolioAdminSimple portfolio={portfolio} onUpdate={onUpdatePortfolio} />
          )}
          {activeTab === 'granite' && (
            <GraniteAdminSimple graniteTypes={graniteTypes} onUpdate={onUpdateGraniteTypes} />
          )}
          {activeTab === 'menu' && (
            <MenuAdmin menuItems={menuItems} onUpdate={onUpdateMenuItems} />
          )}
          {activeTab === 'pages' && <PagesAdmin />}
          {activeTab === 'settings' && (
            <SettingsAdmin settings={settings} onUpdate={onUpdateSettings} />
          )}
        </div>
      </div>
    </div>
  );
}

/* --- Inline simple admins for services/portfolio/granite --- */

function ServicesAdminSimple({ services, onUpdate }: { services: Service[]; onUpdate: (v: Service[]) => void }) {
  const [editing, setEditing] = useState<Service | null>(null);

  const save = (s: Service) => {
    onUpdate(services.map(x => x.id === s.id ? s : x));
    setEditing(null);
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="space-y-3">
        {services.map(service => (
          <div key={service.id} className="bg-white border border-border p-4 flex items-start justify-between gap-4">
            {editing?.id === service.id ? (
              <div className="flex-1 space-y-3">
                <input
                  className="w-full border border-border px-3 py-2 text-sm font-body focus:outline-none focus:border-foreground"
                  value={editing.title}
                  onChange={e => setEditing({ ...editing, title: e.target.value })}
                  placeholder="Название"
                />
                <textarea
                  className="w-full border border-border px-3 py-2 text-sm font-body focus:outline-none focus:border-foreground resize-none"
                  rows={3}
                  value={editing.description}
                  onChange={e => setEditing({ ...editing, description: e.target.value })}
                  placeholder="Описание"
                />
                <input
                  className="w-full border border-border px-3 py-2 text-sm font-body focus:outline-none focus:border-foreground"
                  value={editing.price}
                  onChange={e => setEditing({ ...editing, price: e.target.value })}
                  placeholder="Цена"
                />
                <div className="flex gap-2">
                  <button onClick={() => save(editing)} className="px-4 py-2 bg-foreground text-white text-sm font-body hover:bg-foreground/80">Сохранить</button>
                  <button onClick={() => setEditing(null)} className="px-4 py-2 border border-border text-sm font-body hover:bg-stone-50">Отмена</button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <div className="font-display text-lg text-foreground">{service.title}</div>
                  <div className="font-body text-xs text-muted-foreground mt-1">{service.price}</div>
                  <p className="font-body text-sm text-muted-foreground mt-2 line-clamp-2">{service.description}</p>
                </div>
                <button onClick={() => setEditing({ ...service })} className="shrink-0 p-2 text-muted-foreground hover:text-foreground transition-colors border border-border">
                  <Icon name="Pencil" size={14} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PortfolioAdminSimple({ portfolio, onUpdate }: { portfolio: Portfolio[]; onUpdate: (v: Portfolio[]) => void }) {
  const remove = (id: number) => onUpdate(portfolio.filter(p => p.id !== id));

  return (
    <div className="p-6 max-w-4xl">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {portfolio.map(item => (
          <div key={item.id} className="bg-white border border-border overflow-hidden group">
            <div className="aspect-[4/3] bg-stone-100 relative">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              <button
                onClick={() => remove(item.id)}
                className="absolute top-2 right-2 w-7 h-7 bg-white border border-border flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Icon name="Trash2" size={12} />
              </button>
            </div>
            <div className="p-3">
              <div className="font-display text-sm text-foreground">{item.title}</div>
              <div className="font-body text-xs text-muted-foreground mt-0.5">{item.material} · {item.year}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <button className="flex items-center gap-2 px-4 py-3 border border-dashed border-border text-sm font-body text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors w-full justify-center">
          <Icon name="Plus" size={16} />
          Добавить работу
        </button>
      </div>
    </div>
  );
}

function GraniteAdminSimple({ graniteTypes, onUpdate }: { graniteTypes: GraniteType[]; onUpdate: (v: GraniteType[]) => void }) {
  const [editing, setEditing] = useState<GraniteType | null>(null);

  const save = (g: GraniteType) => {
    onUpdate(graniteTypes.map(x => x.id === g.id ? g : x));
    setEditing(null);
  };

  return (
    <div className="p-6 max-w-4xl space-y-3">
      {graniteTypes.map(g => (
        <div key={g.id} className="bg-white border border-border p-4">
          {editing?.id === g.id ? (
            <div className="space-y-3">
              <input className="w-full border border-border px-3 py-2 text-sm font-body focus:outline-none focus:border-foreground" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="Название" />
              <div className="grid grid-cols-2 gap-3">
                <input className="border border-border px-3 py-2 text-sm font-body focus:outline-none focus:border-foreground" value={editing.origin} onChange={e => setEditing({ ...editing, origin: e.target.value })} placeholder="Происхождение" />
                <input className="border border-border px-3 py-2 text-sm font-body focus:outline-none focus:border-foreground" value={editing.hardness} onChange={e => setEditing({ ...editing, hardness: e.target.value })} placeholder="Твёрдость" />
              </div>
              <textarea className="w-full border border-border px-3 py-2 text-sm font-body focus:outline-none focus:border-foreground resize-none" rows={4} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} placeholder="Описание" />
              <div className="flex gap-2">
                <button onClick={() => save(editing)} className="px-4 py-2 bg-foreground text-white text-sm font-body hover:bg-foreground/80">Сохранить</button>
                <button onClick={() => setEditing(null)} className="px-4 py-2 border border-border text-sm font-body">Отмена</button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display text-lg text-foreground">{g.name}</div>
                <div className="font-body text-xs text-muted-foreground mt-1">{g.origin} · {g.hardness}</div>
                <p className="font-body text-sm text-muted-foreground mt-2 line-clamp-2">{g.description}</p>
              </div>
              <button onClick={() => setEditing({ ...g })} className="shrink-0 p-2 text-muted-foreground hover:text-foreground transition-colors border border-border">
                <Icon name="Pencil" size={14} />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
