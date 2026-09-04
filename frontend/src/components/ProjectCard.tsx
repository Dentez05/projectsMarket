import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Check } from 'lucide-react';
import { useApp } from '../store/AppContext';
import type { Project } from '../data/projects';

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  const { addToCart, isInCart } = useApp();
  const inCart = isInCart(project.id);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden card-hover group">
      <div className="relative overflow-hidden h-48">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-3 left-3 right-14 flex flex-wrap gap-1">
          {project.isNew && (
            <span className="px-2 py-0.5 bg-violet-500 text-white text-[10px] font-semibold rounded-full whitespace-nowrap">Новый</span>
          )}
          {project.popular && (
            <span className="px-2 py-0.5 bg-amber-400 text-white text-[10px] font-semibold rounded-full whitespace-nowrap">Популярный</span>
          )}
        </div>
        <span className="absolute top-3 right-3 px-2 py-0.5 bg-white/90 text-slate-700 text-[10px] font-medium rounded-full max-w-[56px] truncate">
          {project.category}
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-base font-semibold text-slate-900 mb-1.5 line-clamp-1">{project.title}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">{project.description}</p>

        <div className="flex flex-wrap gap-1 mb-4">
          {project.technologies.slice(0, 3).map(t => (
            <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">{t}</span>
          ))}
          {project.technologies.length > 3 && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-md">+{project.technologies.length - 3}</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-slate-900">
            {project.price.toLocaleString('ru-RU')} &#8381;
          </span>
          <div className="flex gap-2">
            <Link
              to={`/projects/${project.id}`}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
              title="Подробнее"
            >
              <Eye size={15} />
            </Link>
            <button
              onClick={() => addToCart(project)}
              disabled={inCart}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                inCart
                  ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                  : 'btn-primary'
              }`}
            >
              {inCart ? <><Check size={14} /> В корзине</> : <><ShoppingCart size={14} /> В корзину</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
