import { useState, useEffect } from 'react';
import { Star, MessageSquare, Send } from 'lucide-react';
import { useApp, type Order } from '../store/AppContext';
import { reviewsApi } from '../api/reviews';
import type { ApiReview } from '../api/types';

interface Props {
  projectId: number;
  orders: Order[];
}

function Stars({ value, size = 13, onChange }: { value: number; size?: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" disabled={!onChange} onClick={() => onChange?.(n)}
          className={`${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}>
          <Star size={size} className={n <= value ? 'text-amber-400 fill-current' : 'text-white/20'} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsSection({ projectId, orders }: Props) {
  const { user } = useApp();
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    reviewsApi.getByProject(projectId).then(setReviews).catch(() => setReviews([]));
  }, [projectId]);

  const myReview = user ? reviews.find(r => r.userId === user.id) : undefined;
  const purchased = user
    ? orders.some(o => o.status === 'Delivered' && o.items.some(i => i.projectId === projectId))
    : false;
  const canReview = !!user && purchased && !myReview;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const created = await reviewsApi.create(projectId, { rating, comment });
      setReviews(prev => [created, ...prev]);
      setComment('');
      setRating(5);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg || 'Не удалось отправить отзыв');
    }
    setSending(false);
  };

  const avg = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)
    : 0;

  return (
    <div className="mb-10 sm:mb-16">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <div className="w-8 h-8 rounded-lg bg-[#f97316]/10 flex items-center justify-center">
          <MessageSquare size={16} className="text-[#f97316]" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">Отзывы</h2>
          <p className="text-xs text-white/40">
            {reviews.length > 0
              ? `Средняя оценка ${avg.toFixed(1)} из 5 · ${reviews.length} ${reviews.length === 1 ? 'отзыв' : 'отзывов'}`
              : 'Отзывов пока нет'}
          </p>
        </div>
      </div>

      {canReview && (
        <form onSubmit={handleSubmit} className="mb-5 p-4 sm:p-5 bg-[#232a3b] border border-[#2e3548] rounded-xl sm:rounded-2xl">
          <p className="text-sm font-semibold text-white mb-3">Оставить отзыв</p>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-white/50">Ваша оценка:</span>
            <Stars value={rating} size={18} onChange={setRating} />
          </div>
          <textarea value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Расскажите о проекте (необязательно)" rows={3} maxLength={2000}
            className="w-full px-3.5 py-2.5 bg-[#2a3244] border border-[#2e3548] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]/50 transition-all resize-none mb-3" />
          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3">{error}</p>}
          <button type="submit" disabled={sending}
            className="btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50">
            <Send size={14} /> {sending ? 'Отправляем…' : 'Отправить отзыв'}
          </button>
        </form>
      )}

      {user && !purchased && !myReview && (
        <p className="text-xs text-white/30 mb-4">Оставить отзыв можно после покупки проекта</p>
      )}

      <div className="space-y-3">
        {reviews.map(r => (
          <div key={r.id} className="p-4 bg-[#232a3b] border border-[#2e3548] rounded-xl sm:rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center text-white text-xs font-bold">
                {r.userName?.[0] || '?'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{r.userName}</p>
                <p className="text-[11px] text-white/30">{new Date(r.createdAt).toLocaleDateString('ru-RU')}</p>
              </div>
              <Stars value={r.rating} />
            </div>
            {r.comment && <p className="text-sm text-white/60 leading-relaxed whitespace-pre-line">{r.comment}</p>}
          </div>
        ))}
        {reviews.length === 0 && (
          <div className="p-6 text-center bg-[#232a3b] border border-[#2e3548] rounded-xl sm:rounded-2xl">
            <p className="text-sm text-white/40">Станьте первым, кто оценит этот проект</p>
          </div>
        )}
      </div>
    </div>
  );
}
