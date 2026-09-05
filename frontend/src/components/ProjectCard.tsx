import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Check, X, ZoomIn } from 'lucide-react';
import { useApp } from '../store/AppContext';
import type { Project } from '../data/projects';

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  const { addToCart, isInCart } = useApp();
  const inCart = isInCart(project.id);
  const [lightbox, setLightbox] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <div className="relative max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <img src={project.image} alt={project.title} className="w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-5 py-4">
              <p className="text-white font-semibold text-base">{project.title}</p>
              <p className="text-white/70 text-sm">{project.category} · {project.price.toLocaleString('ru-RU')} ₽</p>
            </div>
            <button onClick={() => setLightbox(false)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#232a3b] rounded-2xl border border-[#2e3548] overflow-hidden card-hover group">
        <div className="relative overflow-hidden h-48 cursor-zoom-in" onClick={() => setLightbox(true)}>
          <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-[#f97316]/80 backdrop-blur-sm rounded-full p-2.5">
              <ZoomIn size={20} className="text-white drop-shadow" />
            </div>
          </div>
          <div className="absolute top-3 left-3 right-14 flex flex-wrap gap-1">
            {project.isNew && (
              <span className="px-2 py-0.5 bg-[#f97316] text-white text-[10px] font-semibold rounded-full whitespace-nowrap">Новый</span>
            )}
            {project.popular && (
              <span className="px-2 py-0.5 bg-amber-400 text-white text-[10px] font-semibold rounded-full whitespace-nowrap">Популярный</span>
            )}
          </div>
          <span className="group/cat absolute top-3 right-3 px-2 py-0.5 bg-[#232a3b]/90 text-white/80 text-[10px] font-medium rounded-full max-w-[56px] truncate cursor-default border border-[#2e3548]">
            {project.category}
            <span className="pointer-events-none absolute bottom-full right-0 mb-2 z-50 opacity-0 group-hover/cat:opacity-100 translate-y-1 group-hover/cat:translate-y-0 transition-all duration-150 bg-[#2a3244] text-white text-[11px] font-medium rounded-lg shadow-xl px-3 py-1.5 whitespace-nowrap border border-[#2e3548]">
              {project.category}
              <span className="absolute top-full right-3 border-4 border-transparent border-t-[#2a3244]" />
            </span>
          </span>
        </div>

        <div className="p-5 cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
          <h3 className="text-base font-semibold text-white mb-1.5 line-clamp-1 group-hover:text-[#f97316] transition-colors">{project.title}</h3>
          <p className="text-sm text-white/40 line-clamp-2 mb-4 leading-relaxed">{project.description}</p>

          <div className="flex flex-wrap gap-1 mb-4" onClick={e => e.stopPropagation()}>
            {project.technologies.slice(0, 3).map(t => (
              <span key={t} className="px-2 py-0.5 bg-[#f97316]/10 text-[#f97316] text-xs rounded-md font-medium">{t}</span>
            ))}
            {project.technologies.length > 3 && (
              <span className="relative group/tip px-2 py-0.5 bg-white/5 text-white/50 text-xs rounded-md cursor-default select-none hover:bg-white/10 transition-colors">
                +{project.technologies.length - 3}
                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 opacity-0 group-hover/tip:opacity-100 translate-y-1 group-hover/tip:translate-y-0 transition-all duration-150 bg-[#2a3244] text-white text-[11px] font-medium rounded-lg shadow-xl px-3 py-2 whitespace-nowrap flex flex-col gap-1 min-w-max border border-[#2e3548]">
                  {project.technologies.slice(3).map(t => (
                    <span key={t} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] flex-shrink-0" />
                      {t}
                    </span>
                  ))}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#2a3244]" />
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between" onClick={e => e.stopPropagation()}>
            <span className="text-xl font-bold text-white">{project.price.toLocaleString('ru-RU')} ₽</span>
            <div className="flex gap-2">
              <Link to={`/projects/${project.id}`} className="p-2 rounded-lg border border-[#2e3548] text-white/50 hover:border-[#f97316]/30 hover:text-[#f97316] transition-colors" title="Подробнее">
                <Eye size={15} />
              </Link>
              <button
                onClick={() => addToCart(project)}
                disabled={inCart}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  inCart ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default' : 'btn-primary'
                }`}
              >
                {inCart ? <><Check size={14} /> В корзине</> : <><ShoppingCart size={14} /> В корзину</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
