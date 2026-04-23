import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SiteSettings, MenuItem } from '@/data/siteData';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import Icon from '@/components/ui/icon';
import { Page } from '@/lib/api';
import ContactForm from '@/components/site/ContactForm';

interface Props {
  page: Page;
  settings: SiteSettings;
  menuItems: MenuItem[];
  onAdminClick: () => void;
}

const STEPS = [
  { icon: 'Phone', title: 'Консультация', desc: 'Обсуждаем пожелания, подбираем материал и форму', time: '1 день', docs: 'Свидетельство о смерти (копия)' },
  { icon: 'PenLine', title: 'Проект', desc: 'Создаём 3D-эскиз с гравировкой и утверждаем у вас', time: '2–3 дня', docs: 'Фото для портрета (если нужна гравировка)' },
  { icon: 'Hammer', title: 'Производство', desc: 'Изготавливаем памятник на собственном производстве', time: '14–30 дней', docs: '' },
  { icon: 'Truck', title: 'Доставка и установка', desc: 'Доставляем и устанавливаем с бетонированием и уборкой', time: '1 день', docs: 'Разрешение на установку (берём сами)' },
  { icon: 'ShieldCheck', title: 'Гарантия', desc: 'Даём письменную гарантию на материал и работы', time: 'До 5 лет', docs: '' },
];

const FAQS = [
  { q: 'Можно ли оплатить в рассрочку?', a: 'Да, работаем с рассрочкой 0% на 6–12 месяцев через партнёрские банки.' },
  { q: 'Работаете ли зимой?', a: 'Да, изготовление круглогодичное. Установку можно перенести на тёплый период.' },
  { q: 'Как ухаживать за гранитным памятником?', a: 'Достаточно протирать влажной тряпкой 1–2 раза в год. Гранит не требует специальной обработки.' },
  { q: 'Какая гарантия на памятник?', a: 'До 5 лет на материал и работу. Все условия прописываем в договоре.' },
  { q: 'Согласуете ли установку с администрацией кладбища?', a: 'Да, берём на себя все согласования, разрешения и вывоз грунта.' },
];

export default function OrderPage({ page, settings, menuItems, onAdminClick }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <Header menuItems={menuItems} settings={settings} onAdminClick={onAdminClick} />
      <main className="pt-16">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-xs font-body text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Главная</Link>
            <span>/</span>
            <span className="text-foreground">{page.title}</span>
          </div>
        </div>

        {/* Hero */}
        <div className="bg-foreground text-white py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="font-display text-5xl font-light mb-4">{page.title || 'Как заказать памятник'}</h1>
            <p className="font-body text-white/60 text-lg">Берём на себя все заботы — от эскиза до установки. Гарантируем сроки.</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="font-display text-3xl font-light text-foreground mb-12 text-center">5 шагов к готовому памятнику</h2>
          <div className="space-y-0">
            {STEPS.map((step, i) => (
              <div key={i} className="flex gap-6 pb-12 relative">
                {i < STEPS.length - 1 && (
                  <div className="absolute left-6 top-14 bottom-0 w-px bg-border" />
                )}
                <div className="w-12 h-12 shrink-0 bg-foreground flex items-center justify-center rounded-full z-10">
                  <Icon name={step.icon} size={18} className="text-white" />
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-display text-xl text-foreground">{step.title}</h3>
                    <span className="font-body text-xs text-muted-foreground border border-border px-2 py-0.5">{step.time}</span>
                  </div>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mb-2">{step.desc}</p>
                  {step.docs && (
                    <div className="flex items-center gap-2 text-xs font-body text-muted-foreground">
                      <Icon name="FileText" size={12} />
                      {step.docs}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* We handle */}
        <div className="bg-stone-50 py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="font-display text-3xl font-light text-foreground mb-8 text-center">Мы берём на себя</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Согласование с администрацией кладбища', 'Разрешение на установку', 'Вывоз грунта', 'Уборка после монтажа', 'Транспортировка', 'Гарантийное обслуживание'].map(item => (
                <div key={item} className="flex items-center gap-3 bg-white border border-border p-4">
                  <Icon name="CheckCircle" size={16} className="text-green-600 shrink-0" />
                  <span className="font-body text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="font-display text-3xl font-light text-foreground mb-8 text-center">Частые вопросы</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-border">
                <button
                  className="w-full flex items-center justify-between p-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-body text-sm text-foreground font-medium">{faq.q}</span>
                  <Icon name={openFaq === i ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground shrink-0 ml-4" />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 font-body text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-foreground text-white py-16">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="font-display text-3xl font-light mb-2">Начать бесплатный расчёт</h2>
            <p className="font-body text-white/60 mb-8">Ответим в течение 30 минут</p>
            <ContactForm settings={settings} dark />
            <a href={`tel:${settings.phone}`} className="mt-4 block font-body text-white/60 hover:text-white transition-colors">
              или позвоните: {settings.phone}
            </a>
          </div>
        </div>
      </main>
      <Footer settings={settings} menuItems={menuItems} />
    </div>
  );
}
