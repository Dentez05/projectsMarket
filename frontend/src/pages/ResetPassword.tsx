import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { authApi } from '../api/auth';
import { useSeo } from '../utils/seo';

export default function ResetPassword() {
  useSeo({ title: 'Новый пароль', noindex: true });
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Пароль должен быть не короче 6 символов');
      return;
    }
    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      navigate('/login', { state: { reset: true } });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg || 'Ссылка недействительна или устарела');
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="min-h-screen section-surface flex items-center justify-center px-4">
        <div className="bg-[#232a3b] border border-[#2e3548] rounded-2xl p-8 text-center max-w-md">
          <p className="text-white/60 mb-4">Ссылка некорректна — в ней нет токена.</p>
          <Link to="/forgot-password" className="text-[#f97316] font-medium hover:underline">Запросить новую</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen section-surface flex items-center justify-center px-4 py-10 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <KeyRound size={36} className="mx-auto text-[#f97316] mb-3" />
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Новый пароль</h1>
          <p className="text-white/40 text-xs sm:text-sm">Придумайте пароль для аккаунта</p>
        </div>
        <div className="bg-[#232a3b] border border-[#2e3548] rounded-2xl p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1.5">Новый пароль</label>
              <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="Минимум 6 символов" required
                className="w-full px-4 py-2.5 bg-[#2a3244] border border-[#2e3548] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]/50 transition-all" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1.5">Повторите пароль</label>
              <input type="password" value={confirm} onChange={e => { setConfirm(e.target.value); setError(''); }} placeholder="Ещё раз" required
                className="w-full px-4 py-2.5 bg-[#2a3244] border border-[#2e3548] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]/50 transition-all" />
            </div>
            {error && <p className="text-xs sm:text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 sm:py-3 rounded-xl text-sm sm:text-base">
              {loading ? 'Сохраняем…' : 'Сохранить пароль'}
            </button>
          </form>
          <p className="text-center text-xs sm:text-sm text-white/30 mt-4 sm:mt-5">
            <Link to="/login" className="text-[#f97316] font-medium hover:underline">Ко входу</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
