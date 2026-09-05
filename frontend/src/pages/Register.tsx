import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useApp } from '../store/AppContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { register(name, email, password); navigate('/profile'); }, 700);
  };

  return (
    <div className="min-h-screen section-surface flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#f97316]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-5">
            <div className="relative w-10 h-10 flex-shrink-0">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] shadow-md shadow-[#f97316]/20" />
              <div className="absolute inset-[1.5px] rounded-[10px] bg-gradient-to-br from-white/20 to-transparent" />
              <span className="absolute inset-0 flex items-center justify-center text-white font-black text-sm leading-none select-none" style={{ letterSpacing: '-0.03em' }}>PM</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[16px] font-black text-white" style={{ letterSpacing: '-0.04em' }}>Project</span>
              <span className="text-[16px] font-black text-[#f97316]" style={{ letterSpacing: '-0.04em' }}>Market</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Создать аккаунт</h1>
          <p className="text-white/40 text-sm">Зарегистрируйтесь, чтобы покупать проекты</p>
        </div>

        <div className="bg-[#232a3b] border border-[#2e3548] rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Имя</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Иван Петров" required
                className="w-full px-4 py-2.5 bg-[#2a3244] border border-[#2e3548] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]/50 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                className="w-full px-4 py-2.5 bg-[#2a3244] border border-[#2e3548] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]/50 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Пароль</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Минимум 6 символов" required minLength={6}
                  className="w-full px-4 py-2.5 bg-[#2a3244] border border-[#2e3548] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]/50 transition-all pr-10" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2 rounded-xl">
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
          <p className="text-center text-sm text-white/30 mt-5">
            Уже есть аккаунт? <Link to="/login" className="text-[#f97316] font-medium hover:underline">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
