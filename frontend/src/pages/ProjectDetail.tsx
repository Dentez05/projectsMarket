import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ExternalLink, Calendar, Tag, ChevronRight, Check, ArrowLeft } from 'lucide-react';
import { projects } from '../data/projects';
import { useApp } from '../store/AppContext';
import ProjectCard from '../components/ProjectCard';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useApp();
  const project = projects.find(p => p.id === Number(id));
  const [activeImg, setActiveImg] = useState(0);

  if (!project) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-slate-500">Проект не найден</p>
      <Link to="/projects" className="mt-4 inline-block text-blue-600 hover:underline">Вернуться к каталогу</Link>
    </div>
  );

  const inCart = isInCart(project.id);
  const similar = projects.filter(p => p.category === project.category && p.id !== project.id).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-8">
        <Link to="/" className="hover:text-blue-600 transition-colors">Главная</Link>
        <ChevronRight size={14} />
        <Link to="/projects" className="hover:text-blue-600 transition-colors">Проекты</Link>
        <ChevronRight size={14} />
        <span className="text-slate-900 font-medium">{project.title}</span>
      </nav>

      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft size={15} /> Назад
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Gallery */}
        <div>
          <div className="rounded-2xl overflow-hidden aspect-video bg-slate-100 mb-3">
            <img src={project.images[activeImg]} alt={project.title} className="w-full h-full object-cover" />
          </div>
          {project.images.length > 1 && (
            <div className="flex gap-3">
              {project.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-blue-500' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">{project.category}</span>
            {project.isNew && <span className="px-2.5 py-1 bg-violet-50 text-violet-700 text-xs font-semibold rounded-full">Новый</span>}
            {project.popular && <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full">Популярный</span>}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">{project.title}</h1>

          <div className="flex items-center gap-4 text-sm text-slate-500 mb-5">
            <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(project.createdAt).toLocaleDateString('ru-RU')}</span>
            <span className="flex items-center gap-1.5"><Tag size={14} /> {project.category}</span>
          </div>

          <p className="text-slate-600 leading-relaxed mb-6">{project.fullDescription}</p>

          {/* Tech stack */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Технологии</p>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map(t => (
                <span key={t} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg">{t}</span>
              ))}
            </div>
          </div>

          {/* Price & buttons */}
          <div className="p-5 bg-slate-50 rounded-2xl">
            <div className="text-3xl font-bold text-slate-900 mb-4">{project.price.toLocaleString('ru-RU')} &#8381;</div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => addToCart(project)}
                disabled={inCart}
                className={`flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-base font-semibold transition-all ${inCart ? 'bg-green-50 text-green-700 border border-green-200 cursor-default' : 'btn-primary'}`}
              >
                {inCart ? <><Check size={18} /> В корзине</> : <><ShoppingCart size={18} /> Добавить в корзину</>}
              </button>
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-base font-semibold border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
                >
                  <ExternalLink size={18} /> Попробовать демо
                </a>
              )}
            </div>
          </div>

          {/* Author */}
          <div className="mt-5 p-4 bg-white border border-slate-100 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold">&#1048;</div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Иван Смирнов</p>
              <p className="text-xs text-slate-500">Full-stack разработчик &middot; 6 лет опыта</p>
            </div>
          </div>
        </div>
      </div>

      {/* Similar */}
      {similar.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-6">Похожие проекты</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similar.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
