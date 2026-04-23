import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { getPages, createPage, updatePage, deletePage, updatePageMenuAssignments, Page, PageMenuLocation } from '@/lib/api';
import RichEditor from './RichEditor';

const TEMPLATES = [
  { id: 'content', label: 'SEO-страница', desc: 'Текст + портфолио' },
  { id: 'catalog', label: 'Каталог', desc: 'Фильтры + карточки памятников' },
  { id: 'landing', label: 'Карточка товара', desc: 'Фото, цена, форма заказа' },
  { id: 'contacts', label: 'Процесс заказа', desc: 'Таймлайн, FAQ, CTA' },
];

interface Props {
  onMenuChanged: () => void;
}

export default function PagesAdmin({ onMenuChanged }: Props) {
  const [pages, setPages] = useState<Page[]>([]);
  const [selected, setSelected] = useState<Page | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTemplate, setNewTemplate] = useState<Page['template']>('content');
  const [newToHeader, setNewToHeader] = useState(false);
  const [newToFooter, setNewToFooter] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Локальное состояние чекбоксов редактирования — сбрасывается при смене страницы
  const [editAssignments, setEditAssignments] = useState<PageMenuLocation[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    getPages().then(setPages).catch(() => setPages([]));
  }, []);

  // При выборе страницы — инициализируем чекбоксы из данных сервера
  const selectPage = (page: Page) => {
    setSelected(page);
    setEditAssignments([...(page.menuAssignments || [])]);
    setSaved(false);
    setSaveError('');
  };

  const addPage = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    setCreateError('');
    try {
      const slug = '/' + newTitle.toLowerCase().replace(/\s+/g, '-');
      const page = await createPage({ title: newTitle, slug, template: newTemplate, visible: false, content: '', sortOrder: 0 });

      // Сохраняем привязки меню через отдельный endpoint
      const locations: PageMenuLocation[] = [];
      if (newToHeader) locations.push('header');
      if (newToFooter) locations.push('footer');
      if (locations.length > 0) {
        await updatePageMenuAssignments(page.id, locations);
        page.menuAssignments = locations;
        onMenuChanged();
      }

      setPages(prev => [...prev, page]);
      setNewTitle('');
      setNewToHeader(false);
      setNewToFooter(false);
      setShowNew(false);
      selectPage(page);
    } catch {
      setCreateError('Ошибка при создании. Проверьте подключение к серверу.');
    } finally {
      setCreating(false);
    }
  };

  const savePage = async () => {
    if (!selected) return;
    setSaving(true);
    setSaveError('');
    try {
      // Сохраняем контент страницы
      const updated = await updatePage(selected.id, selected);
      // Сохраняем привязки меню атомарно
      await updatePageMenuAssignments(selected.id, editAssignments);
      updated.menuAssignments = editAssignments;
      setPages(prev => prev.map(p => p.id === updated.id ? updated : p));
      setSelected(updated);
      onMenuChanged();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError('Ошибка сохранения.');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    if (selected) setEditAssignments([...(selected.menuAssignments || [])]);
    setSaveError('');
  };

  const removePage = async (id: number) => {
    if (!confirm('Удалить страницу?')) return;
    await deletePage(id);
    setPages(prev => prev.filter(p => p.id !== id));
    if (selected?.id === id) setSelected(null);
    onMenuChanged();
  };

  const toggleAssignment = (loc: PageMenuLocation) => {
    setEditAssignments(prev =>
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
  };

  return (
    <div className="p-6 flex gap-6 max-w-6xl">
      {/* List */}
      <div className="w-64 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <span className="font-body text-sm text-muted-foreground">{pages.length} страниц</span>
          <button onClick={() => { setShowNew(true); setSaved(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-white text-xs font-body hover:bg-foreground/80 transition-colors">
            <Icon name="Plus" size={12} />
            Создать
          </button>
        </div>

        <div className="space-y-1.5">
          {pages.map(page => (
            <div key={page.id} onClick={() => selectPage(page)}
              className={`flex items-center justify-between p-3 cursor-pointer border transition-colors ${
                selected?.id === page.id ? 'bg-white border-foreground' : 'bg-white border-border hover:border-foreground/30'
              }`}>
              <div className="min-w-0">
                <div className="font-body text-sm text-foreground truncate">{page.title}</div>
                <div className="font-body text-xs text-muted-foreground truncate">{page.slug}</div>
                <div className="flex gap-1 mt-1">
                  <span className="px-1.5 py-px text-[10px] font-body bg-blue-50 text-blue-700">
                    {TEMPLATES.find(t => t.id === page.template)?.label}
                  </span>
                  {page.menuAssignments?.includes('header') && (
                    <span className="px-1.5 py-px text-[10px] font-body bg-green-50 text-green-700">хедер</span>
                  )}
                  {page.menuAssignments?.includes('footer') && (
                    <span className="px-1.5 py-px text-[10px] font-body bg-amber-50 text-amber-700">футер</span>
                  )}
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); removePage(page.id); }}
                className="shrink-0 ml-2 p-1 text-muted-foreground hover:text-red-500 transition-colors">
                <Icon name="Trash2" size={12} />
              </button>
            </div>
          ))}
        </div>

        {showNew && (
          <div className="mt-4 bg-white border border-border p-4 space-y-3">
            <div className="text-xs font-body text-muted-foreground uppercase tracking-wide">Новая страница</div>
            <input autoFocus className="field-input" placeholder="Название"
              value={newTitle} onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPage()} />
            <select className="field-input" value={newTemplate}
              onChange={e => setNewTemplate(e.target.value as Page['template'])}>
              {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <div className="space-y-1.5">
              <div className="text-xs font-body text-muted-foreground uppercase tracking-wide">Добавить в меню</div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newToHeader} onChange={e => setNewToHeader(e.target.checked)} />
                <span className="font-body text-sm">Хедер</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newToFooter} onChange={e => setNewToFooter(e.target.checked)} />
                <span className="font-body text-sm">Футер</span>
              </label>
            </div>
            {createError && <p className="text-xs text-red-500 font-body">{createError}</p>}
            <div className="flex gap-2">
              <button onClick={addPage} disabled={creating || !newTitle.trim()}
                className="flex-1 py-2 bg-foreground text-white text-sm font-body hover:bg-foreground/80 disabled:opacity-50">
                {creating ? 'Создание...' : 'Создать'}
              </button>
              <button onClick={() => { setShowNew(false); setCreateError(''); }}
                className="px-3 border border-border text-sm font-body">✕</button>
            </div>
          </div>
        )}
      </div>

      {/* Editor */}
      {selected && (
        <div key={selected.id} className="flex-1 bg-white border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-2xl text-foreground">{selected.title}</h3>
            <div className="flex items-center gap-4">
              <span className="font-body text-xs text-muted-foreground uppercase tracking-wide">В меню:</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox"
                  checked={editAssignments.includes('header')}
                  onChange={() => toggleAssignment('header')} />
                <span className="font-body text-sm text-foreground">Хедер</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox"
                  checked={editAssignments.includes('footer')}
                  onChange={() => toggleAssignment('footer')} />
                <span className="font-body text-sm text-foreground">Футер</span>
              </label>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">Заголовок</div>
                <input className="field-input" value={selected.title}
                  onChange={e => setSelected({ ...selected, title: e.target.value })} />
              </div>
              <div>
                <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">URL (slug)</div>
                <input className="field-input" value={selected.slug}
                  onChange={e => setSelected({ ...selected, slug: e.target.value })} />
              </div>
            </div>

            <div>
              <div className="text-xs font-body text-muted-foreground mb-2 uppercase tracking-wide">Шаблон страницы</div>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map(t => (
                  <button key={t.id}
                    onClick={() => setSelected({ ...selected, template: t.id as Page['template'] })}
                    className={`p-3 text-left border transition-colors ${
                      selected.template === t.id ? 'border-foreground bg-foreground/5' : 'border-border hover:border-foreground/30'
                    }`}>
                    <div className="font-body text-sm font-medium text-foreground">{t.label}</div>
                    <div className="font-body text-xs text-muted-foreground mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">Контент</div>
              <RichEditor value={selected.content}
                onChange={content => setSelected({ ...selected, content })}
                placeholder="Введите текст страницы..." />
            </div>

            {saveError && <p className="text-xs text-red-500 font-body">{saveError}</p>}

            <div className="flex gap-3">
              <button onClick={savePage} disabled={saving}
                className="px-6 py-2.5 bg-foreground text-white text-sm font-body hover:bg-foreground/80 transition-colors disabled:opacity-50">
                {saving ? 'Сохранение...' : saved ? 'Сохранено ✓' : 'Сохранить'}
              </button>
              <button onClick={cancelEdit}
                className="px-6 py-2.5 border border-border text-sm font-body hover:border-foreground/40 transition-colors">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
