import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../store/AppContext';

export default function Header() {
  const { cart, user, logout } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 flex-shrink-0">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-md shadow-blue-200" />
              <div className="absolute inset-[1.5px] rounded-[10px] bg-gradient-to-br from-blue-400/30 to-transparent" />
              <span className="absolute inset-0 flex items-center justify-center text-white font-black text-[13px] tracking-tight leading-none select-none" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.03em' }}>PM</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-black text-slate-900 tracking-tight" style={{ letterSpacing: '-0.04em' }}>Project</span>
              <span className="text-[15px] font-black tracking-tight gradient-text" style={{ letterSpacing: '-0.04em' }}>Market</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/projects" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">Проекты</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-slate-600 hover:text-violet-600 font-medium transition-colors">Панель</Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors">
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cart.length}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name[0]}
                  </div>
                  <span className="text-sm font-medium text-slate-700 hidden sm:block">{user.name.split(' ')[0]}</span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <User size={14} /> Личный кабинет
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Settings size={14} /> Админ-панель
                      </Link>
                    )}
                    <hr className="my-1 border-slate-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                    >
                      <LogOut size={14} /> Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 px-3 py-1.5 transition-colors">
                  Войти
                </Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-1.5">
                  Регистрация
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-slate-600"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 py-3 space-y-1">
            <Link to="/projects" className="block px-3 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg" onClick={() => setMobileOpen(false)}>Проекты</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="block px-3 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg" onClick={() => setMobileOpen(false)}>Панель</Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
