import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Download, Package, User, Mail } from 'lucide-react';
import { useApp } from '../store/AppContext';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Ожидает оплаты', color: 'text-amber-700 bg-amber-50' },
  paid: { label: 'Оплачен', color: 'text-blue-700 bg-blue-50' },
  delivered: { label: 'Доставлен', color: 'text-green-700 bg-green-50' },
};

export default function Profile() {
  const { user, orders, logout } = useApp();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <p className="text-slate-600 mb-5">Для просмотра профиля необходимо войти</p>
        <Link to="/login" className="btn-primary inline-flex items-center gap-2 px-6 py-3">Войти</Link>
      </div>
    );
  }

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Личный кабинет</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold mb-3">
                {user.name[0]}
              </div>
              <h2 className="font-semibold text-slate-900">{user.name}</h2>
              <span className={`mt-1 px-2.5 py-0.5 text-xs font-medium rounded-full ${user.role === 'admin' ? 'bg-violet-50 text-violet-700' : 'bg-blue-50 text-blue-700'}`}>
                {user.role === 'admin' ? 'Администратор' : 'Покупатель'}
              </span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2.5 text-slate-600">
                <User size={14} className="text-slate-400" />
                <span>{user.name}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Mail size={14} className="text-slate-400" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Package size={14} className="text-slate-400" />
                <span>{orders.length} заказов</span>
              </div>
            </div>
            {user.role === 'admin' && (
              <Link to="/admin" className="mt-5 block w-full py-2 text-center text-sm font-semibold bg-violet-50 text-violet-700 rounded-xl hover:bg-violet-100 transition-colors">
                Открыть панель
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut size={14} /> Выйти из аккаунта
            </button>
          </div>
        </div>

        {/* Orders */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-5">История заказов</h3>
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
              <p className="text-slate-500">У вас пока нет заказов</p>
              <Link to="/projects" className="mt-4 inline-block text-blue-600 hover:underline text-sm">Перейти в каталог</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => {
                const s = STATUS_LABELS[order.status];
                return (
                  <div key={order.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900 text-sm">{order.id}</span>
                          {s && <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${s.color}`}>{s.label}</span>}
                        </div>
                        <p className="text-xs text-slate-400">
                          {new Date(order.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{order.total.toLocaleString('ru-RU')} &#8381;</p>
                        {(order.status === 'delivered' || order.status === 'paid') && (
                          <button className="mt-1.5 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors ml-auto">
                            <Download size={12} /> Скачать
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
