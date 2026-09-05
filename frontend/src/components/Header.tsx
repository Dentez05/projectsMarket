import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Settings, Menu, X, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApp } from '../store/AppContext';

export default function Header() {
  const { cart, user, logout } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-[#1a1f2e]/95 backdrop-blur-md border-b border-[#2e3548] shadow-lg shadow-black/20'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="relative w-11 h-11 flex-shrink-0">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] shadow-md shadow-[#f97316]/20" />
              <div className="absolute inset-[1.5px] rounded-[10px] bg-gradient-to-br from-white/20 to-transparent" />
              <span className="absolute inset-0 flex items-center justify-center text-white font-black text-base leading-none select-none" style={{ letterSpacing: '-0.03em' }}>PM</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black text-white tracking-tight" style={{ letterSpacing: '-0.04em' }}>Project</span>
              <span className="text-xl font-black tracking-tight text-[#f97316]" style={{ letterSpacing: '-0.04em' }}>Market</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/projects" className="text-white/80 hover:text-[#f97316] font-semibold transition-colors text-base">Проекты</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-white/80 hover:text-[#f97316] font-semibold transition-colors text-base">Панель</Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <a href="tel:+79001234567" className="hidden lg:flex items-center gap-2 text-white/60 hover:text-[#f97316] text-base font-medium transition-colors">
              <Phone size={18} /> +7 (900) 123-45-67
            </a>

            <Link to="/cart" className="relative p-2.5 text-white/80 hover:text-[#f97316] transition-colors">
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5.5 h-5.5 bg-[#f97316] text-white text-xs rounded-full flex items-center justify-center font-bold leading-none pt-0.5">
                  {cart.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center text-white text-sm font-bold">
                    {user.name[0]}
                  </div>
                  <span className="text-base font-semibold text-white/90 hidden sm:block">{user.name.split(' ')[0]}</span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-[#232a3b] rounded-xl shadow-2xl border border-[#2e3548] py-1 z-50">
                    <Link to="/profile" className="flex items-center gap-2.5 px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-[#f97316] transition-colors" onClick={() => setProfileOpen(false)}>
                      <User size={16} /> Личный кабинет
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-2.5 px-4 py-3 text-sm text-white/70 hover:bg-white/5 hover:text-[#f97316] transition-colors" onClick={() => setProfileOpen(false)}>
                        <Settings size={16} /> Админ-панель
                      </Link>
                    )}
                    <hr className="my-1 border-[#2e3548]" />
                    <button onClick={handleLogout} className="flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 w-full transition-colors">
                      <LogOut size={16} /> Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-base font-medium text-white/70 hover:text-[#f97316] px-3 py-2 transition-colors">Войти</Link>
                <Link to="/register" className="btn-primary text-base font-semibold px-5 py-2 rounded-lg">Регистрация</Link>
              </div>
            )}

            <button className="md:hidden p-2 text-white/80" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-[#2e3548] py-3 space-y-1">
            <Link to="/projects" className="block px-3 py-2.5 text-white/80 font-semibold text-base hover:bg-white/5 rounded-lg" onClick={() => setMobileOpen(false)}>Проекты</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="block px-3 py-2.5 text-white/80 font-semibold text-base hover:bg-white/5 rounded-lg" onClick={() => setMobileOpen(false)}>Панель</Link>
            )}
            <a href="tel:+79001234567" className="block px-3 py-2.5 text-white/50 font-medium text-base hover:bg-white/5 rounded-lg">+7 (900) 123-45-67</a>
          </div>
        )}
      </div>
    </header>
  );
}
