import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';

type Lead = {
  id: number;
  name: string;
  phone: string;
  message: string;
  source: string;
  processed: boolean;
  createdAt: string;
};

async function getLeads(): Promise<Lead[]> {
  const res = await fetch('/api/leads');
  return res.json();
}

async function patchLead(id: number, processed: boolean): Promise<Lead> {
  const res = await fetch(`/api/leads/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ processed }),
  });
  return res.json();
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function LeadsAdmin() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'done'>('all');

  useEffect(() => {
    getLeads().then(setLeads).finally(() => setLoading(false));
  }, []);

  const toggle = async (lead: Lead) => {
    const updated = await patchLead(lead.id, !lead.processed);
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
  };

  const filtered = leads.filter(l => {
    if (filter === 'new') return !l.processed;
    if (filter === 'done') return l.processed;
    return true;
  });

  const newCount = leads.filter(l => !l.processed).length;

  if (loading) return (
    <div className="p-6 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {newCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-body rounded-full">{newCount} новых</span>
          )}
        </div>
        <div className="flex gap-1">
          {(['all', 'new', 'done'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-body transition-colors border ${filter === f ? 'bg-foreground text-white border-foreground' : 'border-border text-muted-foreground hover:border-foreground/40'}`}>
              {f === 'all' ? 'Все' : f === 'new' ? 'Новые' : 'Обработанные'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 font-body text-muted-foreground text-sm">
          {filter === 'new' ? 'Нет новых заявок' : filter === 'done' ? 'Нет обработанных заявок' : 'Заявок пока нет'}
        </div>
      ) : (
        <div className="border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50 border-b border-border">
                <th className="w-10 px-4 py-3" />
                <th className="px-4 py-3 text-left text-xs font-body text-muted-foreground uppercase tracking-wide">Дата</th>
                <th className="px-4 py-3 text-left text-xs font-body text-muted-foreground uppercase tracking-wide">Имя</th>
                <th className="px-4 py-3 text-left text-xs font-body text-muted-foreground uppercase tracking-wide">Телефон</th>
                <th className="px-4 py-3 text-left text-xs font-body text-muted-foreground uppercase tracking-wide">Источник</th>
                <th className="px-4 py-3 text-left text-xs font-body text-muted-foreground uppercase tracking-wide">Сообщение</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={lead.id}
                  className={`border-b border-border last:border-0 transition-colors ${!lead.processed ? 'bg-amber-50 hover:bg-amber-50/80' : 'bg-white hover:bg-stone-50'}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={lead.processed}
                      onChange={() => toggle(lead)}
                      className="cursor-pointer"
                      title={lead.processed ? 'Снять отметку' : 'Отметить обработанным'}
                    />
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {!lead.processed && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                      <span className="font-body text-sm text-foreground font-medium">{lead.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`tel:${lead.phone}`} className="font-body text-sm text-foreground hover:underline">
                      {lead.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-body text-xs text-muted-foreground bg-stone-100 px-2 py-0.5">
                      {lead.source || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-muted-foreground max-w-xs">
                    <span className="line-clamp-2">{lead.message || '—'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
