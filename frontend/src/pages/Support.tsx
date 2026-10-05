import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, ChevronDown, MessageCircle, Phone, Mail, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { supportApi } from '../api/support';
import type { ApiSupportTicket } from '../api/types';

const FAQ = [
  {
    q: 'Как купить проект?',
    a: 'Выберите проект в каталоге, добавьте в корзину и оформите заказ. После оплаты файлы станут доступны для скачивания в личном кабинете.',
  },
  {
    q: 'Как скачать купленный проект?',
    a: 'После оплаты откройте личный кабинет → «История заказов» и нажмите «Скачать» напротив оплаченного заказа.',
  },
  {
    q: 'Какие способы оплаты доступны?',
    a: 'Оплата производится через ЮKassa — банковские карты (Visa, MasterCard, МИР), СБП и электронные кошельки.',
  },
  {
    q: 'Можно ли вернуть деньги?',
    a: 'Если проект не соответствует описанию — обратитесь в поддержку в течение 24 часов после покупки, мы разберёмся и поможем.',
  },
  {
    q: 'Что делать, если проект не запускается?',
    a: 'Напишите в поддержку — приложите описание ошибки. Мы поможем с установкой и настройкой или предложим замену.',
  },
];

const STATUS_MAP: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  Open: { label: 'Открыто', icon: <Clock size={13} />, color: 'text-amber-400 bg-amber-500/10' },
  Answered: { label: 'Отвечено', icon: <CheckCircle size={13} />, color: 'text-green-400 bg-green-500/10' },
  Closed: { label: 'Закрыто', icon: <XCircle size={13} />, color: 'text-white/40 bg-white/5' },
};

export default function Support() {
  const { user, authReady } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState<ApiSupportTicket[]>([]);
  const [ticketsLoaded, setTicketsLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    supportApi.getMy()
      .then(setTickets)
      .catch(() => {})
      .finally(() => setTicketsLoaded(true));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      await supportApi.create(subject.trim(), message.trim());
      setSent(true);
      setSubject('');
      setMessage('');
      const refreshed = await supportApi.getMy();
      setTickets(refreshed);
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки');
    }
    setSending(false);
  };

  return (
    <div className="pt-14 sm:pt-20 lg:pt-24">
      <div className="section-dark py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-1">Техническая поддержка</h1>
          <p className="text-white/40 text-sm sm:text-base">Ответим на вопросы и поможем решить проблему</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* FAQ */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Частые вопросы</h2>
              <div className="space-y-2">
                {FAQ.map((item, i) => (
                  <div key={i} className="bg-[#232a3b] rounded-xl border border-[#2e3548] overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-4 text-left hover:bg-[#2a3244] transition-colors"
                    >
                      <span className="text-sm sm:text-base font-medium text-white">{item.q}</span>
                      <ChevronDown size={16} className={`text-white/40 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    {openFaq === i && (
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                        <p className="text-sm text-white/50 leading-relaxed">{item.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact form */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Написать в поддержку</h2>
              {!authReady ? (
                <div className="flex justify-center py-8">
                  <div className="w-7 h-7 border-2 border-white/20 border-t-[#f97316] rounded-full animate-spin" />
                </div>
              ) : !user ? (
                <div className="bg-[#232a3b] rounded-xl border border-[#2e3548] p-6 sm:p-8 text-center">
                  <p className="text-white/40 text-sm mb-4">Войдите, чтобы обратиться в поддержку</p>
                  <Link to="/login" className="btn-primary inline-flex px-5 py-2.5 rounded-xl text-sm font-semibold">Войти</Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-[#232a3b] rounded-xl border border-[#2e3548] p-4 sm:p-6 space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1">Тема *</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      required
                      maxLength={200}
                      placeholder="Кратко опишите вопрос"
                      className="w-full px-3 py-2.5 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1">Сообщение *</label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      required
                      minLength={10}
                      maxLength={4000}
                      rows={5}
                      placeholder="Опишите проблему подробнее..."
                      className="w-full px-3 py-2.5 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316] resize-y"
                    />
                    <p className="text-[11px] text-white/30 mt-1">{message.length}/4000</p>
                  </div>
                  {error && <p className="text-xs sm:text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
                  {sent && (
                    <p className="text-xs sm:text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
                      <CheckCircle size={14} /> Обращение отправлено, мы ответим в ближайшее время
                    </p>
                  )}
                  <div className="flex justify-end">
                    <button type="submit" disabled={sending || !subject.trim() || message.trim().length < 10}
                      className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50">
                      {sending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={15} />}
                      Отправить
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* My tickets */}
            {user && ticketsLoaded && tickets.length > 0 && (
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Мои обращения</h2>
                <div className="space-y-3">
                  {tickets.map(t => {
                    const st = STATUS_MAP[t.status];
                    return (
                      <div key={t.id} className="bg-[#232a3b] rounded-xl border border-[#2e3548] p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{t.subject}</p>
                            <p className="text-[11px] text-white/30 mt-0.5">
                              {new Date(t.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${st.color}`}>
                            {st.icon} {st.label}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 mb-3">{t.message}</p>
                        {t.adminReply && (
                          <div className="bg-[#2a3244] rounded-lg p-3 border-l-2 border-[#f97316]">
                            <p className="text-[10px] font-semibold text-[#f97316] uppercase mb-1">Ответ поддержки</p>
                            <p className="text-xs text-white/60">{t.adminReply}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-[#232a3b] rounded-xl border border-[#2e3548] p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Другие способы связи</h3>
              <div className="space-y-3">
                <a href="https://t.me/projectmarket" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#2a3244] hover:bg-[#374155] transition-colors group">
                  <MessageCircle size={18} className="text-[#f97316]" />
                  <div>
                    <p className="text-sm text-white font-medium">Telegram</p>
                    <p className="text-xs text-white/40 group-hover:text-[#f97316] transition-colors">@projectmarket</p>
                  </div>
                </a>
                <a href="tel:+79001234567"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#2a3244] hover:bg-[#374155] transition-colors group">
                  <Phone size={18} className="text-[#f97316]" />
                  <div>
                    <p className="text-sm text-white font-medium">Телефон</p>
                    <p className="text-xs text-white/40 group-hover:text-[#f97316] transition-colors">+7 (900) 123-45-67</p>
                  </div>
                </a>
                <a href="mailto:info@projectmarket.ru"
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#2a3244] hover:bg-[#374155] transition-colors group">
                  <Mail size={18} className="text-[#f97316]" />
                  <div>
                    <p className="text-sm text-white font-medium">Email</p>
                    <p className="text-xs text-white/40 group-hover:text-[#f97316] transition-colors">info@projectmarket.ru</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-[#232a3b] rounded-xl border border-[#2e3548] p-5">
              <h3 className="text-sm font-semibold text-white mb-2">Время ответа</h3>
              <p className="text-xs text-white/40 leading-relaxed">
                Обычно отвечаем в течение <span className="text-[#f97316] font-medium">1–2 часов</span> в рабочее время
                (10:00–20:00 МСК). Срочные вопросы — через Telegram.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
