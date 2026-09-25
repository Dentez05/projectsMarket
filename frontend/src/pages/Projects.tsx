import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import ProjectCard from '../components/ProjectCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import ScrollReveal from '../components/ui/ScrollReveal';
import Pagination from '../components/Pagination';
import { useDebounce } from '../hooks/useDebounce';

const PAGE_SIZE = 9;

type SortOption = 'default' | 'popular' | 'price-asc' | 'price-desc' | 'newest';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default', label: 'По умолчанию' },
  { value: 'popular', label: 'По популярности' },
  { value: 'price-asc', label: 'Дешевле' },
  { value: 'price-desc', label: 'Дороже' },
  { value: 'newest', label: 'По новизне' },
];

export default function Projects() {
  const { projects, projectsLoaded } = useApp();
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get('category') || 'Все';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCat);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sort, setSort] = useState<SortOption>('default');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const allCategories = useMemo(() => {
    const fromProjects = projects.map(p => p.categoryName).filter(Boolean);
    return ['Все', ...new Set(fromProjects)];
  }, [projects]);

  const filtered = useMemo(() => {
    let result = projects.filter(p => {
      const matchSearch = !debouncedSearch || p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) || p.description.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchCat = category === 'Все' || p.categoryName === category;
      const matchMin = !priceMin || p.price >= Number(priceMin);
      const matchMax = !priceMax || p.price <= Number(priceMax);
      return matchSearch && matchCat && matchMin && matchMax;
    });

    switch (sort) {
      case 'default': result = [...result].sort((a, b) => b.id - a.id); break;
      case 'price-asc': result = [...result].sort((a, b) => a.price - b.price); break;
      case 'price-desc': result = [...result].sort((a, b) => b.price - a.price); break;
      case 'newest': result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case 'popular': result = [...result].sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0)); break;
    }

    return result;
  }, [debouncedSearch, category, priceMin, priceMax, sort, projects]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [debouncedSearch, category, priceMin, priceMax, sort]);

  const clearFilters = () => { setSearch(''); setCategory('Все'); setPriceMin(''); setPriceMax(''); setSort('default'); setPage(1); };
  const hasFilters = search || category !== 'Все' || priceMin || priceMax || sort !== 'default';

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
            <input type="text" placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)}
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
          <div className="bg-[#232a3b] border border-[#2e3548] rounded-2xl p-4 sm:p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2 block">Категория</label>
              <div className="flex flex-wrap gap-2">
                {allCategories.map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${category === cat ? 'bg-[#f97316] text-white' : 'bg-[#2a3244] border border-[#2e3548] text-white/60 hover:border-[#f97316]/30'}`}>{cat}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2 block">Цена от (&#8381;)</label>
              <input type="number" placeholder="5 000" value={priceMin} onChange={e => setPriceMin(e.target.value)}
                className="w-full px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2 block">Цена до (&#8381;)</label>
              <input type="number" placeholder="50 000" value={priceMax} onChange={e => setPriceMax(e.target.value)}
                className="w-full px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2 block">Сортировка</label>
              <div className="relative">
                <select value={sort} onChange={e => setSort(e.target.value as SortOption)}
                  className="w-full px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316] pr-8">
                  {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 mb-5 sm:mb-6 scrollbar-hide">
          {allCategories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`shrink-0 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${category === cat ? 'bg-[#f97316] text-white shadow-sm' : 'bg-[#232a3b] border border-[#2e3548] text-white/60 hover:border-[#f97316]/30 hover:text-[#f97316]'}`}>{cat}</button>
          ))}
        </div>

        {!projectsLoaded ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : visible.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {visible.map((p, i) => (
                <ScrollReveal key={p.id} delay={i * 50}>
                  <ProjectCard project={p} />
                </ScrollReveal>
              ))}
            </div>
            <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
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
