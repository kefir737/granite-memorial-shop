import { useState, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { GraniteType } from '@/data/siteData';
import { updateGraniteType } from '@/lib/api';
import { compressImage } from '@/lib/compress';

const UPLOAD_URL = '/upload-image';

interface Props {
  graniteTypes: GraniteType[];
  onUpdate: (v: GraniteType[]) => void;
}

export default function GraniteAdmin({ graniteTypes, onUpdate }: Props) {
  const [selected, setSelected] = useState<GraniteType | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    const updated = await updateGraniteType(selected.id, { ...selected, sortOrder: graniteTypes.findIndex(g => g.id === selected.id) });
    const newList = graniteTypes.map(g => g.id === updated.id ? { ...updated } : g);
    onUpdate(newList);
    setSelected({ ...updated });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const uploadPhoto = async (file: File) => {
    if (!file || !selected) return;
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
        if (data.ok) setSelected({ ...selected, image: data.url });
        setUploading(false);
      };
      reader.readAsDataURL(compressed);
    } catch {
      setUploading(false);
    }
  };

  const onDragStart = (idx: number) => setDragIdx(idx);
  const onDragOver = async (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === idx) return;
    const reordered = [...graniteTypes];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, moved);
    setDragIdx(idx);
    onUpdate(reordered);
  };
  const onDragEnd = async () => {
    setDragIdx(null);
    await Promise.all(graniteTypes.map((g, i) => updateGraniteType(g.id, { ...g, sortOrder: i })));
  };

  return (
    <div className="p-6 flex gap-6 max-w-6xl">
      {/* List */}
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <span className="font-body text-sm text-muted-foreground">{graniteTypes.length} видов гранита</span>
        </div>

        <div className="space-y-2">
          {graniteTypes.map((g, idx) => (
            <div
              key={g.id}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragOver={e => onDragOver(e, idx)}
              onDragEnd={onDragEnd}
              onClick={() => setSelected({ ...g })}
              className={`bg-white border p-4 flex items-center gap-4 cursor-pointer transition-colors ${
                selected?.id === g.id ? 'border-foreground' : 'border-border hover:border-foreground/30'
              } ${dragIdx === idx ? 'opacity-50' : ''}`}
            >
              <Icon name="GripVertical" size={14} className="text-muted-foreground shrink-0 cursor-grab" />
              <div className="w-14 h-14 bg-stone-100 shrink-0 overflow-hidden">
                {g.image
                  ? <img src={g.image} alt={g.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Icon name="Image" size={20} className="text-stone-300" /></div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-base text-foreground">{g.name}</div>
                <div className="font-body text-xs text-muted-foreground mt-0.5">{g.origin} · {g.hardness}</div>
                <p className="font-body text-xs text-muted-foreground mt-1 line-clamp-1">{g.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      {selected && (
        <div className="w-80 shrink-0 bg-white border border-border p-5 h-fit sticky top-0">
          <h3 className="font-display text-xl text-foreground mb-5">Редактировать</h3>

          <div className="space-y-4">
            {/* Photo */}
            <div>
              <div className="text-xs font-body text-muted-foreground mb-2 uppercase tracking-wide">Фото</div>
              <div
                className="relative w-full aspect-video bg-stone-50 border border-dashed border-border flex items-center justify-center cursor-pointer hover:border-foreground/40 transition-colors overflow-hidden"
                onClick={() => fileRef.current?.click()}
              >
                {selected.image
                  ? <img src={selected.image} alt="" className="w-full h-full object-cover" />
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
            </div>

            <div>
              <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">Название</div>
              <input className="field-input" value={selected.name}
                onChange={e => setSelected({ ...selected, name: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">Происхождение</div>
                <input className="field-input" value={selected.origin}
                  onChange={e => setSelected({ ...selected, origin: e.target.value })} />
              </div>
              <div>
                <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">Цвет</div>
                <input className="field-input" value={selected.color}
                  onChange={e => setSelected({ ...selected, color: e.target.value })} />
              </div>
            </div>

            <div>
              <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">Твёрдость</div>
              <input className="field-input" value={selected.hardness}
                onChange={e => setSelected({ ...selected, hardness: e.target.value })} />
            </div>

            <div>
              <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">Описание</div>
              <textarea className="field-input resize-none" rows={4} value={selected.description}
                onChange={e => setSelected({ ...selected, description: e.target.value })} />
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