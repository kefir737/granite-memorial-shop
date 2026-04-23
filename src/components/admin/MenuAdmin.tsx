import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { MenuItem } from '@/data/siteData';

interface MenuAdminProps {
  menuItems: MenuItem[];
  onUpdate: (v: MenuItem[]) => void;
}

type MenuType = 'header' | 'footer';

export default function MenuAdmin({ menuItems, onUpdate }: MenuAdminProps) {
  const [items, setItems] = useState<MenuItem[]>([...menuItems].sort((a, b) => a.order - b.order));
  const [activeTab, setActiveTab] = useState<MenuType>('header');
  const [newLabel, setNewLabel] = useState('');
  const [newHref, setNewHref] = useState('#');
  const [newParentId, setNewParentId] = useState<number | null>(null);

  useEffect(() => {
    setItems([...menuItems].sort((a, b) => a.order - b.order));
  }, [menuItems.length]);

  const sync = (updated: MenuItem[]) => {
    setItems(updated);
    onUpdate(updated);
  };

  const byType = (type: MenuType) =>
    items.filter(i => i.menuType === type || (type === 'header' && !i.menuType));

  const topLevel = (type: MenuType) => byType(type).filter(i => !i.parentId);
  const children = (parentId: number) => items.filter(i => i.parentId === parentId);

  const toggle = (id: number) => sync(items.map(i => i.id === id ? { ...i, visible: !i.visible } : i));
  const updateLabel = (id: number, label: string) => sync(items.map(i => i.id === id ? { ...i, label } : i));
  const updateHref = (id: number, href: string) => sync(items.map(i => i.id === id ? { ...i, href } : i));
  const remove = (id: number) => sync(items.filter(i => i.id !== id && i.parentId !== id));

  const moveUp = (id: number) => {
    const typeItems = topLevel(activeTab);
    const idx = typeItems.findIndex(i => i.id === id);
    if (idx <= 0) return;
    const next = [...items];
    const a = next.findIndex(i => i.id === typeItems[idx].id);
    const b = next.findIndex(i => i.id === typeItems[idx - 1].id);
    [next[a].order, next[b].order] = [next[b].order, next[a].order];
    sync([...next]);
  };

  const moveDown = (id: number) => {
    const typeItems = topLevel(activeTab);
    const idx = typeItems.findIndex(i => i.id === id);
    if (idx >= typeItems.length - 1) return;
    const next = [...items];
    const a = next.findIndex(i => i.id === typeItems[idx].id);
    const b = next.findIndex(i => i.id === typeItems[idx + 1].id);
    [next[a].order, next[b].order] = [next[b].order, next[a].order];
    sync([...next]);
  };

  const addItem = () => {
    if (!newLabel.trim()) return;
    const next: MenuItem = {
      id: Date.now(),
      label: newLabel,
      href: newHref,
      order: items.length + 1,
      visible: true,
      menuType: activeTab,
      parentId: newParentId,
    };
    sync([...items, next]);
    setNewLabel('');
    setNewHref('#');
    setNewParentId(null);
  };

  const renderItem = (item: MenuItem, isChild = false) => {
    const childItems = children(item.id);
    return (
      <div key={item.id}>
        <div className={`bg-white border p-3 flex items-center gap-3 transition-colors ${item.visible ? 'border-border' : 'border-border opacity-50'} ${isChild ? 'ml-8 border-l-2 border-l-blue-200' : ''}`}>
          {!isChild && (
            <div className="flex flex-col gap-0.5">
              <button onClick={() => moveUp(item.id)} className="p-0.5 text-muted-foreground hover:text-foreground">
                <Icon name="ChevronUp" size={12} />
              </button>
              <button onClick={() => moveDown(item.id)} className="p-0.5 text-muted-foreground hover:text-foreground">
                <Icon name="ChevronDown" size={12} />
              </button>
            </div>
          )}
          {isChild && <Icon name="CornerDownRight" size={12} className="text-muted-foreground shrink-0" />}

          <div className="flex-1 grid grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] text-muted-foreground font-body mb-0.5">Название</div>
              <input
                className="field-input w-full"
                value={item.label}
                onChange={e => updateLabel(item.id, e.target.value)}
                placeholder="Каталог"
              />
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground font-body mb-0.5">Ссылка</div>
              <input
                className="field-input w-full"
                value={item.href}
                onChange={e => updateHref(item.id, e.target.value)}
                placeholder="#section или /page"
              />
            </div>
          </div>

          <button onClick={() => toggle(item.id)} className={`p-2 transition-colors ${item.visible ? 'text-foreground' : 'text-muted-foreground'}`}>
            <Icon name={item.visible ? 'Eye' : 'EyeOff'} size={14} />
          </button>
          <button onClick={() => remove(item.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors">
            <Icon name="Trash2" size={14} />
          </button>
        </div>
        {childItems.map(child => renderItem(child, true))}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-2xl">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {(['header', 'footer'] as MenuType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-body transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {tab === 'header' ? 'Хедер' : 'Футер'}
          </button>
        ))}
      </div>

      <p className="font-body text-sm text-muted-foreground mb-4">
        {activeTab === 'header' ? 'Навигация в шапке сайта' : 'Ссылки в подвале сайта'}
      </p>

      <div className="space-y-1.5 mb-6">
        {topLevel(activeTab).sort((a, b) => a.order - b.order).map(item => renderItem(item))}
      </div>

      {/* Add new */}
      <div className="bg-white border border-dashed border-border p-4">
        <div className="text-xs font-body text-muted-foreground mb-3 uppercase tracking-wide">Добавить пункт</div>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input className="field-input flex-1" value={newLabel} onChange={e => setNewLabel(e.target.value)}
              placeholder="Название" onKeyDown={e => e.key === 'Enter' && addItem()} />
            <input className="field-input w-40" value={newHref} onChange={e => setNewHref(e.target.value)}
              placeholder="#section или /page" />
          </div>
          <div className="flex gap-2 items-center">
            <select className="field-input flex-1 text-sm" value={newParentId ?? ''} onChange={e => setNewParentId(e.target.value ? Number(e.target.value) : null)}>
              <option value="">Верхний уровень</option>
              {topLevel(activeTab).map(i => <option key={i.id} value={i.id}>↳ под «{i.label}»</option>)}
            </select>
            <button onClick={addItem} className="px-4 py-2 bg-foreground text-white text-sm font-body hover:bg-foreground/80 transition-colors shrink-0">
              <Icon name="Plus" size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}