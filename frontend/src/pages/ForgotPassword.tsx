import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { authApi } from '../api/auth';
import { useSeo } from '../utils/seo';

export default function ForgotPassword() {
  useSeo({ title: 'Восстановление пароля', noindex: true });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen section-surface flex items-center justify-center px-4 py-10 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Восстановление пароля</h1>
          <p className="text-white/40 text-xs sm:text-sm">Пришлём ссылку для смены пароля на вашу почту</p>
        </div>
        <div className="bg-[#232a3b] border border-[#2e3548] rounded-2xl p-5 sm:p-8">
          {sent ? (
            <div className="text-center">
              <MailCheck size={40} className="mx-auto text-[#f97316] mb-4" />
              <p className="text-sm text-white/60 mb-2">Если аккаунт с таким email существует, письмо отправлено.</p>
              <p className="text-xs text-white/30 mb-6">Проверьте также папку «Спам».</p>
              <Link to="/login" className="btn-primary inline-flex px-6 py-2.5 rounded-xl text-sm">К входу</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                  className="w-full px-4 py-2.5 bg-[#2a3244] border border-[#2e3548] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]/50 transition-all" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 sm:py-3 rounded-xl text-sm sm:text-base">
                {loading ? 'Отправляем…' : 'Отправить ссылку'}
              </button>
            </form>
          )}
          <p className="text-center text-xs sm:text-sm text-white/30 mt-4 sm:mt-5">
            <Link to="/login" className="text-[#f97316] font-medium hover:underline">Вспомнили пароль?</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
