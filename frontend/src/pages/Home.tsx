import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, HeadphonesIcon, Star, ShoppingCart, ChevronRight, Eye, CreditCard, Download, Rocket } from 'lucide-react';
import { useMemo } from 'react';
import { useApp } from '../store/AppContext';
import ProjectCard from '../components/ProjectCard';
import ScrollReveal from '../components/ui/ScrollReveal';
import { useSeo } from '../utils/seo';

const FEATURES = [
  { icon: <Zap size={24} className="text-[#f97316]" />, title: 'Быстрый старт', desc: 'Получите готовый проект за несколько минут. Никакого ожидания разработки.' },
  { icon: <Shield size={24} className="text-[#f97316]" />, title: 'Гарантия качества', desc: 'Каждый проект проверен и протестирован. Возврат средств, если что-то пойдёт не так.' },
  { icon: <HeadphonesIcon size={24} className="text-[#f97316]" />, title: 'Поддержка 24/7', desc: 'Помогаем с установкой и настройкой. Подробная документация к каждому проекту.' },
  { icon: <Star size={24} className="text-[#f97316]" />, title: 'Актуальные технологии', desc: 'Все проекты на современном стеке: React, Node.js, Python, Docker и другие.' },
];

const CATEGORY_ICONS: Record<string, typeof ShoppingCart> = {
  'E-commerce': ShoppingCart,
  'Dashboard': Zap,
  'CRM': HeadphonesIcon,
};

export default function Home() {
  const { projects } = useApp();
  const visible = useMemo(() => projects.filter(p => p.status === 'Active'), [projects]);
  const popular = visible.filter(p => p.popular).slice(0, 4);
  const newest = visible.filter(p => p.isNew).slice(0, 4);

  useSeo({
    title: 'ProjectMarket — Маркетплейс готовых IT-проектов',
    description: 'Покупайте готовые IT-проекты: e-commerce, CRM, дашборды, мобильные приложения. Запускайте бизнес быстрее с проверенными решениями.',
    keywords: 'IT проекты, маркетплейс, e-commerce, CRM, дашборд, купить проект, готовые решения',
    path: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'ProjectMarket',
      url: '/',
      description: 'Маркетплейс готовых IT-проектов',
      potentialAction: {
        '@type': 'SearchAction',
        target: '/projects?search={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  });

  const categories = useMemo(() => {
    const names = [...new Set(visible.map(p => p.categoryName).filter(Boolean))];
    return names.slice(0, 4);
  }, [visible]);

  return (
    <div>
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
                <a href="#how-it-works" className="btn-outline inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base rounded-xl">
                  Как это работает
                </a>
              </div>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {categories.map((cat, i) => {
              const Icon = CATEGORY_ICONS[cat] || Zap;
              const count = visible.filter(p => p.categoryName === cat).length;
              return (
                <ScrollReveal key={cat} delay={300 + i * 75}>
                  <Link to={`/projects?category=${cat}`} className="block bg-[#232a3b]/80 backdrop-blur-sm border border-[#2e3548] rounded-xl p-3.5 sm:p-5 group cursor-pointer transition-all duration-300 hover:border-[#f97316]/30 hover:bg-[#2a3244]/80">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#f97316]/10 flex items-center justify-center text-[#f97316] mb-2.5 sm:mb-3 group-hover:scale-110 transition-transform"><Icon size={20} /></div>
                    <h3 className="text-white font-semibold text-xs sm:text-sm mb-1 sm:mb-1.5">{cat}</h3>
                    <p className="text-white/40 text-[10px] sm:text-xs leading-relaxed hidden sm:block">{count} проектов</p>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

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

      <section id="how-it-works" className="py-10 sm:py-16 lg:py-20 section-surface relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[#f97316]/3 rounded-full blur-[80px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-10 sm:mb-14">
              <p className="text-[#f97316] font-semibold text-xs sm:text-sm mb-1.5 sm:mb-2 uppercase tracking-wide">Как это работает</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">Четыре шага до вашего проекта</h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
            <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-[#f97316]/20 to-transparent" />

            {[
              { step: '01', icon: <Eye size={24} className="text-[#f97316]" />, title: 'Выберите проект', desc: 'Просмотрите каталог и найдите подходящее решение. Ознакомьтесь с демо-версией, изучите описание и технологии.' },
              { step: '02', icon: <CreditCard size={24} className="text-[#f97316]" />, title: 'Оформите покупку', desc: 'Добавьте проект в корзину и оплатите. После подтверждения оплаты полная версия станет доступна мгновенно.' },
              { step: '03', icon: <Download size={24} className="text-[#f97316]" />, title: 'Скачайте материалы', desc: 'Получите полный исходный код, документацию и инструкции по настройке. Все файлы доступны в личном кабинете.' },
              { step: '04', icon: <Rocket size={24} className="text-[#f97316]" />, title: 'Запустите проект', desc: 'Разверните проект на своём сервере или хостинге. При необходимости обратитесь в поддержку — мы поможем с настройкой.' },
            ].map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 100}>
                <div className="relative text-center group">
                  <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 mb-5 sm:mb-6">
                    <div className="absolute inset-0 rounded-2xl bg-[#232a3b] border border-[#2e3548] group-hover:border-[#f97316]/30 transition-colors duration-300 rotate-45" />
                    <div className="absolute inset-0 flex items-center justify-center">{item.icon}</div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#f97316] text-white text-xs font-bold flex items-center justify-center shadow-lg shadow-[#f97316]/30">{item.step}</span>
                  </div>
                  <h3 className="font-semibold text-white text-sm sm:text-base mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-white/40 leading-relaxed max-w-[250px] mx-auto">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={400}>
            <div className="mt-10 sm:mt-14 text-center">
              <div className="inline-flex items-center gap-3 px-5 sm:px-6 py-3 sm:py-3.5 bg-[#232a3b] border border-[#2e3548] rounded-xl sm:rounded-2xl">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs sm:text-sm text-white/50">
                  Демо-версия доступна <span className="text-white/80 font-medium">бесплатно</span> — попробуйте перед покупкой
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

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
