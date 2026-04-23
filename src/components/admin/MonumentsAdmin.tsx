import { useState, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { Monument } from '@/data/siteData';

interface MonumentsAdminProps {
  monuments: Monument[];
  onUpdate: (v: Monument[]) => void;
}

const UPLOAD_URL = '/upload-image';

const EMPTY: Omit<Monument, 'id'> = {
  name: '',
  slug: '',
  material: 'Чёрный гранит',
  style: 'Классический',
  price: 0,
  priceFrom: true,
  installPrice: 8000,
  width: 60,
  height: 120,
  depth: 8,
  image: 'https://cdn.poehali.dev/projects/37badc84-9384-4d2b-8da3-56516f9e5627/files/b0b1004c-737e-475d-8c92-a90dd637541f.jpg',
  images: [],
  description: '',
  fullDescription: '',
  inStock: true,
};

const MATERIALS = ['Чёрный гранит', 'Карельский гранит', 'Габбро-диабаз', 'Белый мрамор'];
const STYLES = ['Классический', 'Арочный', 'Семейный', 'Религиозный', 'Эксклюзивный', 'Детский'];

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

export default function MonumentsAdmin({ monuments, onUpdate }: MonumentsAdminProps) {
  const [editing, setEditing] = useState<Monument | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Monument>({ id: 0, ...EMPTY });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const startCreate = () => {
    setDraft({ id: Date.now(), ...EMPTY });
    setCreating(true);
    setEditing(null);
    setUploadError('');
  };

  const startEdit = (m: Monument) => {
    setEditing({ ...m, images: m.images || [] });
    setCreating(false);
    setUploadError('');
  };

  const saveCreate = () => {
    if (!draft.name) return;
    const withSlug = { ...draft, slug: draft.slug || toSlug(draft.name), images: draft.images || [draft.image] };
    onUpdate([...monuments, withSlug]);
    setCreating(false);
  };

  const saveEdit = () => {
    if (!editing) return;
    const withSlug = { ...editing, slug: editing.slug || toSlug(editing.name), images: editing.images || [editing.image] };
    onUpdate(monuments.map(m => m.id === withSlug.id ? withSlug : m));
    setEditing(null);
  };

  const remove = (id: number) => {
    if (confirm('Удалить памятник?')) onUpdate(monuments.filter(m => m.id !== id));
  };

  const current = creating ? draft : editing;
  const setCurrent = (v: Monument) => creating ? setDraft(v) : setEditing(v);

  const uploadPhoto = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const b64 = e.target?.result as string;
        const res = await fetch(UPLOAD_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: b64, fileName: file.name, contentType: file.type }),
        });
        const parsed = await res.json();
        if (parsed.ok && current) {
          const imgs = [...(current.images || []), parsed.url];
          setCurrent({ ...current, image: current.image || parsed.url, images: imgs });
        } else {
          setUploadError(parsed.error || 'Ошибка загрузки');
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadError('Ошибка загрузки');
      setUploading(false);
    }
  };

  const removeImage = (idx: number) => {
    if (!current) return;
    const imgs = (current.images || []).filter((_, i) => i !== idx);
    const newMain = imgs[0] || '';
    setCurrent({ ...current, images: imgs, image: newMain });
  };

  const setMainImage = (url: string) => {
    if (!current) return;
    setCurrent({ ...current, image: url });
  };

  return (
    <div className="p-6 flex gap-6 max-w-7xl">
      {/* List */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <span className="font-body text-sm text-muted-foreground">{monuments.length} позиций</span>
          <button onClick={startCreate} className="flex items-center gap-2 px-4 py-2 bg-foreground text-white text-sm font-body hover:bg-foreground/80 transition-colors">
            <Icon name="Plus" size={14} />
            Добавить
          </button>
        </div>

        <div className="space-y-2">
          {monuments.map(m => (
            <div
              key={m.id}
              className={`bg-white border p-4 flex items-center gap-4 cursor-pointer transition-colors ${editing?.id === m.id ? 'border-foreground' : 'border-border hover:border-foreground/30'}`}
              onClick={() => startEdit(m)}
            >
              <div className="w-14 h-14 bg-stone-100 shrink-0 overflow-hidden">
                <img src={m.image} alt={m.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-base text-foreground truncate">{m.name}</div>
                <div className="font-body text-xs text-muted-foreground mt-0.5">
                  {m.material} · {m.style} · {m.width}×{m.height}×{m.depth} см
                </div>
                <div className="font-body text-xs mt-1 flex items-center gap-2">
                  <span className="font-medium text-foreground">{m.price.toLocaleString('ru-RU')} ₽</span>
                  {m.installPrice > 0 && <span className="text-muted-foreground">установка {m.installPrice.toLocaleString('ru-RU')} ₽</span>}
                  <span className={`px-1.5 py-0.5 text-[10px] ${m.inStock ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {m.inStock ? 'В наличии' : 'Под заказ'}
                  </span>
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); remove(m.id); }} className="shrink-0 p-2 text-muted-foreground hover:text-red-500 transition-colors">
                <Icon name="Trash2" size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      {(creating || editing) && current && (
        <div className="w-96 shrink-0 bg-white border border-border p-5 h-fit sticky top-0 overflow-y-auto max-h-[calc(100vh-56px)]">
          <h3 className="font-display text-xl text-foreground mb-5">
            {creating ? 'Новый памятник' : 'Редактировать'}
          </h3>

          <div className="space-y-4">
            <Field label="Название">
              <input className="field-input" value={current.name}
                onChange={e => {
                  const name = e.target.value;
                  setCurrent({ ...current, name, slug: toSlug(name) });
                }}
                placeholder="Название памятника" />
            </Field>

            <Field label="URL (slug)">
              <input className="field-input" value={current.slug}
                onChange={e => setCurrent({ ...current, slug: e.target.value })}
                placeholder="klassicheskaya-stela" />
              <p className="text-xs text-muted-foreground mt-1">Латинскими буквами через дефис. Используется в ссылке.</p>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Материал">
                <select className="field-input" value={current.material}
                  onChange={e => setCurrent({ ...current, material: e.target.value })}>
                  {MATERIALS.map(m => <option key={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Стиль">
                <select className="field-input" value={current.style}
                  onChange={e => setCurrent({ ...current, style: e.target.value })}>
                  {STYLES.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Цена (₽)">
                <input type="number" className="field-input" value={current.price}
                  onChange={e => setCurrent({ ...current, price: Number(e.target.value) })} />
              </Field>
              <Field label="Стоимость установки (₽)">
                <input type="number" className="field-input" value={current.installPrice}
                  onChange={e => setCurrent({ ...current, installPrice: Number(e.target.value) })} />
              </Field>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={current.priceFrom}
                onChange={e => setCurrent({ ...current, priceFrom: e.target.checked })} />
              <span className="font-body text-sm text-foreground">Цена указана «от»</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              <Field label="Ширина, см">
                <input type="number" className="field-input" value={current.width}
                  onChange={e => setCurrent({ ...current, width: Number(e.target.value) })} />
              </Field>
              <Field label="Высота, см">
                <input type="number" className="field-input" value={current.height}
                  onChange={e => setCurrent({ ...current, height: Number(e.target.value) })} />
              </Field>
              <Field label="Глубина, см">
                <input type="number" className="field-input" value={current.depth}
                  onChange={e => setCurrent({ ...current, depth: Number(e.target.value) })} />
              </Field>
            </div>

            <Field label="Краткое описание (для карточки)">
              <textarea className="field-input resize-none" rows={2} value={current.description}
                onChange={e => setCurrent({ ...current, description: e.target.value })}
                placeholder="1–2 предложения для карточки каталога" />
            </Field>

            <Field label="Полное описание (для страницы товара)">
              <textarea className="field-input resize-none" rows={4} value={current.fullDescription}
                onChange={e => setCurrent({ ...current, fullDescription: e.target.value })}
                placeholder="Подробное описание для страницы памятника" />
            </Field>

            {/* Image upload */}
            <div>
              <div className="text-xs font-body text-muted-foreground mb-2 uppercase tracking-wide">
                Фотографии
              </div>
              <div className="bg-stone-50 border border-dashed border-border p-4 text-center mb-3">
                <div className="text-xs font-body text-muted-foreground mb-1">
                  JPG, PNG или WebP · до 10 МБ<br/>
                  Рекомендуемый размер: <b>1200×900 px</b> (4:3), разрешение от 72 dpi
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={e => { if (e.target.files?.[0]) uploadPhoto(e.target.files[0]); e.target.value = ''; }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="mt-2 flex items-center gap-2 px-4 py-2 border border-border bg-white text-sm font-body text-foreground hover:border-foreground/40 transition-colors mx-auto disabled:opacity-50"
                >
                  <Icon name={uploading ? 'Loader2' : 'Upload'} size={14} />
                  {uploading ? 'Загружаем...' : 'Загрузить фото'}
                </button>
                {uploadError && <p className="text-red-500 text-xs mt-2 font-body">{uploadError}</p>}
              </div>

              {(current.images || []).length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {(current.images || []).map((img, i) => (
                    <div key={i} className={`relative group border-2 ${current.image === img ? 'border-foreground' : 'border-transparent'}`}>
                      <div className="aspect-square overflow-hidden bg-stone-100">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                        {current.image !== img && (
                          <button onClick={() => setMainImage(img)} className="text-white text-[10px] font-body bg-black/60 px-2 py-0.5">
                            Главное
                          </button>
                        )}
                        <button onClick={() => removeImage(i)} className="text-red-300 text-[10px] font-body bg-black/60 px-2 py-0.5">
                          Удалить
                        </button>
                      </div>
                      {current.image === img && (
                        <div className="absolute top-1 left-1 bg-foreground text-white text-[9px] px-1 font-body">Главное</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={current.inStock}
                onChange={e => setCurrent({ ...current, inStock: e.target.checked })} />
              <span className="font-body text-sm text-foreground">Есть в наличии</span>
            </label>

            <div className="flex gap-2 pt-2">
              <button onClick={creating ? saveCreate : saveEdit}
                className="flex-1 py-2.5 bg-foreground text-white text-sm font-body hover:bg-foreground/80 transition-colors">
                Сохранить
              </button>
              <button onClick={() => { setEditing(null); setCreating(false); }}
                className="px-4 py-2.5 border border-border text-sm font-body hover:bg-stone-50 transition-colors">
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