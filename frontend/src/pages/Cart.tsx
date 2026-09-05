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
      <div className="pt-20 lg:pt-24">
        <div className="section-dark py-16 lg:py-24">
          <div className="max-w-2xl mx-auto px-4 text-center relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-[#232a3b] border border-[#2e3548] flex items-center justify-center mx-auto mb-5">
              <ShoppingBag size={32} className="text-white/20" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Корзина пуста</h2>
            <p className="text-white/40 mb-8">Добавьте проекты из каталога, чтобы оформить заказ</p>
            <Link to="/projects" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl">
              Перейти к каталогу <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 lg:pt-24">
      <div className="section-dark py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Корзина &middot; {cart.length} {cart.length === 1 ? 'проект' : cart.length < 5 ? 'проекта' : 'проектов'}</h1>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map(({ project }) => (
              <div key={project.id} className="bg-[#232a3b] rounded-2xl border border-[#2e3548] p-4 flex gap-4 items-start">
                <img src={project.image} alt={project.title} className="w-20 h-16 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link to={`/projects/${project.id}`} className="font-semibold text-white hover:text-[#f97316] transition-colors line-clamp-1">{project.title}</Link>
                      <p className="text-xs text-white/40 mt-0.5">{project.category}</p>
                    </div>
                    <button onClick={() => removeFromCart(project.id)} className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.technologies.slice(0, 3).map(t => (
                      <span key={t} className="px-2 py-0.5 bg-[#f97316]/10 text-[#f97316] text-xs rounded-md">{t}</span>
                    ))}
                  </div>
                  <p className="text-lg font-bold text-white mt-2">{project.price.toLocaleString('ru-RU')} &#8381;</p>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="bg-[#232a3b] rounded-2xl border border-[#2e3548] p-6 sticky top-24">
              <h3 className="font-semibold text-white mb-4">Итого</h3>
              <div className="space-y-2 mb-5 text-sm text-white/50">
                {cart.map(({ project }) => (
                  <div key={project.id} className="flex justify-between">
                    <span className="truncate max-w-32">{project.title}</span>
                    <span className="font-medium text-white/70">{project.price.toLocaleString('ru-RU')} &#8381;</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#2e3548] pt-4 flex justify-between items-center mb-5">
                <span className="font-semibold text-white">Итого</span>
                <span className="text-xl font-bold gradient-text">{total.toLocaleString('ru-RU')} &#8381;</span>
              </div>
              <button onClick={handleCheckout} className="btn-primary w-full py-3 flex items-center justify-center gap-2 rounded-xl">
                Оформить заказ <ArrowRight size={16} />
              </button>
              <div className="mt-6 pt-5 border-t border-[#2e3548]">
                <p className="text-xs font-semibold text-white/30 uppercase tracking-wide mb-3">Связаться с автором</p>
                <div className="space-y-2">
                  <a href="https://t.me/projectmarket" className="flex items-center gap-2.5 text-sm text-white/60 hover:text-[#f97316] transition-colors p-2 rounded-lg hover:bg-[#f97316]/5">
                    <div className="w-7 h-7 rounded-lg bg-[#f97316] flex items-center justify-center"><Send size={13} className="text-white" /></div>
                    Telegram
                  </a>
                  <a href="https://wa.me/79001234567" className="flex items-center gap-2.5 text-sm text-white/60 hover:text-green-400 transition-colors p-2 rounded-lg hover:bg-green-500/10">
                    <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center"><MessageCircle size={13} className="text-white" /></div>
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
