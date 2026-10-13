import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, ToggleLeft, ToggleRight, Percent, DollarSign } from 'lucide-react';
import { promoCodesApi } from '../../api/promoCodes';
import type { ApiPromoCode } from '../../api/types';

export default function PromoCodesTab() {
  const [codes, setCodes] = useState<ApiPromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'Percent' | 'Fixed'>('Percent');
  const [value, setValue] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    promoCodesApi.getAll().then(setCodes).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const created = await promoCodesApi.create({
        code: code.trim(),
        type,
        value: Number(value),
        minOrderAmount: minAmount ? Number(minAmount) : undefined,
        maxUses: maxUses ? Number(maxUses) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });
      setCodes(prev => [created, ...prev]);
      setShowForm(false);
      setCode(''); setValue(''); setMinAmount(''); setMaxUses(''); setExpiresAt('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Не удалось создать промокод');
    }
    setSaving(false);
  };

  const toggleActive = async (p: ApiPromoCode) => {
    try {
      const updated = await promoCodesApi.update(p.id, { isActive: !p.isActive });
      setCodes(prev => prev.map(c => c.id === p.id ? updated : c));
    } catch {}
  };

  const remove = async (p: ApiPromoCode) => {
    if (!confirm(`Удалить промокод ${p.code}?`)) return;
    try {
      await promoCodesApi.remove(p.id);
      setCodes(prev => prev.filter(c => c.id !== p.id));
    } catch {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <Tag size={18} className="text-[#f97316]" /> Промокоды
        </h2>
        <button onClick={() => setShowForm(v => !v)}
          className="btn-primary flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm rounded-lg">
          <Plus size={14} /> {showForm ? 'Скрыть' : 'Создать'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 p-4 sm:p-5 bg-[#232a3b] border border-[#2e3548] rounded-xl sm:rounded-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1">Код</label>
              <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} required placeholder="SALE10"
                className="w-full px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 uppercase" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Тип</label>
              <select value={type} onChange={e => setType(e.target.value as 'Percent' | 'Fixed')}
                className="w-full px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#f97316]/30">
                <option value="Percent">Процент (%)</option>
                <option value="Fixed">Фикс (₽)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">{type === 'Percent' ? 'Скидка, %' : 'Скидка, ₽'}</label>
              <input type="number" min="0.01" step="0.01" value={value} onChange={e => setValue(e.target.value)} required placeholder={type === 'Percent' ? '10' : '500'}
                className="w-full px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Мин. сумма, ₽ (необяз.)</label>
              <input type="number" min="0" value={minAmount} onChange={e => setMinAmount(e.target.value)} placeholder="1000"
                className="w-full px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Лимит использований (необяз.)</label>
              <input type="number" min="1" value={maxUses} onChange={e => setMaxUses(e.target.value)} placeholder="100"
                className="w-full px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Действует до (необяз.)</label>
              <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#f97316]/30" />
            </div>
          </div>
          {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
          <button type="submit" disabled={saving}
            className="btn-primary mt-4 px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
            {saving ? 'Создаём…' : 'Создать промокод'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-7 h-7 border-2 border-white/20 border-t-[#f97316] rounded-full animate-spin" />
        </div>
      ) : codes.length === 0 ? (
        <div className="bg-[#232a3b] border border-[#2e3548] rounded-xl sm:rounded-2xl p-8 text-center">
          <Tag size={28} className="mx-auto text-white/15 mb-3" />
          <p className="text-white/40 text-sm">Промокодов пока нет</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {codes.map(p => (
            <div key={p.id}
              className={`bg-[#232a3b] border border-[#2e3548] rounded-xl sm:rounded-2xl p-4 flex flex-wrap items-center gap-3 sm:gap-4 ${!p.isActive ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-2 min-w-0">
                {p.type === 'Percent'
                  ? <Percent size={15} className="text-[#f97316] shrink-0" />
                  : <DollarSign size={15} className="text-[#f97316] shrink-0" />}
                <span className="font-bold text-white font-mono text-sm sm:text-base">{p.code}</span>
              </div>
              <span className="text-xs sm:text-sm text-white/60">
                {p.type === 'Percent' ? `${p.value}%` : `${p.value.toLocaleString('ru-RU')} ₽`}
              </span>
              {p.minOrderAmount != null && (
                <span className="text-xs text-white/30">от {p.minOrderAmount.toLocaleString('ru-RU')} ₽</span>
              )}
              <span className="text-xs text-white/30">
                {p.usedCount}{p.maxUses != null ? ` / ${p.maxUses}` : ''} использований
              </span>
              {p.expiresAt && (
                <span className="text-xs text-white/30">до {new Date(p.expiresAt).toLocaleDateString('ru-RU')}</span>
              )}
              <span className={`ml-auto px-2 py-0.5 text-[10px] font-semibold rounded-full ${p.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/40'}`}>
                {p.isActive ? 'Активен' : 'Отключён'}
              </span>
              <div className="flex gap-1.5">
                <button onClick={() => toggleActive(p)} title={p.isActive ? 'Отключить' : 'Включить'}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
                  {p.isActive ? <ToggleRight size={16} className="text-emerald-400" /> : <ToggleLeft size={16} />}
                </button>
                <button onClick={() => remove(p)} title="Удалить"
                  className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
