import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useApp } from '../store/AppContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const ok = login(email, password);
      if (ok) navigate('/profile');
      else setError('Неверный email или пароль');
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-5">
            <div className="relative w-10 h-10 flex-shrink-0">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-md shadow-blue-200" />
              <div className="absolute inset-[1.5px] rounded-[10px] bg-gradient-to-br from-blue-400/30 to-transparent" />
              <span className="absolute inset-0 flex items-center justify-center text-white font-black text-sm leading-none select-none" style={{ letterSpacing: '-0.03em' }}>PM</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[16px] font-black text-slate-900" style={{ letterSpacing: '-0.04em' }}>Project</span>
              <span className="text-[16px] font-black gradient-text" style={{ letterSpacing: '-0.04em' }}>Market</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Добро пожаловать</h1>
          <p className="text-slate-500 text-sm">Войдите в аккаунт для продолжения</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="mb-5 p-3 bg-blue-50 rounded-xl text-xs text-blue-700">
            <p className="font-semibold mb-1">Демо-аккаунты:</p>
            <p>Пользователь: user@demo.com / demo123</p>
            <p>Администратор: admin@projectsmarket.ru / Admin123</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Пароль</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Ваш пароль"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all pr-10"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <a href="#" className="text-xs text-blue-600 hover:underline">Забыли пароль?</a>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">Зарегистрироваться</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
