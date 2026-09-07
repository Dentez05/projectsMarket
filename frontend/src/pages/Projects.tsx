import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { projects, CATEGORIES } from '../data/projects';
import ProjectCard from '../components/ProjectCard';

const PAGE_SIZE = 6;

export default function Projects() {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get('category') || 'Все';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCat);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return projects.filter(p => {
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'Все' || p.category === category;
      const matchMin = !priceMin || p.price >= Number(priceMin);
      const matchMax = !priceMax || p.price <= Number(priceMax);
      return matchSearch && matchCat && matchMin && matchMax;
    });
  }, [search, category, priceMin, priceMax]);

  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => { setSearch(''); setCategory('Все'); setPriceMin(''); setPriceMax(''); setPage(1); };
  const hasFilters = search || category !== 'Все' || priceMin || priceMax;

  return (
    <div className="pt-14 sm:pt-20 lg:pt-24">
      <div className="section-dark py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-1">Каталог проектов</h1>
          <p className="text-white/40 text-sm sm:text-base">Найдено {filtered.length} проектов</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row gap-3 mb-5 sm:mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" placeholder="Поиск..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 sm:pl-10 pr-4 py-2.5 bg-[#232a3b] border border-[#2e3548] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]/50 transition-all" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${filtersOpen ? 'bg-[#f97316]/10 border-[#f97316]/30 text-[#f97316]' : 'border-[#2e3548] text-white/60 hover:border-[#f97316]/30'}`}>
              <SlidersHorizontal size={15} /> <span className="hidden sm:inline">Фильтры</span>
              {hasFilters && <span className="w-2 h-2 bg-[#f97316] rounded-full" />}
            </button>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl border border-red-500/20 transition-colors">
                <X size={14} /> <span className="hidden sm:inline">Сбросить</span>
              </button>
            )}
          </div>
        </div>

        {filtersOpen && (
          <div className="bg-[#232a3b] border border-[#2e3548] rounded-2xl p-4 sm:p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2 block">Категория</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => { setCategory(cat); setPage(1); }}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${category === cat ? 'bg-[#f97316] text-white' : 'bg-[#2a3244] border border-[#2e3548] text-white/60 hover:border-[#f97316]/30'}`}>{cat}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2 block">Цена от (&#8381;)</label>
              <input type="number" placeholder="5 000" value={priceMin} onChange={e => { setPriceMin(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2 block">Цена до (&#8381;)</label>
              <input type="number" placeholder="50 000" value={priceMax} onChange={e => { setPriceMax(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]" />
            </div>
          </div>
        )}

        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 mb-5 sm:mb-6 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { setCategory(cat); setPage(1); }}
              className={`shrink-0 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${category === cat ? 'bg-[#f97316] text-white shadow-sm' : 'bg-[#232a3b] border border-[#2e3548] text-white/60 hover:border-[#f97316]/30 hover:text-[#f97316]'}`}>{cat}</button>
          ))}
        </div>

        {paginated.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {paginated.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
            {pages > 1 && (
              <div className="flex justify-center gap-1.5 sm:gap-2">
                {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-sm font-semibold transition-all ${n === page ? 'bg-[#f97316] text-white' : 'border border-[#2e3548] text-white/60 hover:border-[#f97316]'}`}>{n}</button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 sm:py-20">
            <p className="text-3xl sm:text-4xl mb-3 sm:mb-4">&#128270;</p>
            <p className="text-base sm:text-lg font-semibold text-white mb-1">Ничего не найдено</p>
            <p className="text-white/40 text-sm">Попробуйте изменить параметры поиска</p>
          </div>
        )}
      </div>
    </div>
  );
}