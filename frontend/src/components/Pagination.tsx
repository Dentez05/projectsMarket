import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(page: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];
  if (page > 3) pages.push('...');

  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (page < totalPages - 2) pages.push('...');
  pages.push(totalPages);
  return pages;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const go = (p: number) => {
    onPageChange(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8">
      <button
        onClick={() => go(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-lg border border-[#2e3548] text-white/50 hover:border-[#f97316]/40 hover:text-[#f97316] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[#2e3548] disabled:hover:text-white/50 transition-colors"
        aria-label="Предыдущая страница"
      >
        <ChevronLeft size={16} />
      </button>

      {getPageNumbers(page, totalPages).map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-1 sm:px-1.5 text-white/30 text-sm select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-all ${
              p === page
                ? 'bg-[#f97316] text-white shadow-sm shadow-[#f97316]/20'
                : 'border border-[#2e3548] text-white/50 hover:border-[#f97316]/40 hover:text-[#f97316]'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => go(page + 1)}
        disabled={page === totalPages}
        className="p-2 rounded-lg border border-[#2e3548] text-white/50 hover:border-[#f97316]/40 hover:text-[#f97316] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-[#2e3548] disabled:hover:text-white/50 transition-colors"
        aria-label="Следующая страница"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
