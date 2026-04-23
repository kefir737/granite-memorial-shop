import { useState, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { SiteSettings } from '@/data/siteData';

interface ContactsSectionProps {
  settings: SiteSettings;
}

const CONTACT_URL = '/contact';

function genCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, answer: a + b };
}

function applyPhoneMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^8/, '7').replace(/^7/, '');
  let result = '+7';
  if (digits.length === 0) return result;
  result += ' (';
  result += digits.slice(0, 3);
  if (digits.length < 3) return result;
  result += ') ';
  result += digits.slice(3, 6);
  if (digits.length < 6) return result;
  result += '-';
  result += digits.slice(6, 8);
  if (digits.length < 8) return result;
  result += '-';
  result += digits.slice(8, 10);
  return result;
}

export default function ContactsSection({ settings }: ContactsSectionProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [captcha, setCaptcha] = useState(genCaptcha);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);

  const refreshCaptcha = useCallback(() => {
    setCaptcha(genCaptcha());
    setCaptchaInput('');
    setCaptchaError(false);
  }, []);

  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(applyPhoneMask(e.target.value));
  };

  const isPhoneComplete = phone.replace(/\D/g, '').length === 11;

  const send = async () => {
    if (!name.trim() || !isPhoneComplete) return;
    if (parseInt(captchaInput) !== captcha.answer) {
      setCaptchaError(true);
      refreshCaptcha();
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(CONTACT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, message: msg }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus('sent');
        setName(''); setPhone(''); setMsg('');
        refreshCaptcha();
      } else setStatus('error');
    } catch { setStatus('error'); }
  };

  return (
    <section id="contacts" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8" style={{ background: 'hsl(214,60%,42%)' }} />
            <span className="text-xs font-body tracking-[0.3em] uppercase text-muted-foreground">Как нас найти</span>
          </div>
          <h2 className="font-display text-5xl font-light text-foreground">Контакты</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="space-y-5">
              {[
                { icon: 'Phone', label: 'Телефон', value: settings.phone, href: `tel:${settings.phone}` },
                { icon: 'Phone', label: settings.phone2Label || 'Мессенджеры', value: settings.phone2, href: `tel:${settings.phone2}` },
                { icon: 'Mail', label: 'Email', value: settings.email, href: `mailto:${settings.email}` },
                { icon: 'MapPin', label: 'Адрес', value: settings.address, href: undefined },
                { icon: 'Clock', label: 'Часы работы', value: settings.workHours, href: undefined },
              ].map(item => (
                <div key={item.label} className="flex gap-4 items-start">
                  <div className="w-9 h-9 border border-border flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name={item.icon} size={15} className="text-muted-foreground" />
                  </div>
                  <div>
                    <div className="text-xs font-body text-muted-foreground mb-0.5 uppercase tracking-wide">{item.label}</div>
                    {item.href ? (
                      <a href={item.href} className="font-body text-base text-foreground hover:underline transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="font-body text-base text-foreground">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-border p-6">
              <h3 className="font-display text-2xl font-light text-foreground mb-5">Оставить заявку</h3>
              {status === 'sent' ? (
                <div className="flex items-center gap-3 py-6 text-green-700 font-body text-sm">
                  <Icon name="CheckCircle" size={20} />
                  Заявка отправлена! Мы свяжемся с вами в ближайшее время.
                </div>
              ) : (
                <div className="space-y-3">
                  <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Ваше имя *"
                    className="w-full border border-border px-4 py-3 font-body text-sm focus:outline-none focus:border-foreground transition-colors bg-white" />

                  <input
                    value={phone}
                    onChange={handlePhone}
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    maxLength={18}
                    className={`w-full border px-4 py-3 font-body text-sm focus:outline-none focus:border-foreground transition-colors bg-white ${!phone || isPhoneComplete ? 'border-border' : 'border-orange-300'}`}
                  />

                  <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Ваш вопрос или пожелание" rows={3}
                    className="w-full border border-border px-4 py-3 font-body text-sm focus:outline-none focus:border-foreground transition-colors bg-white resize-none" />

                  {/* Капча */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-stone-50 border border-border px-4 py-3 select-none">
                      <span className="font-body text-sm text-foreground font-medium">{captcha.a} + {captcha.b} =</span>
                    </div>
                    <input
                      value={captchaInput}
                      onChange={e => { setCaptchaInput(e.target.value); setCaptchaError(false); }}
                      type="number"
                      placeholder="Ответ"
                      className={`w-24 border px-4 py-3 font-body text-sm focus:outline-none focus:border-foreground transition-colors bg-white ${captchaError ? 'border-red-400' : 'border-border'}`}
                    />
                    <button type="button" onClick={refreshCaptcha} title="Обновить" className="text-muted-foreground hover:text-foreground transition-colors">
                      <Icon name="RefreshCw" size={15} />
                    </button>
                  </div>
                  {captchaError && (
                    <p className="text-red-500 text-xs font-body">Неверный ответ, попробуйте снова</p>
                  )}

                  <button
                    onClick={send}
                    disabled={status === 'sending' || !name.trim() || !isPhoneComplete || !captchaInput}
                    className="w-full py-3 bg-foreground text-white font-body text-sm tracking-wide hover:bg-foreground/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'sending' ? 'Отправляем...' : 'Отправить заявку'}
                  </button>
                  {status === 'error' && (
                    <p className="text-red-500 text-xs font-body">Ошибка. Позвоните нам: {settings.phone}</p>
                  )}
                  <p className="text-xs font-body text-muted-foreground mt-3">
                    Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="h-full min-h-[400px] overflow-hidden border border-border">
            <iframe
              src="https://yandex.ru/map-widget/v1/?z=12&ol=biz&oid=229021828036"
              width="100%"
              height="100%"
              style={{ minHeight: '400px', border: 0, display: 'block' }}
              title="Карта"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
