import { Link } from 'react-router-dom';
import { Send, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="relative w-9 h-9 flex-shrink-0">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-md shadow-blue-900/40" />
                <div className="absolute inset-[1.5px] rounded-[10px] bg-gradient-to-br from-blue-400/30 to-transparent" />
                <span className="absolute inset-0 flex items-center justify-center text-white font-black text-[13px] leading-none select-none" style={{ letterSpacing: '-0.03em' }}>PM</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[15px] font-black text-white tracking-tight" style={{ letterSpacing: '-0.04em' }}>Project</span>
                <span className="text-[15px] font-black tracking-tight text-blue-400" style={{ letterSpacing: '-0.04em' }}>Market</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4 max-w-xs">
              Маркетплейс готовых IT-проектов. Покупайте проверенные решения и запускайте бизнес быстрее.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <a href="https://t.me/projectmarket" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <Send size={14} /> @projectmarket
              </a>
              <a href="tel:+79001234567" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <Phone size={14} /> +7 (900) 123-45-67
              </a>
              <a href="mailto:info@projectmarket.ru" className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <Mail size={14} /> info@projectmarket.ru
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Каталог</h4>
            <ul className="space-y-2 text-sm">
              {['E-commerce', 'Dashboard', 'CRM', 'Чат-бот', 'API', 'Мобильное'].map(cat => (
                <li key={cat}>
                  <Link to={`/projects?category=${cat}`} className="hover:text-blue-400 transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Информация</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/projects" className="hover:text-blue-400 transition-colors">Все проекты</Link></li>
              <li><Link to="/cart" className="hover:text-blue-400 transition-colors">Корзина</Link></li>
              <li><Link to="/profile" className="hover:text-blue-400 transition-colors">Личный кабинет</Link></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Политика конфиденциальности</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Договор оферты</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <p>&copy; 2024 ProjectMarket. Все права защищены.</p>
          <p>ИП Смирнов Иван Александрович · ИНН 123456789012</p>
        </div>
      </div>
    </footer>
  );
}
