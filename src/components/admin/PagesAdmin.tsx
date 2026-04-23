import { useState } from 'react';
import Icon from '@/components/ui/icon';

type Page = {
  id: string;
  title: string;
  slug: string;
  template: 'landing' | 'catalog' | 'content' | 'contacts';
  visible: boolean;
  content: string;
};

const TEMPLATES = [
  { id: 'landing', label: 'Лендинг', desc: 'Главная страница с героем и блоками' },
  { id: 'catalog', label: 'Каталог', desc: 'Сетка карточек с фильтрами' },
  { id: 'content', label: 'Текстовая', desc: 'Страница с текстом и изображениями' },
  { id: 'contacts', label: 'Контакты', desc: 'Контакты, карта, форма обратной связи' },
];

const initialPages: Page[] = [
  { id: '1', title: 'Главная', slug: '/', template: 'landing', visible: true, content: 'Основная страница сайта с каталогом, услугами и портфолио.' },
  { id: '2', title: 'Каталог памятников', slug: '/catalog', template: 'catalog', visible: false, content: 'Полный каталог памятников с фильтрацией.' },
  { id: '3', title: 'Политика конфиденциальности', slug: '/privacy', template: 'content', visible: false, content: 'Текст политики конфиденциальности компании.' },
];

export default function PagesAdmin() {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [selected, setSelected] = useState<Page | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTemplate, setNewTemplate] = useState<Page['template']>('content');

  const addPage = () => {
    if (!newTitle.trim()) return;
    const page: Page = {
      id: Date.now().toString(),
      title: newTitle,
      slug: '/' + newTitle.toLowerCase().replace(/\s+/g, '-').replace(/[а-яё]/g, (c) => c),
      template: newTemplate,
      visible: false,
      content: '',
    };
    setPages([...pages, page]);
    setNewTitle('');
    setShowNew(false);
    setSelected(page);
  };

  const updatePage = (updated: Page) => {
    setPages(pages.map(p => p.id === updated.id ? updated : p));
    setSelected(updated);
  };

  const removePage = (id: string) => {
    if (id === '1') return; // protect main page
    if (confirm('Удалить страницу?')) {
      setPages(pages.filter(p => p.id !== id));
      if (selected?.id === id) setSelected(null);
    }
  };

  return (
    <div className="p-6 flex gap-6 max-w-6xl">
      {/* Page list */}
      <div className="w-64 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <span className="font-body text-sm text-muted-foreground">{pages.length} страниц</span>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-white text-xs font-body hover:bg-foreground/80 transition-colors"
          >
            <Icon name="Plus" size={12} />
            Создать
          </button>
        </div>

        <div className="space-y-1.5">
          {pages.map(page => (
            <div
              key={page.id}
              onClick={() => setSelected(page)}
              className={`flex items-center justify-between p-3 cursor-pointer border transition-colors ${
                selected?.id === page.id ? 'bg-white border-foreground' : 'bg-white border-border hover:border-foreground/30'
              }`}
            >
              <div className="min-w-0">
                <div className="font-body text-sm text-foreground truncate">{page.title}</div>
                <div className="font-body text-xs text-muted-foreground truncate">{page.slug}</div>
                <span className={`inline-block mt-1 px-1.5 py-px text-[10px] font-body ${
                  TEMPLATES.find(t => t.id === page.template)
                    ? 'bg-blue-50 text-blue-700'
                    : ''
                }`} style={{ background: 'hsl(214,60%,95%)', color: 'hsl(214,60%,35%)' }}>
                  {TEMPLATES.find(t => t.id === page.template)?.label}
                </span>
              </div>
              {page.id !== '1' && (
                <button
                  onClick={e => { e.stopPropagation(); removePage(page.id); }}
                  className="shrink-0 ml-2 p-1 text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Icon name="Trash2" size={12} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* New page form */}
        {showNew && (
          <div className="mt-4 bg-white border border-border p-4 space-y-3 animate-fade-in">
            <div className="text-xs font-body text-muted-foreground uppercase tracking-wide">Новая страница</div>
            <input
              autoFocus
              className="field-input"
              placeholder="Название"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPage()}
            />
            <select
              className="field-input"
              value={newTemplate}
              onChange={e => setNewTemplate(e.target.value as Page['template'])}
            >
              {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={addPage} className="flex-1 py-2 bg-foreground text-white text-sm font-body hover:bg-foreground/80">Создать</button>
              <button onClick={() => setShowNew(false)} className="px-3 border border-border text-sm font-body">✕</button>
            </div>
          </div>
        )}
      </div>

      {/* Page editor */}
      {selected ? (
        <div className="flex-1 bg-white border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-2xl text-foreground">{selected.title}</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.visible}
                onChange={e => updatePage({ ...selected, visible: e.target.checked })}
              />
              <span className="font-body text-sm text-foreground">Показывать в меню</span>
            </label>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">Заголовок</div>
                <input
                  className="field-input"
                  value={selected.title}
                  onChange={e => updatePage({ ...selected, title: e.target.value })}
                />
              </div>
              <div>
                <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">URL (slug)</div>
                <input
                  className="field-input"
                  value={selected.slug}
                  onChange={e => updatePage({ ...selected, slug: e.target.value })}
                  disabled={selected.id === '1'}
                />
              </div>
            </div>

            <div>
              <div className="text-xs font-body text-muted-foreground mb-2 uppercase tracking-wide">Шаблон страницы</div>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => updatePage({ ...selected, template: t.id as Page['template'] })}
                    className={`p-3 text-left border transition-colors ${
                      selected.template === t.id ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/30'
                    }`}
                  >
                    <div className="font-body text-sm font-medium text-foreground">{t.label}</div>
                    <div className="font-body text-xs text-muted-foreground mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">Описание / контент</div>
              <textarea
                className="field-input resize-none"
                rows={6}
                value={selected.content}
                onChange={e => updatePage({ ...selected, content: e.target.value })}
                placeholder="Текст или описание страницы..."
              />
            </div>

            <button
              onClick={() => setPages(pages.map(p => p.id === selected.id ? selected : p))}
              className="px-6 py-3 bg-foreground text-white text-sm font-body hover:bg-foreground/80 transition-colors"
            >
              Сохранить страницу
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground font-body text-sm">
          Выберите страницу для редактирования
        </div>
      )}
    </div>
  );
}
