import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, HeadphonesIcon, Star, ShoppingCart, ChevronRight } from 'lucide-react';
import { projects } from '../data/projects';
import ProjectCard from '../components/ProjectCard';
import ScrollReveal from '../components/ui/ScrollReveal';

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
      <section className="relative overflow-hidden pt-20 pb-10 sm:pt-24 sm:pb-16 lg:pt-32 lg:pb-24" style={{ background: 'linear-gradient(135deg, #0f1219 0%, #1a1f2e 50%, #0f1219 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-[#f97316]/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#f97316]/3 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mb-8 sm:mb-12 lg:mb-16">
            <ScrollReveal>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 sm:mb-6">
                Готовые IT-проекты<br />
                <span className="gradient-text">для вашего бизнеса</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <p className="text-base sm:text-lg text-white/50 leading-relaxed mb-6 sm:mb-8 max-w-xl">
                Покупайте проверенные проекты и запускайте бизнес в разы быстрее. Экономьте месяцы разработки и тысячи рублей.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Link to="/projects" className="btn-primary inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl">
                  Смотреть проекты <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                </Link>
                <a href="#features" className="btn-outline inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl">
                  Как это работает
                </a>
              </div>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {SERVICE_CARDS.map((card, i) => (
              <ScrollReveal key={card.title} delay={300 + i * 75}>
                <Link to="/projects" className="block bg-[#232a3b]/80 backdrop-blur-sm border border-[#2e3548] rounded-xl p-3.5 sm:p-5 group cursor-pointer transition-all duration-300 hover:border-[#f97316]/30 hover:bg-[#2a3244]/80">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#f97316]/10 flex items-center justify-center text-[#f97316] mb-2.5 sm:mb-3 group-hover:scale-110 transition-transform">{card.icon}</div>
                  <h3 className="text-white font-semibold text-xs sm:text-sm mb-1 sm:mb-1.5">{card.title}</h3>
                  <p className="text-white/40 text-[10px] sm:text-xs leading-relaxed hidden sm:block">{card.desc}</p>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Popular projects */}
      <section className="py-10 sm:py-16 lg:py-20 section-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mb-6 sm:mb-10">
              <p className="text-[#f97316] font-semibold text-xs sm:text-sm mb-1.5 sm:mb-2 uppercase tracking-wide">Лидеры продаж</p>
              <div className="flex items-end justify-between gap-3">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">Популярные проекты</h2>
                <Link to="/projects" className="text-xs sm:text-sm font-semibold text-[#f97316] hover:text-[#ea580c] flex items-center gap-1 transition-colors whitespace-nowrap">
                  Все проекты <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {popular.map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 75}>
                <ProjectCard project={p} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-10 sm:py-16 lg:py-20 section-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-8 sm:mb-12">
              <p className="text-[#f97316] font-semibold text-xs sm:text-sm mb-1.5 sm:mb-2 uppercase tracking-wide">Почему мы</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">Преимущества ProjectMarket</h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {FEATURES.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 100}>
                <div className="bg-[#232a3b] border border-[#2e3548] rounded-xl sm:rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:border-[#f97316]/20 group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#f97316]/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
                  <h3 className="font-semibold text-white mb-1.5 sm:mb-2 text-sm sm:text-base">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-white/40 leading-relaxed">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* New projects */}
      <section className="py-10 sm:py-16 lg:py-20 section-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="mb-6 sm:mb-10">
              <p className="text-[#f97316] font-semibold text-xs sm:text-sm mb-1.5 sm:mb-2 uppercase tracking-wide">Свежие поступления</p>
              <div className="flex items-end justify-between gap-3">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">Новые проекты</h2>
                <Link to="/projects" className="text-xs sm:text-sm font-semibold text-[#f97316] hover:text-[#ea580c] flex items-center gap-1 transition-colors whitespace-nowrap">
                  Все проекты <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {newest.map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 75}>
                <ProjectCard project={p} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 sm:py-16 lg:py-20 section-dark relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] sm:w-[600px] sm:h-[300px] bg-[#f97316]/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight">Готовы запустить свой проект?</h2>
            <p className="text-white/40 mb-6 sm:mb-8 text-sm sm:text-base">Выберите подходящий проект и начните работу уже сегодня</p>
            <Link to="/projects" className="btn-primary inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl">
              Перейти к каталогу <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}