import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Monument } from '@/data/siteData';

interface MonumentsAdminProps {
  monuments: Monument[];
  onUpdate: (v: Monument[]) => void;
}

const EMPTY: Omit<Monument, 'id'> = {
  name: '',
  material: 'Чёрный гранит',
  style: 'Классический',
  price: 0,
  priceFrom: true,
  width: 60,
  height: 120,
  depth: 8,
  weight: 140,
  complexity: 'простой',
  image: 'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/b0b1004c-737e-475d-8c92-a90dd637541f.jpg',
  description: '',
  inStock: true,
};

const MATERIALS = ['Чёрный гранит', 'Карельский гранит', 'Габбро-диабаз', 'Белый мрамор'];
const STYLES = ['Классический', 'Арочный', 'Семейный', 'Религиозный', 'Эксклюзивный', 'Детский'];

export default function MonumentsAdmin({ monuments, onUpdate }: MonumentsAdminProps) {
  const [editing, setEditing] = useState<Monument | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Monument>({ id: 0, ...EMPTY });

  const startCreate = () => {
    setDraft({ id: Date.now(), ...EMPTY });
    setCreating(true);
    setEditing(null);
  };

  const startEdit = (m: Monument) => {
    setEditing({ ...m });
    setCreating(false);
  };

  const saveCreate = () => {
    if (!draft.name) return;
    onUpdate([...monuments, draft]);
    setCreating(false);
  };

  const saveEdit = () => {
    if (!editing) return;
    onUpdate(monuments.map(m => m.id === editing.id ? editing : m));
    setEditing(null);
  };

  const remove = (id: number) => {
    if (confirm('Удалить памятник?')) onUpdate(monuments.filter(m => m.id !== id));
  };

  const current = creating ? draft : editing;
  const setCurrent = creating
    ? (v: Monument) => setDraft(v)
    : (v: Monument) => setEditing(v);

  return (
    <div className="p-6 flex gap-6 max-w-7xl">
      {/* List */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <span className="font-body text-sm text-muted-foreground">{monuments.length} позиций</span>
          <button
            onClick={startCreate}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-white text-sm font-body hover:bg-foreground/80 transition-colors"
          >
            <Icon name="Plus" size={14} />
            Добавить
          </button>
        </div>

        <div className="space-y-2">
          {monuments.map(m => (
            <div
              key={m.id}
              className={`bg-white border p-4 flex items-center gap-4 cursor-pointer transition-colors ${
                editing?.id === m.id ? 'border-foreground' : 'border-border hover:border-foreground/30'
              }`}
              onClick={() => startEdit(m)}
            >
              <div className="w-14 h-14 bg-stone-100 shrink-0 overflow-hidden">
                <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-base text-foreground truncate">{m.name}</div>
                <div className="font-body text-xs text-muted-foreground mt-0.5">
                  {m.material} · {m.style} · {m.width}×{m.height} см · {m.weight} кг
                </div>
                <div className="font-body text-xs mt-1 flex items-center gap-2">
                  <span className="font-medium text-foreground">{m.price.toLocaleString('ru-RU')} ₽</span>
                  <span className={`px-1.5 py-0.5 text-[10px] ${m.inStock ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {m.inStock ? 'В наличии' : 'Под заказ'}
                  </span>
                  <span className={`px-1.5 py-0.5 text-[10px] ${
                    m.complexity === 'простой' ? 'bg-green-50 text-green-700' :
                    m.complexity === 'средний' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                  }`}>{m.complexity}</span>
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); remove(m.id); }}
                className="shrink-0 p-2 text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Icon name="Trash2" size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      {(creating || editing) && current && (
        <div className="w-80 shrink-0 bg-white border border-border p-5 h-fit sticky top-0 overflow-y-auto max-h-[calc(100vh-56px)]">
          <h3 className="font-display text-xl text-foreground mb-5">
            {creating ? 'Новый памятник' : 'Редактировать'}
          </h3>

          <div className="space-y-4">
            <Field label="Название">
              <input
                className="field-input"
                value={current.name}
                onChange={e => setCurrent({ ...current, name: e.target.value })}
                placeholder="Название памятника"
              />
            </Field>

            <Field label="Материал">
              <select
                className="field-input"
                value={current.material}
                onChange={e => setCurrent({ ...current, material: e.target.value })}
              >
                {MATERIALS.map(m => <option key={m}>{m}</option>)}
              </select>
            </Field>

            <Field label="Стиль">
              <select
                className="field-input"
                value={current.style}
                onChange={e => setCurrent({ ...current, style: e.target.value })}
              >
                {STYLES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>

            <Field label="Сложность">
              <select
                className="field-input"
                value={current.complexity}
                onChange={e => setCurrent({ ...current, complexity: e.target.value as Monument['complexity'] })}
              >
                <option value="простой">Простой</option>
                <option value="средний">Средний</option>
                <option value="сложный">Сложный</option>
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Цена (₽)">
                <input
                  type="number"
                  className="field-input"
                  value={current.price}
                  onChange={e => setCurrent({ ...current, price: Number(e.target.value) })}
                />
              </Field>
              <Field label="">
                <label className="flex items-center gap-2 mt-5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={current.priceFrom}
                    onChange={e => setCurrent({ ...current, priceFrom: e.target.checked })}
                  />
                  <span className="font-body text-sm text-foreground">от …</span>
                </label>
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Field label="Ширина (см)">
                <input type="number" className="field-input" value={current.width} onChange={e => setCurrent({ ...current, width: Number(e.target.value) })} />
              </Field>
              <Field label="Высота (см)">
                <input type="number" className="field-input" value={current.height} onChange={e => setCurrent({ ...current, height: Number(e.target.value) })} />
              </Field>
              <Field label="Глубина">
                <input type="number" className="field-input" value={current.depth} onChange={e => setCurrent({ ...current, depth: Number(e.target.value) })} />
              </Field>
            </div>

            <Field label="Вес (кг)">
              <input type="number" className="field-input" value={current.weight} onChange={e => setCurrent({ ...current, weight: Number(e.target.value) })} />
            </Field>

            <Field label="Описание">
              <textarea
                className="field-input resize-none"
                rows={3}
                value={current.description}
                onChange={e => setCurrent({ ...current, description: e.target.value })}
                placeholder="Описание памятника"
              />
            </Field>

            <Field label="URL изображения">
              <input
                className="field-input"
                value={current.image}
                onChange={e => setCurrent({ ...current, image: e.target.value })}
              />
            </Field>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={current.inStock}
                onChange={e => setCurrent({ ...current, inStock: e.target.checked })}
              />
              <span className="font-body text-sm text-foreground">Есть в наличии</span>
            </label>

            <div className="flex gap-2 pt-2">
              <button
                onClick={creating ? saveCreate : saveEdit}
                className="flex-1 py-2.5 bg-foreground text-white text-sm font-body hover:bg-foreground/80 transition-colors"
              >
                Сохранить
              </button>
              <button
                onClick={() => { setEditing(null); setCreating(false); }}
                className="px-4 py-2.5 border border-border text-sm font-body hover:bg-stone-50 transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">{label}</div>}
      {children}
    </div>
  );
}
