import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Check, Heart, Star } from 'lucide-react';
import { useApp } from '../store/AppContext';
import type { ApiProject } from '../api/types';

interface Props {
  project: ApiProject;
}

export default function ProjectCard({ project }: Props) {
  const { addToCart, isInCart, user, isFavorite, toggleFavorite } = useApp();
  const inCart = isInCart(project.id);
  const favorited = isFavorite(project.id);
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    await toggleFavorite(project.id);
  };

  const image = project.images?.[0] || '';
  const priceStr = project.price.toLocaleString('ru-RU');
  const priceSize = priceStr.length > 11
    ? 'text-sm sm:text-base'
    : priceStr.length > 7
    ? 'text-base sm:text-lg'
    : 'text-lg sm:text-xl';

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -8, y: x * 8 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="bg-[#232a3b] rounded-xl sm:rounded-2xl border border-[#2e3548] overflow-hidden card-hover group flex flex-col"
        style={{ transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transition: 'transform 0.15s ease-out' }}
      >
        <div className="relative overflow-hidden h-40 sm:h-44 lg:h-48 cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
          <img src={image} alt={project.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 right-10 sm:right-14 flex flex-wrap gap-1">
            {project.isNew && (
              <span className="px-1.5 sm:px-2 py-0.5 bg-[#f97316] text-white text-[9px] sm:text-[10px] font-semibold rounded-full whitespace-nowrap">Новый</span>
            )}
            {project.popular && (
              <span className="px-1.5 sm:px-2 py-0.5 bg-amber-400 text-white text-[9px] sm:text-[10px] font-semibold rounded-full whitespace-nowrap">Популярный</span>
            )}
          </div>
          <div className="group/cat absolute top-2 right-2 sm:top-3 sm:right-3 z-20">
            <span className="block px-1.5 sm:px-2 py-0.5 bg-[#232a3b]/90 text-white/80 text-[9px] sm:text-[10px] font-medium rounded-full max-w-[50px] sm:max-w-[56px] truncate cursor-default border border-[#2e3548]">
              {project.categoryName}
            </span>
            <span className="pointer-events-none absolute top-full right-0 mt-1.5 z-50 opacity-0 group-hover/cat:opacity-100 -translate-y-1 group-hover/cat:translate-y-0 transition-all duration-150 bg-[#2a3244] text-white text-[11px] font-medium rounded-lg shadow-xl px-2.5 py-1.5 whitespace-nowrap border border-[#2e3548] w-max max-w-none">
              <span className="absolute -top-1 right-3 w-2 h-2 rotate-45 bg-[#2a3244] border-l border-t border-[#2e3548]" />
              {project.categoryName}
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 lg:p-5 cursor-pointer flex-1 flex flex-col" onClick={() => navigate(`/projects/${project.id}`)}>
          <h3 className="text-sm sm:text-base font-semibold text-white mb-1 sm:mb-1.5 line-clamp-1 group-hover:text-[#f97316] transition-colors">{project.title}</h3>
          <p className="text-xs sm:text-sm text-white/40 line-clamp-2 mb-2 leading-relaxed">{project.description}</p>
          {project.averageRating != null && project.reviewsCount != null && project.reviewsCount > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star size={12} className="text-amber-400 fill-current" />
              <span className="text-[11px] sm:text-xs text-white/60 font-medium">{project.averageRating.toFixed(1)}</span>
              <span className="text-[11px] sm:text-xs text-white/30">({project.reviewsCount})</span>
            </div>
          )}

          <div className="flex flex-wrap gap-1 mb-3 sm:mb-4" onClick={e => e.stopPropagation()}>
            {project.technologies.slice(0, 3).map(t => (
              <span key={t} className="px-1.5 sm:px-2 py-0.5 bg-[#f97316]/10 text-[#f97316] text-[10px] sm:text-xs rounded-md font-medium">{t}</span>
            ))}
            {project.technologies.length > 3 && (
              <span className="relative group/tip px-1.5 sm:px-2 py-0.5 bg-white/5 text-white/50 text-[10px] sm:text-xs rounded-md cursor-default select-none hover:bg-white/10 transition-colors">
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

          <div className="flex items-center justify-between gap-2 min-w-0 mt-auto pt-1" onClick={e => e.stopPropagation()}>
            <span className={`${priceSize} font-bold text-white whitespace-nowrap`}>{priceStr} ₽</span>
            <div className="flex gap-1.5 sm:gap-2 flex-shrink-0">
              <button
                onClick={handleFavorite}
                title={favorited ? 'Убрать из избранного' : 'В избранное'}
                className={`p-1.5 sm:p-2 rounded-lg border transition-colors ${
                  favorited
                    ? 'border-[#f97316]/40 text-[#f97316] bg-[#f97316]/10'
                    : 'border-[#2e3548] text-white/50 hover:border-[#f97316]/30 hover:text-[#f97316]'
                }`}
              >
                <Heart size={14} className={`sm:w-4 sm:h-4 ${favorited ? 'fill-current' : ''}`} />
              </button>
              <Link to={`/projects/${project.id}`} className="p-1.5 sm:p-2 rounded-lg border border-[#2e3548] text-white/50 hover:border-[#f97316]/30 hover:text-[#f97316] transition-colors" title="Подробнее">
                <Eye size={14} className="sm:w-4 sm:h-4" />
              </Link>
              <button
                onClick={async () => {
                  const ok = await addToCart(project);
                  if (!ok) navigate('/login');
                }}
                disabled={inCart}
                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  inCart ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default' : 'btn-primary'
                }`}
              >
                {inCart ? <><Check size={13} className="shrink-0" /> <span>В корзине</span></> : <><ShoppingCart size={13} className="shrink-0" /> <span>В корзину</span></>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
