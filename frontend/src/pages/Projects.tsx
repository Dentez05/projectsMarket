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

  const clearFilters = () => {
    setSearch('');
    setCategory('Все');
    setPriceMin('');
    setPriceMax('');
    setPage(1);
  };

  const hasFilters = search || category !== 'Все' || priceMin || priceMax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Каталог проектов</h1>
        <p className="text-slate-500">Найдено {filtered.length} проектов</p>
      </div>

      {/* Search & filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по названию или описанию..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${filtersOpen ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}
        >
          <SlidersHorizontal size={15} /> Фильтры
          {hasFilters && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
        </button>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl border border-red-100 transition-colors">
            <X size={14} /> Сбросить
          </button>
        )}
      </div>

      {/* Filters expanded */}
      {filtersOpen && (
        <div className="bg-slate-50 rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Категория</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${category === cat ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Цена от (&#8381;)</label>
            <input
              type="number"
              placeholder="5 000"
              value={priceMin}
              onChange={e => { setPriceMin(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Цена до (&#8381;)</label>
            <input
              type="number"
              placeholder="50 000"
              value={priceMax}
              onChange={e => { setPriceMax(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
        </div>
      )}

      {/* Category pills (always visible) */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${category === cat ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {paginated.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginated.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${n === page ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:border-blue-400'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">&#128270;</p>
          <p className="text-lg font-semibold text-slate-700 mb-1">Ничего не найдено</p>
          <p className="text-slate-500 text-sm">Попробуйте изменить параметры поиска</p>
        </div>
      )}
    </div>
  );
}
