import { useState } from 'react';
import { X, Pencil, Trash2, Check, Plus, FolderTree } from 'lucide-react';
import { categoriesApi } from '../../api/categories';
import type { ApiCategory } from '../../api/types';

interface Props {
  categories: ApiCategory[];
  onClose: () => void;
  onChanged: () => void;
}

export default function CategoriesModal({ categories, onClose, onChanged }: Props) {
  const [items, setItems] = useState<ApiCategory[]>(categories);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const refresh = () => {
    categoriesApi.getAll().then(setItems).catch(() => {});
    onChanged();
  };

  const handleRename = async (id: number) => {
    const name = editName.trim();
    if (!name || busy) return;
    setBusy(true);
    setError('');
    try {
      const item = items.find(c => c.id === id);
      await categoriesApi.update(id, { name, description: item?.description ?? '' });
      setEditingId(null);
      refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Не удалось переименовать');
    }
    setBusy(false);
  };

  const handleDelete = async (item: ApiCategory) => {
    if (!window.confirm(`Удалить категорию «${item.name}»? Проекты останутся без категории.`)) return;
    setBusy(true);
    setError('');
    try {
      await categoriesApi.delete(item.id);
      refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить');
    }
    setBusy(false);
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name || busy) return;
    setBusy(true);
    setError('');
    try {
      await categoriesApi.create({ name, description: '' });
      setNewName('');
      refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Не удалось создать');
    }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-[#232a3b] border border-[#2e3548] rounded-2xl p-5 sm:p-6 max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#f97316]/10 flex items-center justify-center">
              <FolderTree size={16} className="text-[#f97316]" />
            </div>
            <h2 className="font-semibold text-white text-sm sm:text-base">Категории</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors">
            <X size={18} />
          </button>
        </div>

        {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3">{error}</p>}

        <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
          {items.map(c => (
            <div key={c.id} className="flex items-center gap-2 p-2.5 bg-[#2a3244] border border-[#2e3548] rounded-lg">
              {editingId === c.id ? (
                <>
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleRename(c.id); if (e.key === 'Escape') setEditingId(null); }}
                    autoFocus
                    maxLength={100}
                    className="flex-1 min-w-0 px-2.5 py-1.5 bg-[#232a3b] border border-[#2e3548] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]/50"
                  />
                  <button onClick={() => handleRename(c.id)} disabled={busy || !editName.trim()}
                    className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors disabled:opacity-40" title="Сохранить">
                    <Check size={15} />
                  </button>
                  <button onClick={() => setEditingId(null)}
                    className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="Отмена">
                    <X size={15} />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 min-w-0 truncate text-sm text-white/80">{c.name}</span>
                  <button onClick={() => { setEditingId(c.id); setEditName(c.name); setError(''); }}
                    className="p-1.5 text-white/40 hover:text-[#f97316] hover:bg-[#f97316]/10 rounded-lg transition-colors" title="Переименовать">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(c)} disabled={busy}
                    className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-40" title="Удалить">
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-xs text-white/30 text-center py-4">Категорий пока нет</p>
          )}
        </div>

        <div className="flex gap-2 pt-3 border-t border-[#2e3548]">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
            placeholder="Новая категория"
            maxLength={100}
            className="flex-1 min-w-0 px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]/50"
          />
          <button onClick={handleCreate} disabled={busy || !newName.trim()}
            className="btn-primary px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50">
            <Plus size={15} /> Добавить
          </button>
        </div>
      </div>
    </div>
  );
}
