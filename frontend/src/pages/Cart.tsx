import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Send, MessageCircle, ArrowRight, Tag, Check } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { ordersApi } from '../api/orders';
import { paymentsApi } from '../api/payments';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ui/Toast';
import { useSeo } from '../utils/seo';

export default function Cart() {
  useSeo({ title: 'Корзина', noindex: true });
  const { cart, removeFromCart, user, refreshCart } = useApp();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const [loading, setLoading] = useState(false);
  const checkoutRef = useRef(false);
  const total = cart.reduce((sum, i) => sum + i.price, 0);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState('');

  // Клиентский предпросмотр скидки; сервер пересчитает и валидирует заново
  const previewDiscount = appliedPromo
    ? null // точную сумму сервер посчитает при оформлении; показываем только факт применения
    : 0;

  const handleCheckout = async () => {
    if (!user) { navigate('/login'); return; }
    if (checkoutRef.current) return;
    checkoutRef.current = true;
    setLoading(true);
    try {
      const order = await ordersApi.create(undefined, appliedPromo ?? undefined);
      await refreshCart();
      try {
        const { confirmationUrl } = await paymentsApi.create(order.id);
        window.open(confirmationUrl, '_blank');
      } catch {
        addToast(`Заказ ${order.orderNumber} оформлен! Оплата будет доступна в личном кабинете.`, 'success');
      }
      if (order.discountAmount && order.discountAmount > 0) {
        addToast(`Применена скидка ${order.discountAmount.toLocaleString('ru-RU')} ₽`, 'success');
      }
      setTimeout(() => navigate('/profile'), 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      addToast(msg || 'Ошибка при оформлении заказа', 'error');
      setPromoError(msg.includes('Промокод') || msg.includes('промокода') ? msg : '');
    }
    setLoading(false);
    checkoutRef.current = false;
  };

  const handleRemove = async (id: number) => {
    await removeFromCart(id);
    addToast('Проект удалён из корзины', 'info');
  };

  if (cart.length === 0) {
    return (
      <div className="pt-14 sm:pt-20 lg:pt-24">
        <div className="section-dark py-12 sm:py-16 lg:py-24">
          <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#232a3b] border border-[#2e3548] flex items-center justify-center mx-auto mb-4 sm:mb-5">
              <ShoppingBag size={28} className="text-white/20 sm:w-8 sm:h-8" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Корзина пуста</h2>
            <p className="text-white/40 mb-6 sm:mb-8 text-sm sm:text-base">Добавьте проекты из каталога, чтобы оформить заказ</p>
            <Link to="/projects" className="btn-primary inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base">
              Перейти к каталогу <ArrowRight size={15} className="sm:w-4 sm:h-4" />
            </Link>
          </div>
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  return (
    <div className="pt-14 sm:pt-20 lg:pt-24">
      <div className="section-dark py-6 sm:py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">Корзина &middot; {cart.length} {cart.length === 1 ? 'проект' : cart.length < 5 ? 'проекта' : 'проектов'}</h1>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {cart.map((item) => (
              <div key={item.projectId} className="bg-[#232a3b] rounded-xl sm:rounded-2xl border border-[#2e3548] p-3.5 sm:p-4 flex gap-3 sm:gap-4 items-start">
                <img src={item.image} alt={item.title} loading="lazy" className="w-16 h-12 sm:w-20 sm:h-16 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link to={`/projects/${item.projectId}`} className="font-semibold text-white hover:text-[#f97316] transition-colors line-clamp-1 text-sm sm:text-base">{item.title}</Link>
                    </div>
                    <button
                      onClick={() => handleRemove(item.projectId)}
                      className="p-1 sm:p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                      title="Удалить"
                    >
                      <Trash2 size={14} className="sm:w-[15px] sm:h-[15px]" />
                    </button>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-white mt-1.5 sm:mt-2">{item.price.toLocaleString('ru-RU')} &#8381;</p>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="bg-[#232a3b] rounded-xl sm:rounded-2xl border border-[#2e3548] p-5 sm:p-6 lg:sticky lg:top-24">
              <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Итого</h3>
              <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5 text-xs sm:text-sm text-white/50">
                {cart.map((item) => (
                  <div key={item.projectId} className="flex justify-between">
                    <span className="truncate max-w-[120px] sm:max-w-32">{item.title}</span>
                    <span className="font-medium text-white/70 ml-2 flex-shrink-0">{item.price.toLocaleString('ru-RU')} &#8381;</span>
                  </div>
                ))}
              </div>
              <div className="mb-4 sm:mb-5">
                <label className="block text-xs font-medium text-white/40 mb-1.5">Промокод</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                    placeholder="SALE10"
                    className="flex-1 min-w-0 px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]/50 transition-all uppercase"
                  />
                  {appliedPromo ? (
                    <button
                      onClick={() => { setAppliedPromo(null); setPromoInput(''); setPromoError(''); }}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap"
                      title="Убрать промокод"
                    >
                      <Check size={13} /> {appliedPromo}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const code = promoInput.trim();
                        if (!code) return;
                        setAppliedPromo(code);
                        setPromoError('');
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#f97316]/10 text-[#f97316] hover:bg-[#f97316]/20 transition-colors whitespace-nowrap"
                    >
                      <Tag size={13} /> Применить
                    </button>
                  )}
                </div>
                {promoError && <p className="text-[11px] text-red-400 mt-1.5">{promoError}</p>}
                <p className="text-[10px] text-white/25 mt-1.5">Скидка проверяется сервером при оформлении</p>
              </div>
              <div className="border-t border-[#2e3548] pt-3.5 sm:pt-4 flex justify-between items-center mb-4 sm:mb-5">
                <span className="font-semibold text-white text-sm sm:text-base">Итого</span>
                <span className="text-lg sm:text-xl font-bold gradient-text">{total.toLocaleString('ru-RU')} &#8381;</span>
              </div>
              <button onClick={handleCheckout} disabled={loading} className="btn-primary w-full py-2.5 sm:py-3 flex items-center justify-center gap-2 rounded-xl text-sm sm:text-base">
                {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {loading ? 'Оформляем...' : <><span>Оформить заказ</span> <ArrowRight size={15} className="sm:w-4 sm:h-4" /></>}
              </button>
              <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-[#2e3548]">
                <p className="text-[10px] sm:text-xs font-semibold text-white/30 uppercase tracking-wide mb-2.5 sm:mb-3">Связаться с автором</p>
                <div className="space-y-1.5 sm:space-y-2">
                  <a href="https://t.me/projectmarket" className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-white/60 hover:text-[#f97316] transition-colors p-1.5 sm:p-2 rounded-lg hover:bg-[#f97316]/5">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#f97316] flex items-center justify-center"><Send size={12} className="text-white" /></div>
                    Telegram
                  </a>
                  <a href="https://wa.me/79001234567" className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-white/60 hover:text-green-400 transition-colors p-1.5 sm:p-2 rounded-lg hover:bg-green-500/10">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-green-500 flex items-center justify-center"><MessageCircle size={12} className="text-white" /></div>
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
