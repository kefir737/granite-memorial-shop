import { useState, useRef } from 'react';
import { SiteSettings } from '@/data/siteData';
import { compressImage } from '@/lib/compress';

const UPLOAD_URL = '/upload-image';

interface SettingsAdminProps {
  settings: SiteSettings;
  onUpdate: (v: SiteSettings) => void;
}

export default function SettingsAdmin({ settings, onUpdate }: SettingsAdminProps) {
  const [draft, setDraft] = useState({ ...settings });
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState<'hero' | 'og' | null>(null);
  const [showSmtpPwd, setShowSmtpPwd] = useState(false);
  const heroFileRef = useRef<HTMLInputElement>(null);
  const ogFileRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File, field: 'heroImage' | 'ogImage', slot: 'hero' | 'og') => {
    setUploading(slot);
    try {
      const maxW = slot === 'og' ? 1200 : 1920;
      const compressed = await compressImage(file, maxW);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const b64 = e.target?.result as string;
        const res = await fetch(UPLOAD_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: b64, fileName: compressed.name, contentType: compressed.type }),
        });
        const data = await res.json();
        if (data.ok) setDraft(d => ({ ...d, [field]: data.url }));
        setUploading(null);
      };
      reader.readAsDataURL(compressed);
    } catch { setUploading(null); }
  };

  const save = () => {
    onUpdate(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const f = (key: keyof SiteSettings) => ({
    value: draft[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft({ ...draft, [key]: e.target.value }),
  });

  const sitemapUrl = (draft.siteUrl || 'https://granit-sever.ru').replace(/\/$/, '') + '/sitemap.xml';

  return (
    <div className="p-6 max-w-2xl">
      <div className="bg-white border border-border p-6 space-y-6">

        <Section title="Контактные данные">
          <Field label="Название компании">
            <input className="field-input" {...f('companyName')} />
          </Field>
          <TwoCol>
            <Field label="Телефон (основной)">
              <input className="field-input" {...f('phone')} />
            </Field>
            <Field label="Телефон 2">
              <input className="field-input" {...f('phone2')} />
            </Field>
          </TwoCol>
          <Field label="Подпись под телефоном 2 (напр. «Мессенджеры»)">
            <input className="field-input" {...f('phone2Label')} placeholder="Мессенджеры" />
          </Field>
          <Field label="Email">
            <input className="field-input" {...f('email')} />
          </Field>
          <Field label="Адрес">
            <input className="field-input" {...f('address')} />
          </Field>
          <Field label="Часы работы">
            <input className="field-input" {...f('workHours')} />
          </Field>
        </Section>

        <div className="border-t border-border" />

        <Section title="Главная страница — Герой">
          <Field label="Заголовок">
            <input className="field-input" {...f('heroTitle')} />
          </Field>
          <Field label="Подзаголовок">
            <input className="field-input" {...f('heroSubtitle')} />
          </Field>
          <Field label="Фоновое изображение">
            <div className="space-y-2">
              {draft.heroImage && (
                <div className="relative w-full aspect-video overflow-hidden bg-stone-100 border border-border">
                  <img src={draft.heroImage} alt="Фон" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 text-xs font-body bg-black/50 text-white px-2 py-1">текущий фон</div>
                </div>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={() => heroFileRef.current?.click()} disabled={uploading === 'hero'}
                  className="px-4 py-2 border border-border text-sm font-body hover:border-foreground/40 transition-colors disabled:opacity-50">
                  {uploading === 'hero' ? 'Загрузка...' : draft.heroImage ? 'Заменить фото' : 'Загрузить фото'}
                </button>
                {draft.heroImage && (
                  <button type="button" onClick={() => setDraft(d => ({ ...d, heroImage: '' }))}
                    className="px-4 py-2 border border-red-200 text-red-600 text-sm font-body hover:bg-red-50 transition-colors">
                    Удалить
                  </button>
                )}
              </div>
              <p className="text-xs font-body text-muted-foreground">Рекомендуемый размер: 1920×1080 пикс. Сжимается автоматически.</p>
              <input ref={heroFileRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], 'heroImage', 'hero')} />
            </div>
          </Field>
        </Section>

        <div className="border-t border-border" />

        <Section title="SEO и социальные сети">
          <Field label="Заголовок страницы (title)">
            <input className="field-input" {...f('seoTitle')} placeholder="Гранит Север — Памятники из гранита" />
          </Field>
          <Field label="Мета-описание сайта (description)">
            <textarea className="field-input resize-none" rows={3} {...f('metaDescription')} />
          </Field>
          <Field label="URL сайта (для sitemap и OG-тегов)">
            <input className="field-input" {...f('siteUrl')} placeholder="https://granit-sever.ru" />
          </Field>
          <Field label="OG-изображение (превью при репосте в соцсетях, 1200×630)">
            <div className="space-y-2">
              {draft.ogImage && (
                <div className="relative w-full max-w-sm overflow-hidden bg-stone-100 border border-border">
                  <img src={draft.ogImage} alt="OG" className="w-full object-cover" style={{ aspectRatio: '1200/630' }} />
                  <div className="absolute top-2 right-2 text-xs font-body bg-black/50 text-white px-2 py-1">OG-изображение</div>
                </div>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={() => ogFileRef.current?.click()} disabled={uploading === 'og'}
                  className="px-4 py-2 border border-border text-sm font-body hover:border-foreground/40 transition-colors disabled:opacity-50">
                  {uploading === 'og' ? 'Загрузка...' : draft.ogImage ? 'Заменить' : 'Загрузить OG-фото'}
                </button>
                {draft.ogImage && (
                  <button type="button" onClick={() => setDraft(d => ({ ...d, ogImage: '' }))}
                    className="px-4 py-2 border border-red-200 text-red-600 text-sm font-body hover:bg-red-50 transition-colors">
                    Удалить
                  </button>
                )}
              </div>
              <input ref={ogFileRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], 'ogImage', 'og')} />
            </div>
          </Field>
          <div className="bg-stone-50 border border-border p-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-body text-muted-foreground uppercase tracking-wide mb-0.5">Карта сайта (sitemap.xml)</div>
              <a href={sitemapUrl} target="_blank" rel="noopener noreferrer"
                className="text-sm font-body text-blue-600 hover:underline">
                {sitemapUrl}
              </a>
            </div>
          </div>
        </Section>

        <div className="border-t border-border" />

        <Section title="Уведомления на email">
          <p className="font-body text-sm text-muted-foreground -mt-2">
            Заявки с формы контактов будут приходить на указанные адреса. Можно указать несколько через запятую.
          </p>
          <Field label="Email для уведомлений (через запятую)">
            <input className="field-input" {...f('notificationEmail')} placeholder="info@granit-sever.ru, director@granit-sever.ru" />
          </Field>
          <TwoCol>
            <Field label="SMTP логин (отправитель)">
              <input className="field-input" {...f('smtpUser')} placeholder="noreply@granit-sever.ru" />
            </Field>
            <Field label="SMTP пароль">
              <div className="relative">
                <input
                  className="field-input pr-10"
                  type={showSmtpPwd ? 'text' : 'password'}
                  {...f('smtpPassword')}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowSmtpPwd(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground">
                  {showSmtpPwd ? 'Скрыть' : 'Показать'}
                </button>
              </div>
            </Field>
          </TwoCol>
          <TwoCol>
            <Field label="SMTP сервер">
              <input className="field-input" {...f('smtpHost')} placeholder="smtp.yandex.ru" />
            </Field>
            <Field label="SMTP порт">
              <input className="field-input" {...f('smtpPort')} placeholder="465" />
            </Field>
          </TwoCol>
          <div className="bg-stone-50 border border-border p-4 text-xs font-body text-muted-foreground space-y-1">
            <div><b>Яндекс:</b> smtp.yandex.ru, порт 465</div>
            <div><b>Mail.ru:</b> smtp.mail.ru, порт 465</div>
            <div><b>Gmail:</b> smtp.gmail.com, порт 587</div>
          </div>
        </Section>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={save}
            className="px-6 py-3 bg-foreground text-white text-sm font-body hover:bg-foreground/80 transition-colors"
          >
            Сохранить изменения
          </button>
          {saved && (
            <span className="font-body text-sm text-green-600 animate-fade-in">Сохранено!</span>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="font-display text-xl text-foreground">{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">{label}</div>
      {children}
    </div>
  );
}

function TwoCol({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}
