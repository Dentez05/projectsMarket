import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, Users, Package, Clock, LifeBuoy, Star, DollarSign } from 'lucide-react';
import { statsApi, type StatsSummary, type SalesPoint, type TopProject } from '../../api/stats';

const fmtMoney = (v: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(v);

const fmtNum = (v: number) => new Intl.NumberFormat('ru-RU').format(v);

export default function StatsTab() {
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [series, setSeries] = useState<SalesPoint[]>([]);
  const [top, setTop] = useState<TopProject[]>([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      statsApi.getSummary(),
      statsApi.getSales(days),
      statsApi.getTopProjects(10),
    ])
      .then(([s, sales, t]) => {
        setSummary(s);
        setSeries(sales.series);
        setTop(t);
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) {
    return <div className="text-white/40 py-12 text-center">Загрузка статистики…</div>;
  }
  if (error) {
    return <div className="text-red-400 py-12 text-center">{error}</div>;
  }

  const maxRevenue = Math.max(1, ...series.map(p => p.revenue));
  const maxOrders = Math.max(1, ...series.map(p => p.orders));
  const totalPeriodRevenue = series.reduce((a, p) => a + p.revenue, 0);
  const totalPeriodOrders = series.reduce((a, p) => a + p.orders, 0);

  const cards = summary
    ? [
        { icon: <ShoppingCart size={20} />, label: 'Заказов (доставлено)', value: fmtNum(summary.totalOrders) },
        { icon: <DollarSign size={20} />, label: 'Выручка', value: fmtMoney(summary.totalRevenue) },
        { icon: <Users size={20} />, label: 'Покупателей', value: fmtNum(summary.totalBuyers) },
        { icon: <Package size={20} />, label: 'Проектов', value: fmtNum(summary.totalProjects) },
        { icon: <Clock size={20} />, label: 'Ожидают оплаты', value: fmtNum(summary.pendingOrders) },
        { icon: <LifeBuoy size={20} />, label: 'Открытых тикетов', value: fmtNum(summary.openTickets) },
        { icon: <Star size={20} />, label: 'Ср. рейтинг', value: summary.avgRating ? `${summary.avgRating} ★ (${summary.reviewCount})` : '—' },
        { icon: <TrendingUp size={20} />, label: `Выручка за ${days} дн.`, value: fmtMoney(totalPeriodRevenue) },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* KPI-карточки */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map(c => (
          <div key={c.label} className="bg-[#232a3b] border border-[#2e3548] rounded-xl p-4">
            <div className="text-[#f97316] mb-2">{c.icon}</div>
            <div className="text-xl font-bold text-white">{c.value}</div>
            <div className="text-xs text-white/40 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* График продаж (CSS bars) */}
      <div className="bg-[#232a3b] border border-[#2e3548] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-white font-semibold">Динамика продаж</h3>
          <div className="flex gap-1.5">
            {[7, 14, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  days === d ? 'bg-[#f97316] text-white' : 'bg-[#2a3244] text-white/50 hover:bg-white/10'
                }`}
              >
                {d} дн.
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-white/40 mb-3">
          Заказов: {fmtNum(totalPeriodOrders)} · Выручка: {fmtMoney(totalPeriodRevenue)}
        </div>

        <div className="flex items-end gap-[2px] h-40" role="img" aria-label="График выручки по дням">
          {series.map(p => {
            const h = Math.round((p.revenue / maxRevenue) * 100);
            const oh = Math.round((p.orders / maxOrders) * 100);
            return (
              <div
                key={p.date}
                className="flex-1 min-w-[4px] group relative flex flex-col justify-end h-full"
                title={`${p.date}: ${fmtMoney(p.revenue)}, ${p.orders} зак.`}
              >
                <div
                  className="w-full bg-[#f97316]/70 rounded-t-sm group-hover:bg-[#f97316] transition-colors"
                  style={{ height: `${Math.max(h, p.revenue > 0 ? 4 : 0)}%` }}
                />
                {p.orders > 0 && (
                  <div
                    className="w-full bg-white/20 mt-[1px] rounded-b-sm"
                    style={{ height: `${Math.max(oh * 0.3, 2)}%` }}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-white/30 mt-2">
          <span>{series[0]?.date}</span>
          <span>{series[Math.floor(series.length / 2)]?.date}</span>
          <span>{series[series.length - 1]?.date}</span>
        </div>
      </div>

      {/* Топ проектов */}
      <div className="bg-[#232a3b] border border-[#2e3548] rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-[#2a3244] border-b border-[#2e3548]">
          <h3 className="text-white font-semibold text-sm">Топ проектов по выручке</h3>
        </div>
        {top.length === 0 ? (
          <div className="text-white/40 py-8 text-center text-sm">Пока нет продаж</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2e3548]">
                <th className="text-left px-5 py-2.5 text-xs text-white/40 uppercase">#</th>
                <th className="text-left px-5 py-2.5 text-xs text-white/40 uppercase">Проект</th>
                <th className="text-right px-5 py-2.5 text-xs text-white/40 uppercase">Продаж</th>
                <th className="text-right px-5 py-2.5 text-xs text-white/40 uppercase">Выручка</th>
              </tr>
            </thead>
            <tbody>
              {top.map((p, i) => (
                <tr key={p.projectId} className="border-b border-[#2e3548]/50 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-white/40 text-sm">{i + 1}</td>
                  <td className="px-5 py-3 text-white text-sm">{p.title}</td>
                  <td className="px-5 py-3 text-white/70 text-sm text-right">{fmtNum(p.sold)}</td>
                  <td className="px-5 py-3 text-[#f97316] font-medium text-sm text-right">{fmtMoney(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
