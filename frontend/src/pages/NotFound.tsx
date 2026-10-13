import { Link } from 'react-router-dom';
import { useSeo } from '../utils/seo';

export default function NotFound() {
  useSeo({ title: '404 — страница не найдена', noindex: true });
  return (
    <div className="section-dark py-16 sm:py-24 lg:py-32">
      <div className="max-w-lg mx-auto px-4 text-center relative z-10">
        <h1 className="text-6xl sm:text-7xl font-black text-white/10 mb-4">404</h1>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">Страница не найдена</h2>
        <p className="text-white/40 text-sm sm:text-base mb-6 sm:mb-8">Такой страницы не существует или она была перемещена</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium">
          На главную
        </Link>
      </div>
    </div>
  );
}
