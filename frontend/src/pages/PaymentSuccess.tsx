import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Home, User } from 'lucide-react';
import { paymentsApi } from '../api/payments';
import { useSeo } from '../utils/seo';

type State = 'loading' | 'paid' | 'failed';

export default function PaymentSuccess() {
  useSeo({ title: 'Результат оплаты', noindex: true });
  const [params] = useSearchParams();
  const orderId = Number(params.get('orderId')) || 0;
  const [state, setState] = useState<State>('loading');

  useEffect(() => {
    if (!orderId) {
      setState('failed');
      return;
    }
    paymentsApi.getSuccess(orderId)
      .then(res => setState(res.status === 'Delivered' ? 'paid' : 'failed'))
      .catch(() => setState('failed'));
  }, [orderId]);

  return (
    <div className="pt-14 sm:pt-20 lg:pt-24">
      <div className="section-dark py-12 sm:py-16 lg:py-24">
        <div className="max-w-lg mx-auto px-4 text-center relative z-10">
          {state === 'loading' && (
            <>
              <div className="w-10 h-10 border-2 border-white/20 border-t-[#f97316] rounded-full animate-spin mx-auto mb-5" />
              <p className="text-white/50 text-sm sm:text-base">Проверяем оплату…</p>
            </>
          )}

          {state === 'paid' && (
            <>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 sm:mb-5">
                <CheckCircle2 size={32} className="text-emerald-400 sm:w-10 sm:h-10" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Оплата прошла успешно</h1>
              <p className="text-white/40 text-sm sm:text-base mb-6 sm:mb-8">
                Заказ №{orderId} оплачен, файлы доступны для скачивания
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/profile" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium">
                  <User size={15} /> Личный кабинет
                </Link>
                <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white/60 border border-[#2e3548] hover:border-[#f97316]/30 hover:text-white transition-colors">
                  <Home size={15} /> На главную
                </Link>
              </div>
            </>
          )}

          {state === 'failed' && (
            <>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 sm:mb-5">
                <XCircle size={32} className="text-red-400 sm:w-10 sm:h-10" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Оплата не подтверждена</h1>
              <p className="text-white/40 text-sm sm:text-base mb-6 sm:mb-8">
                Платёж не завершён или ещё обрабатывается. Статус обновится в личном кабинете.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/profile" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium">
                  <User size={15} /> Личный кабинет
                </Link>
                <Link to="/projects" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white/60 border border-[#2e3548] hover:border-[#f97316]/30 hover:text-white transition-colors">
                  В каталог
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
