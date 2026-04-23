import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { Portfolio } from '@/data/siteData';
import { getPortfolio, createPortfolioItem, updatePortfolioItem, deletePortfolioItem } from '@/lib/api';
import { compressImage } from '@/lib/compress';

const MATERIALS = ['Чёрный гранит', 'Карельский гранит', 'Габбро-диабаз', 'Белый мрамор'];
const UPLOAD_URL = '/upload-image';

const EMPTY: Omit<Portfolio, 'id'> = { title: '', material: 'Чёрный гранит', image: '', year: new Date().getFullYear() };

export default function PortfolioAdmin() {
  const [items, setItems] = useState<Portfolio[]>([]);
  const [selected, setSelected] = useState<Portfolio | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Portfolio>({ id: 0, ...EMPTY });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getPortfolio().then(setItems).catch(() => setItems([]));
  }, []);

  const current = creating ? draft : selected;
  const setCurrent = (v: Portfolio) => creating ? setDraft(v) : setSelected(v);

  const uploadPhoto = async (file: File) => {
    if (!file || !current) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const b64 = e.target?.result as string;
        const res = await fetch(UPLOAD_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: b64, fileName: compressed.name, contentType: compressed.type }),
        });
        const data = await res.json();
        if (data.ok) setCurrent({ ...current, image: data.url });
        setUploading(false);
      };
      reader.readAsDataURL(compressed);
    } catch {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!current) return;
    setSaving(true);
    if (creating) {
      const created = await createPortfolioItem({ title: current.title, material: current.material, image: current.image, year: current.year });
      setItems([...items, created]);
      setCreating(false);
      setSelected(created);
    } else {
      const updated = await updatePortfolioItem(current.id, current);
      setItems(items.map(p => p.id === updated.id ? updated : p));
      setSelected(updated);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const remove = async (id: number) => {
    if (!confirm('Удалить работу из портфолио?')) return;
    await deletePortfolioItem(id);
    setItems(items.filter(p => p.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const startCreate = () => {
    setDraft({ id: 0, ...EMPTY });
    setCreating(true);
    setSelected(null);
  };

  // Drag-and-drop reorder
  const onDragStart = (idx: number) => setDragIdx(idx);
  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const reordered = [...items];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, moved);
    setDragIdx(idx);
    setItems(reordered);
  };
  const onDragEnd = async () => {
    setDragIdx(null);
    await Promise.all(items.map((item, i) => updatePortfolioItem(item.id, { ...item, year: item.year })));
  };

  return (
    <div className="p-6 flex gap-6 max-w-6xl">
      {/* List */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <span className="font-body text-sm text-muted-foreground">{items.length} работ</span>
          <button onClick={startCreate} className="flex items-center gap-2 px-4 py-2 bg-foreground text-white text-sm font-body hover:bg-foreground/80 transition-colors">
            <Icon name="Plus" size={14} />
            Добавить
          </button>
        </div>

        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={e => onDragOver(e, idx)}
              onDragEnd={onDragEnd}
              onClick={() => { setSelected(item); setCreating(false); }}
              className={`bg-white border p-4 flex items-center gap-4 cursor-pointer transition-colors ${
                selected?.id === item.id ? 'border-foreground' : 'border-border hover:border-foreground/30'
              } ${dragIdx === idx ? 'opacity-50' : ''}`}
            >
              <Icon name="GripVertical" size={14} className="text-muted-foreground shrink-0 cursor-grab" />
              <div className="w-14 h-14 bg-stone-100 shrink-0 overflow-hidden">
                {item.image
                  ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Icon name="Image" size={20} className="text-stone-300" /></div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-base text-foreground truncate">{item.title}</div>
                <div className="font-body text-xs text-muted-foreground mt-0.5">{item.material} · {item.year}</div>
              </div>
              <button onClick={e => { e.stopPropagation(); remove(item.id); }} className="shrink-0 p-2 text-muted-foreground hover:text-red-500 transition-colors">
                <Icon name="Trash2" size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      {(creating || selected) && current && (
        <div className="w-80 shrink-0 bg-white border border-border p-5 h-fit sticky top-0">
          <h3 className="font-display text-xl text-foreground mb-5">
            {creating ? 'Новая работа' : 'Редактировать'}
          </h3>

          <div className="space-y-4">
            {/* Photo upload */}
            <div>
              <div className="text-xs font-body text-muted-foreground mb-2 uppercase tracking-wide">Фото</div>
              <div
                className="relative w-full aspect-square bg-stone-50 border border-dashed border-border flex items-center justify-center cursor-pointer hover:border-foreground/40 transition-colors overflow-hidden"
                onClick={() => fileRef.current?.click()}
              >
                {current.image
                  ? <img src={current.image} alt="" className="w-full h-full object-cover" />
                  : <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Icon name="Upload" size={24} />
                      <span className="font-body text-xs">Загрузить фото</span>
                    </div>
                }
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Icon name="Loader2" size={24} className="animate-spin text-foreground" />
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
              {current.image && (
                <button onClick={() => setCurrent({ ...current, image: '' })}
                  className="mt-1 text-xs font-body text-muted-foreground hover:text-red-500">
                  Удалить фото
                </button>
              )}
            </div>

            <div>
              <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">Название</div>
              <input className="field-input" value={current.title}
                onChange={e => setCurrent({ ...current, title: e.target.value })}
                placeholder="Семейный мемориал" />
            </div>

            <div>
              <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">Материал</div>
              <select className="field-input" value={current.material}
                onChange={e => setCurrent({ ...current, material: e.target.value })}>
                {MATERIALS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">Год</div>
              <input type="number" className="field-input" value={current.year}
                onChange={e => setCurrent({ ...current, year: Number(e.target.value) })} />
            </div>

            <button onClick={save} disabled={saving || uploading}
              className="w-full py-2.5 bg-foreground text-white text-sm font-body hover:bg-foreground/80 transition-colors disabled:opacity-50">
              {saving ? 'Сохранение...' : saved ? 'Сохранено ✓' : 'Сохранить'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}