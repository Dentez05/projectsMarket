import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, ArrowLeft } from 'lucide-react';
import { projects as mockProjects, CATEGORIES, type Project } from '../data/projects';

type View = 'list' | 'create' | 'edit';

export default function Admin() {
  const [view, setView] = useState<View>('list');
  const [projectList, setProjectList] = useState<Project[]>(mockProjects);
  const [filterCategory, setFilterCategory] = useState('Все');
  const [editingId, setEditingId] = useState<number | null>(null);

  const filtered = filterCategory === 'Все'
    ? projectList
    : projectList.filter(p => p.category === filterCategory);

  const handleDelete = (id: number) => {
    if (confirm('Удалить проект?')) {
      setProjectList(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleEdit = (id: number) => {
    setEditingId(id);
    setView('edit');
  };

  const handleCreate = () => {
    setEditingId(null);
    setView('create');
  };

  if (view === 'create' || view === 'edit') {
    return <ProjectForm onBack={() => setView('list')} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Проекты</h1>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus size={16} /> Создать проект
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">ID</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Название</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Категория</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Цена</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-500">#{p.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{p.title}</p>
                      <div className="flex gap-1 mt-0.5">
                        {p.isNew && <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-medium">Новый</span>}
                        {p.popular && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Популярный</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{p.category}</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{p.price.toLocaleString('ru-RU')} &#8381;</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(p.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function ProjectForm({ onBack }: { onBack: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState('E-commerce');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');
  const [demo, setDemo] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [popular, setPopular] = useState(false);

  const addTechnology = () => {
    if (techInput.trim() && !technologies.includes(techInput.trim())) {
      setTechnologies([...technologies, techInput.trim()]);
      setTechInput('');
    }
  };

  const removeTechnology = (tech: string) => {
    setTechnologies(technologies.filter(t => t !== tech));
  };

  const addImage = () => {
    if (imageInput.trim() && !images.includes(imageInput.trim())) {
      setImages([...images, imageInput.trim()]);
      setImageInput('');
    }
  };

  const removeImage = (url: string) => {
    setImages(images.filter(i => i !== url));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Проект создан!');
    onBack();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm font-medium">
        <ArrowLeft size={16} /> Назад к списку
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-8">Новый проект</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Название *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Краткое описание *</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Полное описание</label>
          <textarea value={fullDescription} onChange={e => setFullDescription(e.target.value)} rows={5}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Цена (&#8381;) *</label>
            <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} required min={0}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Категория</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              {CATEGORIES.filter(c => c !== 'Все').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Технологии</label>
          <div className="flex gap-2 mb-2">
            <input type="text" value={techInput} onChange={e => setTechInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
              placeholder="Добавить технологию"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <button type="button" onClick={addTechnology} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">Добавить</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {technologies.map(t => (
              <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
                {t}
                <button type="button" onClick={() => removeTechnology(t)} className="hover:text-blue-900"><X size={12} /></button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Ссылки на изображения</label>
          <div className="flex gap-2 mb-2">
            <input type="url" value={imageInput} onChange={e => setImageInput(e.target.value)}
              placeholder="URL изображения"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <button type="button" onClick={addImage} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">Добавить</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {images.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} alt="" className="w-full h-24 object-cover rounded-lg" />
                <button type="button" onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Демо-ссылка</label>
          <input type="url" value={demo} onChange={e => setDemo(e.target.value)} placeholder="https://..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isNew} onChange={e => setIsNew(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-slate-700">Новый</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={popular} onChange={e => setPopular(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-slate-700">Популярный</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button type="button" onClick={onBack} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            Отмена
          </button>
          <button type="submit" className="btn-primary px-6 py-2 text-sm">
            Создать проект
          </button>
        </div>
      </form>
    </div>
  );
}
