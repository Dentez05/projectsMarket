import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ExternalLink, Calendar, Tag, ChevronRight, Check, ArrowLeft, Eye, Lock } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { projectsApi } from '../api/projects';
import type { ApiProject } from '../api/types';
import ProjectCard from '../components/ProjectCard';

function PreviewSection({ project }: { project: ApiProject }) {
  const screenshots = project.previewImages || [];
  const [active, setActive] = useState(0);

  if (screenshots.length === 0) return null;

  const cta = (
    <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-[#f97316]/10 to-transparent border border-[#f97316]/20 flex flex-col sm:flex-row items-center gap-3">
      <div className="flex items-center gap-2 text-[#f97316] shrink-0">
        <Lock size={16} />
        <span className="text-sm font-semibold">Полная версия доступна после покупки</span>
      </div>
      <p className="text-xs text-white/40 text-center sm:text-right sm:ml-auto">Все файлы, исходный код и документация</p>
    </div>
  );

  return (
    <div className="mb-10 sm:mb-16">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#f97316]/10 flex items-center justify-center">
          <Eye size={16} className="text-[#f97316]" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">Бесплатный превью</h2>
          <p className="text-xs text-white/40">Ознакомьтесь с частью проекта перед покупкой</p>
        </div>
      </div>

      <div className="rounded-xl sm:rounded-2xl border border-[#2e3548] bg-[#232a3b] overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2e3548] bg-[#1e2433]">
          <Eye size={15} className="text-[#f97316] shrink-0" />
          <span className="text-sm text-white/70 truncate font-medium">
            {screenshots.length > 1 ? `Скриншоты: ${screenshots.length}` : 'Скриншот'}
          </span>
        </div>

        <div className="p-4 sm:p-6">
          <img src={screenshots[active]} alt="Превью проекта" className="w-full rounded-lg border border-[#2e3548] bg-black/30" />

          {screenshots.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
              {screenshots.map((url, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${i === active ? 'border-[#f97316]' : 'border-[#2e3548] opacity-60 hover:opacity-100'}`}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {cta}
        </div>
      </div>
    </div>
  );
}

function PreviewFallback() {
  return (
    <div className="mb-10 sm:mb-16">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#f97316]/10 flex items-center justify-center">
          <Eye size={16} className="text-[#f97316]" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">Бесплатный превью</h2>
          <p className="text-xs text-white/40">Ознакомьтесь с частью проекта перед покупкой</p>
        </div>
      </div>

      <div className="rounded-xl sm:rounded-2xl border border-[#2e3548] bg-[#232a3b] overflow-hidden">
        <div className="flex flex-col items-center py-8 gap-3 px-4">
          <div className="w-14 h-14 rounded-xl bg-[#f97316]/10 flex items-center justify-center">
            <Lock size={26} className="text-[#f97316]" />
          </div>
          <p className="text-white/60 text-sm text-center">Файлы доступны для скачивания после покупки</p>
          <p className="text-xs text-white/30 text-center">В архиве проекта — исходный код и документация</p>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart, projects } = useApp();
  const [project, setProject] = useState<ApiProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    projectsApi.getById(Number(id))
      .then(setProject)
      .catch(() => setProject(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="pt-14 sm:pt-20 lg:pt-24">
        <div className="section-dark py-12 sm:py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
            <div className="w-8 h-8 border-2 border-[#f97316]/30 border-t-[#f97316] rounded-full animate-spin mx-auto" />
            <p className="text-white/40 mt-3 text-sm">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) return (
    <div className="pt-14 sm:pt-20 lg:pt-24">
      <div className="section-dark py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <p className="text-white/40">Проект не найден</p>
          <Link to="/projects" className="mt-4 inline-block text-[#f97316] hover:underline">Вернуться к каталогу</Link>
        </div>
      </div>
    </div>
  );

  const inCart = isInCart(project.id);
  const similar = projects.filter(p => p.categoryName === project.categoryName && p.id !== project.id).slice(0, 3);

  return (
    <div className="pt-14 sm:pt-20 lg:pt-24">
      <div className="section-dark py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <nav className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-white/30 mb-3 sm:mb-4 overflow-x-auto scrollbar-hide">
            <Link to="/" className="hover:text-[#f97316] transition-colors whitespace-nowrap">Главная</Link>
            <ChevronRight size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <Link to="/projects" className="hover:text-[#f97316] transition-colors whitespace-nowrap">Проекты</Link>
            <ChevronRight size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span className="text-white font-medium whitespace-nowrap">{project.title}</span>
          </nav>
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs sm:text-sm text-white/30 hover:text-[#f97316] transition-colors">
            <ArrowLeft size={14} className="sm:w-4 sm:h-4" /> Назад
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 mb-10 sm:mb-16">
          <div>
            <div className="rounded-xl sm:rounded-2xl overflow-hidden aspect-video bg-[#232a3b] mb-2.5 sm:mb-3">
              <img src={project.images?.[activeImg] || ''} alt={project.title} className="w-full h-full object-cover" />
            </div>
            {project.images && project.images.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-1">
                {project.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-16 h-11 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${i === activeImg ? 'border-[#f97316]' : 'border-[#2e3548] opacity-60 hover:opacity-100'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2.5 sm:mb-3">
              <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#f97316]/10 text-[#f97316] text-[10px] sm:text-xs font-semibold rounded-full">{project.categoryName}</span>
              {project.isNew && <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-purple-500/10 text-purple-400 text-[10px] sm:text-xs font-semibold rounded-full">Новый</span>}
              {project.popular && <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-amber-500/10 text-amber-400 text-[10px] sm:text-xs font-semibold rounded-full">Популярный</span>}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight mb-2.5 sm:mb-3">{project.title}</h1>
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/40 mb-4 sm:mb-5">
              <span className="flex items-center gap-1 sm:gap-1.5"><Calendar size={13} className="sm:w-3.5 sm:h-3.5" /> {new Date(project.createdAt).toLocaleDateString('ru-RU')}</span>
              <span className="flex items-center gap-1 sm:gap-1.5"><Tag size={13} className="sm:w-3.5 sm:h-3.5" /> {project.categoryName}</span>
            </div>
            <p className="text-white/60 leading-relaxed mb-5 sm:mb-6 text-sm sm:text-base">{project.fullDescription}</p>
            <div className="mb-6 sm:mb-8">
              <p className="text-[10px] sm:text-xs font-semibold text-white/30 uppercase tracking-wide mb-1.5 sm:mb-2">Технологии</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {project.technologies.map(t => (
                  <span key={t} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-[#f97316]/10 text-[#f97316] text-xs sm:text-sm font-medium rounded-lg">{t}</span>
                ))}
              </div>
            </div>
            <div className="p-4 sm:p-5 bg-[#232a3b] border border-[#2e3548] rounded-xl sm:rounded-2xl">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">{project.price.toLocaleString('ru-RU')} &#8381;</div>
              <div className="flex flex-col gap-2.5 sm:gap-3">
                <button onClick={async () => {
                    const ok = await addToCart(project);
                    if (!ok) navigate('/login');
                  }} disabled={inCart}
                  className={`flex items-center justify-center gap-2 py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl text-sm sm:text-base font-semibold transition-all ${inCart ? 'bg-green-500/10 text-green-400 border border-green-500/20 cursor-default' : 'btn-primary'}`}>
                  {inCart ? <><Check size={16} className="sm:w-[18px] sm:h-[18px]" /> В корзине</> : <><ShoppingCart size={16} className="sm:w-[18px] sm:h-[18px]" /> Добавить в корзину</>}
                </button>
                {project.demo && (
                  <a href={project.demo} target="_blank" rel="noopener noreferrer" className="btn-outline flex items-center justify-center gap-2 py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl text-sm sm:text-base font-semibold">
                    <ExternalLink size={16} className="sm:w-[18px] sm:h-[18px]" /> Попробовать демо
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {project.previewImages && project.previewImages.length > 0
          ? <PreviewSection project={project} />
          : <PreviewFallback />}

        {similar.length > 0 && (
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Похожие проекты</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {similar.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
