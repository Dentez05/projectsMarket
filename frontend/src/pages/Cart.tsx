import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Send, MessageCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../store/AppContext';

export default function Cart() {
  const { cart, removeFromCart, checkout, user } = useApp();
  const navigate = useNavigate();

  const total = cart.reduce((sum, i) => sum + i.project.price, 0);

  const handleCheckout = () => {
    if (!user) { navigate('/login'); return; }
    checkout();
    navigate('/profile');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
          <ShoppingBag size={32} className="text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Корзина пуста</h2>
        <p className="text-slate-500 mb-8">Добавьте проекты из каталога, чтобы оформить заказ</p>
        <Link to="/projects" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
          Перейти к каталогу <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Корзина &middot; {cart.length} {cart.length === 1 ? 'проект' : cart.length < 5 ? 'проекта' : 'проектов'}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map(({ project }) => (
            <div key={project.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex gap-4 items-start">
              <img src={project.image} alt={project.title} className="w-20 h-16 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link to={`/projects/${project.id}`} className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1">
                      {project.title}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">{project.category}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(project.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {project.technologies.slice(0, 3).map(t => (
                    <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-md">{t}</span>
                  ))}
                </div>
                <p className="text-lg font-bold text-slate-900 mt-2">{project.price.toLocaleString('ru-RU')} &#8381;</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-24">
            <h3 className="font-semibold text-slate-900 mb-4">Итого</h3>
            <div className="space-y-2 mb-5 text-sm text-slate-600">
              {cart.map(({ project }) => (
                <div key={project.id} className="flex justify-between">
                  <span className="truncate max-w-32">{project.title}</span>
                  <span className="font-medium">{project.price.toLocaleString('ru-RU')} &#8381;</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-4 flex justify-between items-center mb-5">
              <span className="font-semibold text-slate-900">Итого</span>
              <span className="text-xl font-bold gradient-text">{total.toLocaleString('ru-RU')} &#8381;</span>
            </div>
            <button
              onClick={handleCheckout}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              Оформить заказ <ArrowRight size={16} />
            </button>

            {/* Contacts */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Связаться с автором</p>
              <div className="space-y-2">
                <a href="https://t.me/projectmarket" className="flex items-center gap-2.5 text-sm text-slate-700 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50">
                  <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Send size={13} className="text-white" />
                  </div>
                  Telegram
                </a>
                <a href="https://wa.me/79001234567" className="flex items-center gap-2.5 text-sm text-slate-700 hover:text-green-600 transition-colors p-2 rounded-lg hover:bg-green-50">
                  <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center">
                    <MessageCircle size={13} className="text-white" />
                  </div>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
