import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { MenuItem } from '@/data/siteData';

interface MenuAdminProps {
  menuItems: MenuItem[];
  onUpdate: (v: MenuItem[]) => void;
}

export default function MenuAdmin({ menuItems, onUpdate }: MenuAdminProps) {
  const [items, setItems] = useState([...menuItems].sort((a, b) => a.order - b.order));
  const [newLabel, setNewLabel] = useState('');
  const [newHref, setNewHref] = useState('#');

  const sync = (updated: MenuItem[]) => {
    setItems(updated);
    onUpdate(updated);
  };

  const toggle = (id: number) => {
    sync(items.map(i => i.id === id ? { ...i, visible: !i.visible } : i));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    const reordered = next.map((item, i) => ({ ...item, order: i + 1 }));
    sync(reordered);
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    const reordered = next.map((item, i) => ({ ...item, order: i + 1 }));
    sync(reordered);
  };

  const updateLabel = (id: number, label: string) => {
    sync(items.map(i => i.id === id ? { ...i, label } : i));
  };

  const updateHref = (id: number, href: string) => {
    sync(items.map(i => i.id === id ? { ...i, href } : i));
  };

  const remove = (id: number) => {
    sync(items.filter(i => i.id !== id));
  };

  const addItem = () => {
    if (!newLabel.trim()) return;
    const next: MenuItem = {
      id: Date.now(),
      label: newLabel,
      href: newHref,
      order: items.length + 1,
      visible: true,
    };
    sync([...items, next]);
    setNewLabel('');
    setNewHref('#');
  };

  return (
    <div className="p-6 max-w-2xl">
      <p className="font-body text-sm text-muted-foreground mb-6">
        Перетащите пункты для изменения порядка. Скрытые пункты не отображаются в навигации сайта.
      </p>

      <div className="space-y-2 mb-6">
        {items.map((item, i) => (
          <div key={item.id} className={`bg-white border p-4 flex items-center gap-3 transition-colors ${item.visible ? 'border-border' : 'border-border opacity-50'}`}>
            <div className="flex flex-col gap-0.5">
              <button onClick={() => moveUp(i)} className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20" disabled={i === 0}>
                <Icon name="ChevronUp" size={14} />
              </button>
              <button onClick={() => moveDown(i)} className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20" disabled={i === items.length - 1}>
                <Icon name="ChevronDown" size={14} />
              </button>
            </div>

            <div className="w-6 h-6 flex items-center justify-center border border-border text-xs font-body text-muted-foreground shrink-0">
              {item.order}
            </div>

            <div className="flex-1 flex gap-2">
              <input
                className="field-input flex-1"
                value={item.label}
                onChange={e => updateLabel(item.id, e.target.value)}
                placeholder="Название пункта"
              />
              <input
                className="field-input w-36"
                value={item.href}
                onChange={e => updateHref(item.id, e.target.value)}
                placeholder="#section"
              />
            </div>

            <button
              onClick={() => toggle(item.id)}
              className={`p-2 transition-colors ${item.visible ? 'text-foreground' : 'text-muted-foreground'}`}
              title={item.visible ? 'Скрыть' : 'Показать'}
            >
              <Icon name={item.visible ? 'Eye' : 'EyeOff'} size={15} />
            </button>
            <button onClick={() => remove(item.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors">
              <Icon name="Trash2" size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add new */}
      <div className="bg-white border border-dashed border-border p-4">
        <div className="text-xs font-body text-muted-foreground mb-3 uppercase tracking-wide">Добавить пункт меню</div>
        <div className="flex gap-2">
          <input
            className="field-input flex-1"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="Название"
            onKeyDown={e => e.key === 'Enter' && addItem()}
          />
          <input
            className="field-input w-36"
            value={newHref}
            onChange={e => setNewHref(e.target.value)}
            placeholder="#section"
          />
          <button
            onClick={addItem}
            className="px-4 py-2 bg-foreground text-white text-sm font-body hover:bg-foreground/80 transition-colors shrink-0"
          >
            <Icon name="Plus" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
