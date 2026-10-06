import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Download, Package, User, Mail, CreditCard } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { paymentsApi } from '../api/payments';
import { api, fetchWithAuth } from '../api/client';
import { useState, useEffect } from 'react';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 10;

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  Pending: { label: 'Ожидает оплаты', color: 'text-amber-400 bg-amber-500/10' },
  Delivered: { label: 'Доставлен', color: 'text-green-400 bg-green-500/10' },
  Cancelled: { label: 'Отменён', color: 'text-red-400 bg-red-500/10' },
};

export default function Profile() {
  const { user, orders, logout, refreshOrders, authReady } = useApp();
  const navigate = useNavigate();
  const [payingId, setPayingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user || orders.length === 0) return;
    const pending = orders.filter(o => o.status === 'Pending' && o.paymentId);
    pending.forEach(async (o) => {
      try {
        const { status } = await paymentsApi.checkOrderStatus(o.id);
        if (status === 'Delivered') await refreshOrders();
      } catch {}
    });
  }, [user, orders, refreshOrders]);

  if (!authReady) {
    return (
      <div className="pt-14 sm:pt-20 lg:pt-24 flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/20 border-t-[#f97316] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-14 sm:pt-20 lg:pt-24">
        <div className="section-dark py-12 sm:py-16 lg:py-24">
          <div className="max-w-lg mx-auto px-4 text-center relative z-10">
            <p className="text-white/40 mb-5 text-sm sm:text-base">Для просмотра профиля необходимо войти</p>
            <Link to="/login" className="btn-primary inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base">Войти</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => { logout(); navigate('/'); };

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleOrders = orders.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handlePay = async (orderId: number) => {
    setPayingId(orderId);
    try {
      const { confirmationUrl } = await paymentsApi.create(orderId);
      window.open(confirmationUrl, '_blank');
    } catch {}
    setPayingId(null);
  };

  const getFileNameFromCD = (cd: string, fallback: string): string => {
    const star = cd.match(/filename\*=UTF-8''([^;\n]+)/i);
    if (star) return decodeURIComponent(star[1]);
    const quoted = cd.match(/filename="?([^";\n]+)"?/);
    if (quoted) return quoted[1];
    return fallback;
  };

  const handleDownload = async (orderId: number) => {
    const res = await fetchWithAuth(`/api/Download/orders/${orderId}`);
    if (!res.ok) return;
    const ct = res.headers.get('content-type') || '';
    const cd = res.headers.get('content-disposition') || '';
    if (ct.includes('application/json')) {
      const files = await res.clone().json();
      for (const f of files) {
        const fileRes = await fetchWithAuth(`/api/Download/files/${f.id}`);
        if (!fileRes.ok) continue;
        const fileCd = fileRes.headers.get('content-disposition') || '';
        const fileBlob = await fileRes.blob();
        const fileUrl = URL.createObjectURL(fileBlob);
        const fileA = document.createElement('a');
        fileA.href = fileUrl;
        fileA.download = getFileNameFromCD(fileCd, f.originalFileName || `file_${f.id}`);
        fileA.click();
        URL.revokeObjectURL(fileUrl);
      }
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    if (ct.includes('application/zip')) {
      a.download = getFileNameFromCD(cd, `order_${orderId}_files.zip`);
    } else {
      a.download = getFileNameFromCD(cd, `order_${orderId}_files`);
    }
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pt-14 sm:pt-20 lg:pt-24">
      <div className="section-dark py-6 sm:py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">Личный кабинет</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-1">
            <div className="bg-[#232a3b] rounded-xl sm:rounded-2xl border border-[#2e3548] p-5 sm:p-6">
              <div className="flex flex-col items-center text-center mb-4 sm:mb-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center text-white text-xl sm:text-2xl font-bold mb-2.5 sm:mb-3">{user.name[0]}</div>
                <h2 className="font-semibold text-white text-sm sm:text-base">{user.name}</h2>
                <span className={`mt-1 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-medium rounded-full ${user.role === 'admin' ? 'bg-[#f97316]/10 text-[#f97316]' : 'bg-blue-500/10 text-blue-400'}`}>
                  {user.role === 'admin' ? 'Администратор' : 'Покупатель'}
                </span>
              </div>
              <div className="space-y-2.5 text-xs sm:text-sm">
                <div className="flex items-center gap-2 sm:gap-2.5 text-white/60"><User size={13} className="text-white/30 sm:w-3.5 sm:h-3.5" /><span>{user.name}</span></div>
                <div className="flex items-center gap-2 sm:gap-2.5 text-white/60"><Mail size={13} className="text-white/30 sm:w-3.5 sm:h-3.5" /><span className="truncate">{user.email}</span></div>
                <div className="flex items-center gap-2 sm:gap-2.5 text-white/60"><Package size={13} className="text-white/30 sm:w-3.5 sm:h-3.5" /><span>{orders.length} заказов</span></div>
              </div>
              {user.role === 'admin' && (
                <Link to="/admin" className="mt-4 sm:mt-5 block w-full py-2 text-center text-xs sm:text-sm font-semibold bg-[#f97316]/10 text-[#f97316] rounded-xl hover:bg-[#f97316]/20 transition-colors">Открыть панель</Link>
              )}
              <button onClick={handleLogout} className="mt-2.5 sm:mt-3 w-full flex items-center justify-center gap-2 py-2 text-xs sm:text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                <LogOut size={13} className="sm:w-3.5 sm:h-3.5" /> Выйти из аккаунта
              </button>
            </div>
          </div>
          <div className="lg:col-span-2">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-5">История заказов</h3>
            {orders.length === 0 ? (
              <div className="bg-[#232a3b] rounded-xl sm:rounded-2xl border border-[#2e3548] p-8 sm:p-10 text-center">
                <p className="text-white/40 text-sm sm:text-base">У вас пока нет заказов</p>
                <Link to="/projects" className="mt-3 sm:mt-4 inline-block text-[#f97316] hover:underline text-xs sm:text-sm">Перейти в каталог</Link>
              </div>
            ) : (
              <>
                <div className="space-y-2.5 sm:space-y-3">
                  {visibleOrders.map(order => {
                  const s = STATUS_LABELS[order.status] || STATUS_LABELS[order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()];
                  return (
                    <div key={order.id} className="bg-[#232a3b] rounded-xl sm:rounded-2xl border border-[#2e3548] p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                            <span className="font-semibold text-white text-xs sm:text-sm">{order.orderNumber}</span>
                            {s && <span className={`px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full ${s.color}`}>{s.label}</span>}
                          </div>
                          <p className="text-[10px] sm:text-xs text-white/30">{new Date(order.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          {order.items.length > 0 && (
                            <div className="mt-1.5 sm:mt-2 space-y-0.5">
                              {order.items.map((item, i) => (
                                <p key={i} className="text-[10px] sm:text-xs text-white/40">{item.title} — {item.price.toLocaleString('ru-RU')} &#8381;</p>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-white text-sm sm:text-base">{order.totalAmount.toLocaleString('ru-RU')} &#8381;</p>
                          {order.status === 'Pending' && (
                            <button onClick={() => handlePay(order.id)} disabled={payingId === order.id}
                              className="mt-1 sm:mt-1.5 flex items-center gap-1 text-[10px] sm:text-xs text-[#f97316] hover:text-[#ea580c] font-medium transition-colors ml-auto">
                              {payingId === order.id ? <span className="w-3 h-3 border-2 border-[#f97316]/30 border-t-[#f97316] rounded-full animate-spin" /> : <CreditCard size={11} className="sm:w-3 sm:h-3" />}
                              Оплатить
                            </button>
                          )}
                          {order.status === 'Delivered' && (
                            <button onClick={() => handleDownload(order.id)} className="mt-1 sm:mt-1.5 flex items-center gap-1 text-[10px] sm:text-xs text-[#f97316] hover:text-[#ea580c] font-medium transition-colors ml-auto">
                              <Download size={11} className="sm:w-3 sm:h-3" /> Скачать
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
                <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
