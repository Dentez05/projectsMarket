import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, ArrowLeft } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { projectsApi } from '../api/projects';
import { categoriesApi } from '../api/categories';
import type { ApiProject, ApiCategory } from '../api/types';

type View = 'list' | 'create' | 'edit';

const CATEGORIES = ['E-commerce', 'Dashboard', 'CRM', 'Мобильное', 'API', 'Чат-бот', 'Аналитика'];

export default function Admin() {
  const { projects, projectsLoaded } = useApp();
  const [view, setView] = useState<View>('list');
  const [filterCategory, setFilterCategory] = useState('Все');
  const [projectList, setProjectList] = useState<ApiProject[]>([]);
  const [editingProject, setEditingProject] = useState<ApiProject | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);

  useEffect(() => {
    setProjectList(projects);
  }, [projects]);

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(() => {});
  }, []);

  const filtered = filterCategory === 'Все' ? projectList : projectList.filter(p => p.categoryName === filterCategory);

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить проект?')) return;
    try {
      await projectsApi.delete(id);
      setProjectList(prev => prev.filter(p => p.id !== id));
    } catch {}
  };

  const handleEdit = (project: ApiProject) => {
    setEditingProject(project);
    setView('edit');
  };

  const handleCreated = (project: ApiProject) => {
    setProjectList(prev => [project, ...prev]);
    setView('list');
  };

  const handleUpdated = (project: ApiProject) => {
    setProjectList(prev => prev.map(p => p.id === project.id ? project : p));
    setView('list');
    setEditingProject(null);
  };

  if (view === 'create') {
    return <ProjectForm onBack={() => setView('list')} onCreated={handleCreated} categories={categories} />;
  }

  if (view === 'edit' && editingProject) {
    return <ProjectForm onBack={() => { setView('list'); setEditingProject(null); }} onCreated={handleUpdated} categories={categories} project={editingProject} />;
  }

  return (
    <div className="pt-14 sm:pt-20 lg:pt-24">
      <div className="section-dark py-6 sm:py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">Панель управления</h1>
            <button onClick={() => setView('create')} className="btn-primary flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg flex-shrink-0">
              <Plus size={15} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Создать проект</span><span className="sm:hidden">Создать</span>
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 mb-5 sm:mb-6 scrollbar-hide">
          <button onClick={() => setFilterCategory('Все')}
            className={`shrink-0 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${filterCategory === 'Все' ? 'bg-[#f97316] text-white' : 'bg-[#232a3b] border border-[#2e3548] text-white/60 hover:border-[#f97316]/30'}`}>Все</button>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFilterCategory(cat)}
              className={`shrink-0 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${filterCategory === cat ? 'bg-[#f97316] text-white' : 'bg-[#232a3b] border border-[#2e3548] text-white/60 hover:border-[#f97316]/30'}`}>{cat}</button>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block bg-[#232a3b] rounded-xl border border-[#2e3548] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#2a3244] border-b border-[#2e3548]">
              <tr>
                <th className="text-left px-5 lg:px-6 py-3 text-xs font-semibold text-white/40 uppercase">ID</th>
                <th className="text-left px-5 lg:px-6 py-3 text-xs font-semibold text-white/40 uppercase">Название</th>
                <th className="text-left px-5 lg:px-6 py-3 text-xs font-semibold text-white/40 uppercase hidden md:table-cell">Категория</th>
                <th className="text-left px-5 lg:px-6 py-3 text-xs font-semibold text-white/40 uppercase">Цена</th>
                <th className="text-right px-5 lg:px-6 py-3 text-xs font-semibold text-white/40 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e3548]">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-[#2a3244] transition-colors">
                  <td className="px-5 lg:px-6 py-3.5 text-sm text-white/40">#{p.id}</td>
                  <td className="px-5 lg:px-6 py-3.5">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <img src={p.images?.[0] || ''} alt="" className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{p.title}</p>
                        <div className="flex gap-1 mt-0.5">
                          {p.isNew && <span className="text-[10px] bg-[#f97316]/10 text-[#f97316] px-1.5 py-0.5 rounded font-medium">Новый</span>}
                          {p.popular && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-medium">Популярный</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 lg:px-6 py-3.5 text-sm text-white/50 hidden md:table-cell">{p.categoryName}</td>
                  <td className="px-5 lg:px-6 py-3.5 text-sm font-semibold text-white">{p.price.toLocaleString('ru-RU')} &#8381;</td>
                  <td className="px-5 lg:px-6 py-3.5">
                    <div className="flex justify-end gap-1.5 sm:gap-2">
                      <button onClick={() => handleEdit(p)} className="p-1.5 sm:p-2 rounded-lg text-white/40 hover:text-[#f97316] hover:bg-[#f97316]/10 transition-colors"><Pencil size={14} className="sm:w-[15px] sm:h-[15px]" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 sm:p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} className="sm:w-[15px] sm:h-[15px]" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden space-y-2.5">
          {filtered.map(p => (
            <div key={p.id} className="bg-[#232a3b] rounded-xl border border-[#2e3548] p-3.5 flex items-center gap-3">
              <img src={p.images?.[0] || ''} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{p.title}</p>
                <div className="flex gap-1 mt-0.5 flex-wrap">
                  <span className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded">{p.categoryName}</span>
                  {p.isNew && <span className="text-[10px] bg-[#f97316]/10 text-[#f97316] px-1.5 py-0.5 rounded font-medium">Новый</span>}
                  {p.popular && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-medium">Популярный</span>}
                </div>
                <p className="font-semibold text-white text-sm mt-1">{p.price.toLocaleString('ru-RU')} &#8381;</p>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg text-white/40 hover:text-[#f97316] hover:bg-[#f97316]/10 transition-colors"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ProjectFormProps {
  onBack: () => void;
  onCreated: (project: ApiProject) => void;
  categories: ApiCategory[];
  project?: ApiProject;
}

function ProjectForm({ onBack, onCreated, categories, project }: ProjectFormProps) {
  const [title, setTitle] = useState(project?.title || '');
  const [description, setDescription] = useState(project?.description || '');
  const [fullDescription, setFullDescription] = useState(project?.fullDescription || '');
  const [price, setPrice] = useState(project?.price || 0);
  const [categoryId, setCategoryId] = useState<number | null>(project?.categoryId || null);
  const [technologies, setTechnologies] = useState<string[]>(project?.technologies || []);
  const [techInput, setTechInput] = useState('');
  const [demo, setDemo] = useState(project?.demo || '');
  const [images, setImages] = useState<string[]>(project?.images || []);
  const [imageInput, setImageInput] = useState('');
  const [isNew, setIsNew] = useState(project?.isNew || false);
  const [popular, setPopular] = useState(project?.popular || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addTechnology = () => { if (techInput.trim() && !technologies.includes(techInput.trim())) { setTechnologies([...technologies, techInput.trim()]); setTechInput(''); } };
  const removeTechnology = (tech: string) => setTechnologies(technologies.filter(t => t !== tech));
  const addImage = () => { if (imageInput.trim() && !images.includes(imageInput.trim())) { setImages([...images, imageInput.trim()]); setImageInput(''); } };
  const removeImage = (url: string) => setImages(images.filter(i => i !== url));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = {
        title, description, fullDescription, price,
        categoryId, images, technologies, demo, isNew, popular,
      };
      if (project) {
        const updated = await projectsApi.update(project.id, data);
        onCreated(updated);
      } else {
        const created = await projectsApi.create(data);
        onCreated(created);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    }
    setLoading(false);
  };

  return (
    <div className="pt-14 sm:pt-20 lg:pt-24">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
        <button onClick={onBack} className="flex items-center gap-1.5 sm:gap-2 text-white/40 hover:text-[#f97316] mb-5 sm:mb-6 text-xs sm:text-sm font-medium transition-colors">
          <ArrowLeft size={15} className="sm:w-4 sm:h-4" /> Назад к списку
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">{project ? 'Редактировать проект' : 'Новый проект'}</h1>
        <form onSubmit={handleSubmit} className="bg-[#232a3b] rounded-xl border border-[#2e3548] p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1">Название *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]" />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1">Краткое описание *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={2}
              className="w-full px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]" />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1">Полное описание</label>
            <textarea value={fullDescription} onChange={e => setFullDescription(e.target.value)} rows={4}
              className="w-full px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1">Цена (&#8381;) *</label>
              <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} required min={0}
                className="w-full px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1">Категория</label>
              <select value={categoryId || ''} onChange={e => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]">
                <option value="">Не указана</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1">Технологии</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={techInput} onChange={e => setTechInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTechnology())} placeholder="Добавить"
                className="flex-1 px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]" />
              <button type="button" onClick={addTechnology} className="px-3 py-2 bg-[#2a3244] border border-[#2e3548] text-white/60 rounded-lg text-sm font-medium hover:bg-[#374155] transition-colors">+</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {technologies.map(t => (
                <span key={t} className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#f97316]/10 text-[#f97316] text-[10px] sm:text-xs font-medium rounded-md">
                  {t}
                  <button type="button" onClick={() => removeTechnology(t)} className="hover:text-[#ea580c]"><X size={11} className="sm:w-3 sm:h-3" /></button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1">Ссылки на изображения</label>
            <div className="flex gap-2 mb-2">
              <input type="url" value={imageInput} onChange={e => setImageInput(e.target.value)} placeholder="URL изображения"
                className="flex-1 px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]" />
              <button type="button" onClick={addImage} className="px-3 py-2 bg-[#2a3244] border border-[#2e3548] text-white/60 rounded-lg text-sm font-medium hover:bg-[#374155] transition-colors">+</button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {images.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt="" className="w-full h-16 sm:h-24 object-cover rounded-lg" />
                  <button type="button" onClick={() => removeImage(url)} className="absolute top-0.5 right-0.5 p-0.5 sm:p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} className="sm:w-3 sm:h-3" /></button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1">Демо-ссылка</label>
            <input type="url" value={demo} onChange={e => setDemo(e.target.value)} placeholder="https://..."
              className="w-full px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]" />
          </div>
          <div className="flex gap-4 sm:gap-6">
            <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
              <input type="checkbox" checked={isNew} onChange={e => setIsNew(e.target.checked)} className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-[#2e3548] text-[#f97316] focus:ring-[#f97316] bg-[#2a3244]" />
              <span className="text-xs sm:text-sm text-white/60">Новый</span>
            </label>
            <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
              <input type="checkbox" checked={popular} onChange={e => setPopular(e.target.checked)} className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-[#2e3548] text-[#f97316] focus:ring-[#f97316] bg-[#2a3244]" />
              <span className="text-xs sm:text-sm text-white/60">Популярный</span>
            </label>
          </div>
          {error && <p className="text-xs sm:text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex justify-end gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-[#2e3548]">
            <button type="button" onClick={onBack} className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white/50 hover:bg-white/5 rounded-lg transition-colors">Отмена</button>
            <button type="submit" disabled={loading} className="btn-primary px-5 sm:px-6 py-2 text-xs sm:text-sm rounded-lg flex items-center gap-2">
              {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {project ? 'Сохранить' : 'Создать проект'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
