import { useState, useRef } from 'react';
import Icon from '@/components/ui/icon';
import {
  Monument, Service, Portfolio, GraniteType, MenuItem, SiteSettings,
} from '@/data/siteData';
import MonumentsAdmin from './MonumentsAdmin';
import MenuAdmin from './MenuAdmin';
import SettingsAdmin from './SettingsAdmin';
import PagesAdmin from './PagesAdmin';
import PortfolioAdmin from './PortfolioAdmin';
import GraniteAdmin from './GraniteAdmin';
import LeadsAdmin from './LeadsAdmin';

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
  onRefreshMenu: () => void;
  onClose: () => void;
}

type Tab = 'leads' | 'monuments' | 'services' | 'portfolio' | 'granite' | 'menu' | 'pages' | 'settings';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'leads', label: 'Заявки', icon: 'Inbox' },
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
  onUpdateMenuItems, onUpdateSettings, onRefreshMenu, onClose,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('leads');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authed, setAuthed] = useState(() => {
    if (sessionStorage.getItem('admin_ok') === '1') return true;
    return document.cookie.split(';').some(c => c.trim() === 'admin_ok=1');
  });
  const [pwd, setPwd] = useState('');
  const [pwdError, setPwdError] = useState<string>('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // Смена пароля
  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [newPwd2, setNewPwd2] = useState('');
  const [changeStatus, setChangeStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [changeMsg, setChangeMsg] = useState('');
  const changePwdRef = useRef<HTMLDivElement>(null);

  const tryLogin = async () => {
    if (!pwd) return;
    setPwdLoading(true);
    setPwdError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });
      const data = await res.json();
      if (data.ok) {
        sessionStorage.setItem('admin_ok', '1');
        document.cookie = 'admin_ok=1; path=/; max-age=2592000; SameSite=Lax';
        setAuthed(true);
        setPwdError('');
      } else if (res.status === 429) {
        setPwdError('Слишком много попыток. Подождите 5 минут.');
      } else {
        setPwdError('Неверный пароль');
        setPwd('');
      }
    } catch {
      setPwdError('Ошибка соединения');
    } finally {
      setPwdLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('admin_ok');
    document.cookie = 'admin_ok=; path=/; max-age=0';
    setAuthed(false);
    onClose();
  };

  const changePassword = async () => {
    if (newPwd !== newPwd2) { setChangeMsg('Пароли не совпадают'); setChangeStatus('err'); return; }
    if (newPwd.length < 6) { setChangeMsg('Минимум 6 символов'); setChangeStatus('err'); return; }
    setChangeStatus('idle');
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current: curPwd, new: newPwd }),
    });
    const data = await res.json();
    if (data.ok) {
      setChangeStatus('ok');
      setChangeMsg('Пароль изменён');
      setCurPwd(''); setNewPwd(''); setNewPwd2('');
      setTimeout(() => { setChangePwdOpen(false); setChangeStatus('idle'); }, 1500);
    } else if (res.status === 429) {
      setChangeStatus('err'); setChangeMsg('Слишком много попыток');
    } else {
      setChangeStatus('err'); setChangeMsg('Неверный текущий пароль');
    }
  };

  if (!authed) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground">
        <div className="w-full max-w-sm px-8">
          <div className="mb-8 text-center">
            <div className="font-display text-3xl text-white font-light mb-2">Вход в панель</div>
            <div className="text-sm font-body text-white/40">granit-sever.ru</div>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              value={pwd}
              onChange={e => { setPwd(e.target.value); setPwdError(''); }}
              onKeyDown={e => e.key === 'Enter' && tryLogin()}
              placeholder="Пароль"
              autoFocus
              disabled={pwdLoading}
              className={`w-full bg-white/10 border text-white placeholder-white/30 px-4 py-3 font-body text-sm focus:outline-none focus:border-white/60 transition-colors disabled:opacity-50 ${pwdError ? 'border-red-400' : 'border-white/20'}`}
            />
            {pwdError && <p className="text-red-400 text-xs font-body">{pwdError}</p>}
            <button
              onClick={tryLogin}
              disabled={pwdLoading || !pwd}
              className="w-full py-3 bg-white text-foreground font-body text-sm tracking-wide hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {pwdLoading ? 'Проверяем...' : 'Войти'}
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-white/40 font-body text-sm hover:text-white/70 transition-colors"
            >
              Вернуться на сайт
            </button>
          </div>
        </div>
      </div>
    );
  }

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

        <div className="p-4 border-t border-white/10 space-y-1">
          <button
            onClick={onClose}
            className="w-full flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors"
            title={!sidebarOpen ? 'На сайт' : undefined}
          >
            <Icon name="ArrowLeft" size={16} />
            {sidebarOpen && <span className="font-body">На сайт</span>}
          </button>
          <button
            onClick={() => setChangePwdOpen(true)}
            className="w-full flex items-center gap-3 text-sm text-white/30 hover:text-white/70 transition-colors"
            title={!sidebarOpen ? 'Сменить пароль' : undefined}
          >
            <Icon name="KeyRound" size={16} />
            {sidebarOpen && <span className="font-body">Сменить пароль</span>}
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 text-sm text-white/30 hover:text-red-400 transition-colors"
            title={!sidebarOpen ? 'Выйти' : undefined}
          >
            <Icon name="LogOut" size={16} />
            {sidebarOpen && <span className="font-body">Выйти</span>}
          </button>
        </div>
      </aside>

      {/* Change password modal */}
      {changePwdOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60" onClick={e => { if (e.target === e.currentTarget) setChangePwdOpen(false); }}>
          <div ref={changePwdRef} className="bg-white w-full max-w-sm p-8 space-y-4">
            <div className="font-display text-2xl text-foreground font-light">Смена пароля</div>
            <div>
              <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">Текущий пароль</div>
              <input type="password" value={curPwd} onChange={e => setCurPwd(e.target.value)} className="field-input" placeholder="••••••••" />
            </div>
            <div>
              <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">Новый пароль</div>
              <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} className="field-input" placeholder="Минимум 6 символов" />
            </div>
            <div>
              <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">Повторите новый пароль</div>
              <input type="password" value={newPwd2} onChange={e => setNewPwd2(e.target.value)} onKeyDown={e => e.key === 'Enter' && changePassword()} className="field-input" placeholder="••••••••" />
            </div>
            {changeMsg && (
              <p className={`text-sm font-body ${changeStatus === 'ok' ? 'text-green-600' : 'text-red-500'}`}>{changeMsg}</p>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={changePassword}
                className="flex-1 py-3 bg-foreground text-white font-body text-sm hover:bg-foreground/80 transition-colors">
                Сохранить
              </button>
              <button onClick={() => { setChangePwdOpen(false); setChangeMsg(''); setChangeStatus('idle'); setCurPwd(''); setNewPwd(''); setNewPwd2(''); }}
                className="px-5 py-3 border border-border font-body text-sm text-muted-foreground hover:border-foreground/40 transition-colors">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl font-medium text-foreground">
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="ExternalLink" size={14} />
            <span className="font-body">Просмотр сайта</span>
          </a>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-stone-50" style={{ background: 'hsl(0,0%,97%)' }}>
          {activeTab === 'leads' && <LeadsAdmin />}
          {activeTab === 'monuments' && (
            <MonumentsAdmin monuments={monuments} onUpdate={onUpdateMonuments} />
          )}
          {activeTab === 'services' && (
            <ServicesAdminSimple services={services} onUpdate={onUpdateServices} />
          )}
          {activeTab === 'portfolio' && <PortfolioAdmin onUpdate={onUpdatePortfolio} />}
          {activeTab === 'granite' && (
            <GraniteAdmin graniteTypes={graniteTypes} onUpdate={onUpdateGraniteTypes} />
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