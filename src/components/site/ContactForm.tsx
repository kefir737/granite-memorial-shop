import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { SiteSettings } from '@/data/siteData';

const CONTACT_URL = '/contact';

interface Props {
  settings: SiteSettings;
  dark?: boolean;
  monumentName?: string;
}

export default function ContactForm({ settings, dark, monumentName }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const inputCls = `w-full border px-4 py-3 font-body text-sm focus:outline-none transition-colors ${
    dark
      ? 'bg-white/10 border-white/20 text-white placeholder-white/40 focus:border-white/60'
      : 'border-border bg-white focus:border-foreground'
  }`;

  const send = async () => {
    if (!name.trim() || !phone.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch(CONTACT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, message: msg, monumentName }),
      });
      const data = await res.json();
      if (data.ok) { setStatus('sent'); setName(''); setPhone(''); setMsg(''); }
      else setStatus('error');
    } catch { setStatus('error'); }
  };

  if (status === 'sent') {
    return (
      <div className={`flex items-center justify-center gap-3 py-6 font-body text-sm ${dark ? 'text-white/80' : 'text-green-700'}`}>
        <Icon name="CheckCircle" size={18} />
        Заявка отправлена! Свяжемся с вами в ближайшее время.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Ваше имя *" className={inputCls} />
      <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="Телефон *" className={inputCls} />
      <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Пожелания" rows={2}
        className={`${inputCls} resize-none`} />
      <button onClick={send} disabled={status === 'sending' || !name.trim() || !phone.trim()}
        className="w-full py-3 bg-foreground text-white font-body text-sm hover:bg-foreground/80 transition-colors disabled:opacity-50">
        {status === 'sending' ? 'Отправляем...' : 'Отправить заявку'}
      </button>
      {status === 'error' && (
        <p className={`text-xs font-body ${dark ? 'text-red-300' : 'text-red-500'}`}>
          Ошибка. Позвоните нам: {settings.phone}
        </p>
      )}
      <p className={`text-xs font-body ${dark ? 'text-white/30' : 'text-muted-foreground'}`}>
        Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
      </p>
    </div>
  );
}
