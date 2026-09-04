import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, HeadphonesIcon, Star } from 'lucide-react';
import { projects } from '../data/projects';
import ProjectCard from '../components/ProjectCard';

const STATS = [
  { value: '120+', label: 'Готовых проектов' },
  { value: '850+', label: 'Довольных клиентов' },
  { value: '4.9', label: 'Рейтинг' },
  { value: '48ч', label: 'Поддержка' },
];

const FEATURES = [
  {
    icon: <Zap size={22} className="text-blue-600" />,
    title: 'Быстрый старт',
    desc: 'Получите готовый проект за несколько минут. Никакого ожидания разработки.',
  },
  {
    icon: <Shield size={22} className="text-violet-600" />,
    title: 'Гарантия качества',
    desc: 'Каждый проект проверен и протестирован. Возврат средств, если что-то пойдёт не так.',
  },
  {
    icon: <HeadphonesIcon size={22} className="text-blue-600" />,
    title: 'Поддержка 24/7',
    desc: 'Помогаем с установкой и настройкой. Подробная документация к каждому проекту.',
  },
  {
    icon: <Star size={22} className="text-violet-600" />,
    title: 'Актуальные технологии',
    desc: 'Все проекты на современном стеке: React, Node.js, Python, Docker и другие.',
  },
];

export default function Home() {
  const popular = projects.filter(p => p.popular).slice(0, 4);
  const newest = projects.filter(p => p.isNew).slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-sm font-medium mb-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              Новые проекты каждую неделю
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Готовые IT-проекты<br />
              <span className="gradient-text">для вашего бизнеса</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
              Покупайте проверенные проекты и запускайте бизнес в разы быстрее. Экономьте месяцы разработки и тысячи рублей.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/projects" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-base">
                Смотреть проекты <ArrowRight size={18} />
              </Link>
              <a href="#features" className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                Как это работает
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold gradient-text mb-1">{s.value}</div>
                <div className="text-sm text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular projects */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-blue-600 font-semibold text-sm mb-1">Лидеры продаж</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Популярные проекты</h2>
            </div>
            <Link to="/projects" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
              Все проекты <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popular.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-violet-600 font-semibold text-sm mb-1">Почему мы</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Преимущества ProjectMarket</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="p-6 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New projects */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-violet-600 font-semibold text-sm mb-1">Свежие поступления</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Новые проекты</h2>
            </div>
            <Link to="/projects" className="text-sm font-semibold text-violet-600 hover:text-violet-700 flex items-center gap-1 transition-colors">
              Все проекты <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newest.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Готовы запустить свой проект?</h2>
          <p className="text-blue-100 mb-8">Выберите подходящий проект и начните работу уже сегодня</p>
          <Link to="/projects" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors">
            Перейти к каталогу <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
