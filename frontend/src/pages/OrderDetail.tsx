import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Download, Package } from 'lucide-react';
import { ordersApi } from '../api/orders';
import { paymentsApi } from '../api/payments';
import { useApp } from '../store/AppContext';
import { downloadOrderFiles } from '../utils/downloadOrder';
import type { ApiOrder } from '../api/types';
import { useSeo } from '../utils/seo';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  Pending: { label: 'Ожидает оплаты', color: 'text-amber-400 bg-amber-500/10' },
  Delivered: { label: 'Доставлен', color: 'text-green-400 bg-green-500/10' },
  Cancelled: { label: 'Отменён', color: 'text-red-400 bg-red-500/10' },
};

export default function OrderDetail() {
  const { id } = useParams();
  const orderId = Number(id) || 0;
  const { user, authReady } = useApp();
  const navigate = useNavigate();

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [paying, setPaying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useSeo({ title: `Заказ №${orderId}`, noindex: true });

  useEffect(() => {
    if (!authReady || !user) return;
    setLoading(true);
    ordersApi.getById(orderId)
      .then(data => setOrder(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [orderId, user, authReady]);

  if (!authReady || !user) {
    return (
      <div className="pt-14 sm:pt-20 lg:pt-24 flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/20 border-t-[#f97316] rounded-full animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-14 sm:pt-20 lg:pt-24 flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/20 border-t-[#f97316] rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="pt-14 sm:pt-20 lg:pt-24">
        <div className="section-dark py-12 sm:py-16 lg:py-24">
          <div className="max-w-lg mx-auto px-4 text-center relative z-10">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-3">Заказ не найден</h1>
            <p className="text-white/40 text-sm sm:text-base mb-6">Возможно, он принадлежит другому пользователю</p>
            <Link to="/profile" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium">
              <ArrowLeft size={15} /> В личный кабинет
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const s = STATUS_LABELS[order.status];

  const handlePay = async () => {
    setPaying(true);
    try {
      const { confirmationUrl } = await paymentsApi.create(order.id);
      window.open(confirmationUrl, '_blank');
    } catch {}
    setPaying(false);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadOrderFiles(order.id);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="pt-14 sm:pt-20 lg:pt-24">
      <div className="section-dark py-6 sm:py-8 lg:py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <button onClick={() => navigate('/profile')} className="flex items-center gap-1.5 text-xs sm:text-sm text-white/40 hover:text-[#f97316] transition-colors mb-3">
            <ArrowLeft size={14} /> Личный кабинет
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Заказ {order.orderNumber}</h1>
            {s && <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${s.color}`}>{s.label}</span>}
          </div>
          <p className="text-xs sm:text-sm text-white/30 mt-1">
            {new Date(order.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-[#232a3b] rounded-xl sm:rounded-2xl border border-[#2e3548] p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package size={16} className="text-[#f97316]" />
                <h2 className="font-semibold text-white text-sm sm:text-base">Состав заказа</h2>
              </div>
              <div className="divide-y divide-[#2e3548]">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 py-3">
                    <Link to={`/projects/${item.projectId}`} className="text-sm text-white/70 hover:text-[#f97316] transition-colors truncate">
                      {item.title}
                    </Link>
                    <span className="text-sm font-medium text-white/80 whitespace-nowrap">{item.price.toLocaleString('ru-RU')} ₽</span>
                  </div>
                ))}
              </div>
              {(order.discountAmount || 0) > 0 && (
                <div className="flex items-center justify-between gap-4 pt-3 mt-1 border-t border-[#2e3548]">
                  <span className="text-sm text-emerald-400">
                    Скидка {order.promoCode ? `по промокоду ${order.promoCode}` : ''}
                  </span>
                  <span className="text-sm font-medium text-emerald-400 whitespace-nowrap">
                    −{(order.discountAmount || 0).toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-[#232a3b] rounded-xl sm:rounded-2xl border border-[#2e3548] p-5 sm:p-6 lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-white text-sm">Итого</span>
                <span className="text-lg font-bold gradient-text">{order.totalAmount.toLocaleString('ru-RU')} ₽</span>
              </div>
              {order.status === 'Pending' && (
                <button onClick={handlePay} disabled={paying} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold disabled:opacity-50">
                  {paying ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><CreditCard size={15} /> Оплатить</>
                  )}
                </button>
              )}
              {order.status === 'Delivered' && (
                <button onClick={handleDownload} disabled={downloading} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold disabled:opacity-50">
                  {downloading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Download size={15} /> Скачать файлы</>
                  )}
                </button>
              )}
              <Link to="/profile" className="mt-3 block text-center py-2 rounded-xl text-xs sm:text-sm text-white/50 hover:text-white border border-[#2e3548] hover:border-[#f97316]/30 transition-colors">
                Все заказы
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
