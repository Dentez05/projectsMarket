import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, HeadphonesIcon, Star, ShoppingCart, ChevronRight } from 'lucide-react';
import { projects } from '../data/projects';
import ProjectCard from '../components/ProjectCard';

const FEATURES = [
  { icon: <Zap size={24} className="text-[#f97316]" />, title: 'Быстрый старт', desc: 'Получите готовый проект за несколько минут. Никакого ожидания разработки.' },
  { icon: <Shield size={24} className="text-[#f97316]" />, title: 'Гарантия качества', desc: 'Каждый проект проверен и протестирован. Возврат средств, если что-то пойдёт не так.' },
  { icon: <HeadphonesIcon size={24} className="text-[#f97316]" />, title: 'Поддержка 24/7', desc: 'Помогаем с установкой и настройкой. Подробная документация к каждому проекту.' },
  { icon: <Star size={24} className="text-[#f97316]" />, title: 'Актуальные технологии', desc: 'Все проекты на современном стеке: React, Node.js, Python, Docker и другие.' },
];

const SERVICE_CARDS = [
  { title: 'E-commerce', desc: 'Готовые интернет-магазины с оплатой и доставкой', icon: <ShoppingCart size={20} /> },
  { title: 'Dashboard', desc: 'Аналитические панели управления бизнесом', icon: <Zap size={20} /> },
  { title: 'CRM-системы', desc: 'Управление клиентами и продажами', icon: <HeadphonesIcon size={20} /> },
  { title: 'Мобильные приложения', desc: 'React Native и Flutter решения', icon: <Star size={20} /> },
];

export default function Home() {
  const popular = projects.filter(p => p.popular).slice(0, 4);
  const newest = projects.filter(p => p.isNew).slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="section-dark pt-24 pb-16 lg:pt-32 lg:pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f97316]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mb-12 lg:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Готовые IT-проекты<br />
              <span className="gradient-text">для вашего бизнеса</span>
            </h1>
            <p className="text-lg text-white/50 leading-relaxed mb-8 max-w-xl">
              Покупайте проверенные проекты и запускайте бизнес в разы быстрее. Экономьте месяцы разработки и тысячи рублей.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/projects" className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 text-base rounded-xl">
                Смотреть проекты <ArrowRight size={18} />
              </Link>
              <a href="#features" className="btn-outline inline-flex items-center gap-2 px-7 py-3.5 text-base rounded-xl">
                Как это работает
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICE_CARDS.map(card => (
              <Link to="/projects" key={card.title} className="bg-[#232a3b] border border-[#2e3548] rounded-xl p-5 group cursor-pointer transition-all duration-300 hover:border-[#f97316]/30 hover:bg-[#2a3244]">
                <div className="w-10 h-10 rounded-lg bg-[#f97316]/10 flex items-center justify-center text-[#f97316] mb-3">{card.icon}</div>
                <h3 className="text-white font-semibold text-sm mb-1.5">{card.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{card.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular projects */}
      <section className="py-16 lg:py-20 section-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-[#f97316] font-semibold text-sm mb-2 uppercase tracking-wide">Лидеры продаж</p>
            <div className="flex items-end justify-between">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">Популярные проекты</h2>
              <Link to="/projects" className="text-sm font-semibold text-[#f97316] hover:text-[#ea580c] flex items-center gap-1 transition-colors whitespace-nowrap ml-4">
                Все проекты <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popular.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 lg:py-20 section-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#f97316] font-semibold text-sm mb-2 uppercase tracking-wide">Почему мы</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">Преимущества ProjectMarket</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-[#232a3b] border border-[#2e3548] rounded-2xl p-6 transition-all duration-300 hover:border-[#f97316]/20">
                <div className="w-12 h-12 rounded-xl bg-[#f97316]/10 flex items-center justify-center mb-4">{f.icon}</div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New projects */}
      <section className="py-16 lg:py-20 section-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-[#f97316] font-semibold text-sm mb-2 uppercase tracking-wide">Свежие поступления</p>
            <div className="flex items-end justify-between">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">Новые проекты</h2>
              <Link to="/projects" className="text-sm font-semibold text-[#f97316] hover:text-[#ea580c] flex items-center gap-1 transition-colors whitespace-nowrap ml-4">
                Все проекты <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newest.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 section-dark relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#f97316]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">Готовы запустить свой проект?</h2>
          <p className="text-white/40 mb-8">Выберите подходящий проект и начните работу уже сегодня</p>
          <Link to="/projects" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-base rounded-xl">
            Перейти к каталогу <ChevronRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
