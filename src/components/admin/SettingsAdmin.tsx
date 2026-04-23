import { useState } from 'react';
import { SiteSettings } from '@/data/siteData';

interface SettingsAdminProps {
  settings: SiteSettings;
  onUpdate: (v: SiteSettings) => void;
}

export default function SettingsAdmin({ settings, onUpdate }: SettingsAdminProps) {
  const [draft, setDraft] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

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
            <Field label="Телефон (8-800)">
              <input className="field-input" {...f('phone2')} />
            </Field>
          </TwoCol>
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