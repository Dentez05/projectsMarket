import { Link } from 'react-router-dom';
import { Send, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0f1219] text-white/50 mt-auto border-t border-[#2e3548]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="relative w-9 h-9 flex-shrink-0">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] shadow-md shadow-[#f97316]/20" />
                <div className="absolute inset-[1.5px] rounded-[10px] bg-gradient-to-br from-white/20 to-transparent" />
                <span className="absolute inset-0 flex items-center justify-center text-white font-black text-[13px] leading-none select-none" style={{ letterSpacing: '-0.03em' }}>PM</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[15px] font-black text-white tracking-tight" style={{ letterSpacing: '-0.04em' }}>Project</span>
                <span className="text-[15px] font-black tracking-tight text-[#f97316]" style={{ letterSpacing: '-0.04em' }}>Market</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-5 max-w-sm text-white/40">
              Маркетплейс готовых IT-проектов. Покупайте проверенные решения и запускайте бизнес быстрее.
            </p>
            <div className="flex flex-col gap-3 text-sm">
              <a href="https://t.me/projectmarket" className="flex items-center gap-2.5 hover:text-[#f97316] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center"><Send size={13} /></div>
                @projectmarket
              </a>
              <a href="tel:+79001234567" className="flex items-center gap-2.5 hover:text-[#f97316] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center"><Phone size={13} /></div>
                +7 (900) 123-45-67
              </a>
              <a href="mailto:info@projectmarket.ru" className="flex items-center gap-2.5 hover:text-[#f97316] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center"><Mail size={13} /></div>
                info@projectmarket.ru
              </a>
              <span className="flex items-center gap-2.5 text-white/40">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center"><MapPin size={13} /></div>
                Россия, Москва
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Каталог</h4>
            <ul className="space-y-2.5 text-sm">
              {['E-commerce', 'Dashboard', 'CRM', 'Чат-бот', 'API', 'Мобильное'].map(cat => (
                <li key={cat}>
                  <Link to={`/projects?category=${cat}`} className="hover:text-[#f97316] transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Информация</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/projects" className="hover:text-[#f97316] transition-colors">Все проекты</Link></li>
              <li><Link to="/cart" className="hover:text-[#f97316] transition-colors">Корзина</Link></li>
              <li><Link to="/profile" className="hover:text-[#f97316] transition-colors">Личный кабинет</Link></li>
              <li><a href="#" className="hover:text-[#f97316] transition-colors">Политика конфиденциальности</a></li>
              <li><a href="#" className="hover:text-[#f97316] transition-colors">Договор оферты</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#2e3548] mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/30">
          <p>&copy; 2024 ProjectMarket. Все права защищены.</p>
          <p>ИП Смирнов Иван Александрович · ИНН 123456789012</p>
        </div>
      </div>
    </footer>
  );
}
