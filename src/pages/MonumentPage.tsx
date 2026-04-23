import { useState } from 'react';
import { Monument, SiteSettings } from '@/data/siteData';
import Icon from '@/components/ui/icon';

interface MonumentPageProps {
  monument: Monument;
  settings: SiteSettings;
  onBack: () => void;
}

const CONTACT_URL = 'https://functions.poehali.dev/164ed562-9538-47ed-9730-c9118fa2f14d';

export default function MonumentPage({ monument, settings, onBack }: MonumentPageProps) {
  const [activeImg, setActiveImg] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const images = monument.images?.length ? monument.images : [monument.image];

  const sendRequest = async () => {
    if (!name.trim() || !phone.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch(CONTACT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, message, monumentName: monument.name }),
      });
      const data = await res.json();
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      if (parsed.ok) { setStatus('sent'); setName(''); setPhone(''); setMessage(''); }
      else setStatus('error');
    } catch { setStatus('error'); }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top nav */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="ArrowLeft" size={16} />
            Назад в каталог
          </button>
          <div className="h-4 w-px bg-border" />
          <span className="font-body text-sm text-muted-foreground">{settings.companyName}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
          {/* Image gallery */}
          <div>
            <div className="aspect-[4/3] overflow-hidden bg-stone-100 mb-3 relative">
              <img
                src={images[activeImg]}
                alt={monument.name}
                className="w-full h-full object-cover"
              />
              {!monument.inStock && (
                <div className="absolute top-4 left-4 bg-amber-50 border border-amber-200 px-3 py-1">
                  <span className="font-body text-xs text-amber-700">Изготавливается под заказ</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 overflow-hidden border-2 transition-colors ${activeImg === i ? 'border-foreground' : 'border-border hover:border-foreground/40'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-6" style={{ background: 'hsl(214,60%,42%)' }} />
              <span className="text-xs font-body text-muted-foreground tracking-widest uppercase">{monument.style}</span>
            </div>
            <h1 className="font-display text-4xl font-light text-foreground mb-6">{monument.name}</h1>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Материал', value: monument.material },
                { label: 'Размеры (Ш×В×Г)', value: `${monument.width}×${monument.height}×${monument.depth} см` },
              ].map(spec => (
                <div key={spec.label} className="border border-border p-3">
                  <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">{spec.label}</div>
                  <div className="font-body text-sm text-foreground font-medium">{spec.value}</div>
                </div>
              ))}
            </div>

            {/* Price */}
            <div className="border border-border p-5 mb-6">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">Стоимость</div>
                  <div className="font-display text-4xl font-light text-foreground">
                    {monument.priceFrom && <span className="text-2xl text-muted-foreground mr-1">от</span>}
                    {monument.price.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
                {monument.installPrice > 0 && (
                  <div className="text-right">
                    <div className="text-xs font-body text-muted-foreground mb-1 uppercase tracking-wide">Установка</div>
                    <div className="font-body text-base text-muted-foreground">
                      от {monument.installPrice.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8">
              {monument.fullDescription || monument.description}
            </p>

            {/* Contact form */}
            <div className="border border-border p-6">
              <h3 className="font-display text-xl font-light text-foreground mb-4">Оставить заявку</h3>
              {status === 'sent' ? (
                <div className="flex items-center gap-3 py-4 text-green-700 font-body text-sm">
                  <Icon name="CheckCircle" size={18} />
                  Заявка отправлена! Мы свяжемся с вами в ближайшее время.
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ваше имя *"
                    className="field-input"
                  />
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Телефон *"
                    className="field-input"
                    type="tel"
                  />
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Дополнительные пожелания"
                    rows={2}
                    className="field-input resize-none"
                  />
                  <button
                    onClick={sendRequest}
                    disabled={status === 'sending' || !name.trim() || !phone.trim()}
                    className="w-full py-3 bg-foreground text-white font-body text-sm tracking-wide hover:bg-foreground/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'sending' ? 'Отправляем...' : 'Отправить заявку'}
                  </button>
                  {status === 'error' && (
                    <p className="text-red-500 text-xs font-body">Ошибка отправки. Позвоните нам: {settings.phone}</p>
                  )}
                  <p className="text-xs font-body text-muted-foreground">Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
