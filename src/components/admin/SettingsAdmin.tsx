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
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadHeroImage = async (file: File) => {
    setUploading(true);
    try {
      const compressed = await compressImage(file, 1920);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const b64 = e.target?.result as string;
        const res = await fetch(UPLOAD_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: b64, fileName: compressed.name, contentType: compressed.type }),
        });
        const data = await res.json();
        if (data.ok) setDraft(d => ({ ...d, heroImage: data.url }));
        setUploading(false);
      };
      reader.readAsDataURL(compressed);
    } catch { setUploading(false); }
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
                  <div className="absolute top-2 right-2 text-xs font-body bg-black/50 text-white px-2 py-1">
                    текущий фон
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="px-4 py-2 border border-border text-sm font-body hover:border-foreground/40 transition-colors disabled:opacity-50">
                  {uploading ? 'Загрузка...' : draft.heroImage ? 'Заменить фото' : 'Загрузить фото'}
                </button>
                {draft.heroImage && (
                  <button type="button" onClick={() => setDraft(d => ({ ...d, heroImage: '' }))}
                    className="px-4 py-2 border border-red-200 text-red-600 text-sm font-body hover:bg-red-50 transition-colors">
                    Удалить
                  </button>
                )}
              </div>
              <p className="text-xs font-body text-muted-foreground">Рекомендуемый размер: 1920×1080 пикс. Сжимается автоматически.</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && uploadHeroImage(e.target.files[0])} />
            </div>
          </Field>
        </Section>

        <div className="border-t border-border" />

        <Section title="SEO">
          <Field label="Мета-описание сайта">
            <textarea className="field-input resize-none" rows={3} {...f('metaDescription')} />
          </Field>
        </Section>

        <div className="border-t border-border" />

        <Section title="Уведомления на email">
          <p className="font-body text-sm text-muted-foreground -mt-2">
            Заявки с формы контактов будут приходить на указанный адрес. SMTP_PASSWORD задаётся в настройках платформы (секреты).
          </p>
          <TwoCol>
            <Field label="Email для уведомлений">
              <input className="field-input" {...f('notificationEmail')} placeholder="info@granit-sever.ru" />
            </Field>
            <Field label="SMTP логин (отправитель)">
              <input className="field-input" {...f('smtpUser')} placeholder="noreply@granit-sever.ru" />
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