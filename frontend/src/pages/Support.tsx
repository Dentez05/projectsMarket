import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Send, ChevronDown, MessageCircle, Phone, Mail, CheckCircle, Clock, XCircle, ArrowLeft, Lock } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { supportApi } from '../api/support';
import { startSupportHub, getSupportHub } from '../api/supportHub';
import type { ApiSupportTicket } from '../api/types';
import { useSeo } from '../utils/seo';

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

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function Support() {
  useSeo({ title: 'Поддержка', noindex: true });
  const { user, authReady } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [tickets, setTickets] = useState<ApiSupportTicket[]>([]);
  const [ticketsLoaded, setTicketsLoaded] = useState(false);
  const [activeTicket, setActiveTicket] = useState<ApiSupportTicket | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const updateList = (detail: ApiSupportTicket) => {
    setTickets(prev => prev.some(t => t.id === detail.id)
      ? prev.map(t => t.id === detail.id ? { ...t, ...detail, messages: undefined } : t)
      : [{ ...detail, messages: undefined }, ...prev]);
  };

  const openTicket = async (id: number) => {
    try {
      let detail = await supportApi.getById(id);
      if (detail.unreadCount > 0) detail = await supportApi.markRead(id);
      setActiveTicket(detail);
      updateList(detail);
      setChatError('');
      setChatInput('');
    } catch {}
  };

  useEffect(() => {
    if (!user) return;
    supportApi.getMy()
      .then(setTickets)
      .catch(() => {})
      .finally(() => setTicketsLoaded(true));
  }, [user]);

  // ref для доступа к активному тикету из SignalR-хендлеров
  const activeTicketRef = useRef<ApiSupportTicket | null>(null);
  useEffect(() => { activeTicketRef.current = activeTicket; }, [activeTicket]);

  // SignalR: мгновенные обновления; поллинг — фолбэк, пока хаб не подключён
  const hubConnectedRef = useRef(false);
  useEffect(() => {
    if (!user) return;
    let disposed = false;

    const refreshActive = async (ticketId: number) => {
      try {
        let detail = await supportApi.getById(ticketId);
        if (detail.unreadCount > 0) detail = await supportApi.markRead(ticketId);
        if (disposed) return;
        setActiveTicket(prev => (prev && prev.id === ticketId ? detail : prev));
        updateList(detail);
      } catch {}
    };

    const onMessage = async (payload: { ticketId: number }) => {
      const activeId = activeTicketRef.current?.id;
      if (activeId && payload.ticketId === activeId) {
        await refreshActive(activeId);
      } else {
        supportApi.getMy().then(t => !disposed && setTickets(t)).catch(() => {});
      }
    };

    const onTicket = () => {
      supportApi.getMy().then(t => !disposed && setTickets(t)).catch(() => {});
    };

    (async () => {
      const ok = await startSupportHub();
      if (disposed) return;
      hubConnectedRef.current = ok;
      if (!ok) return;
      const conn = getSupportHub();
      conn.on('newMessage', onMessage);
      conn.on('ticketUpdated', onTicket);
      conn.on('ticketCreated', onTicket);
    })();

    return () => {
      disposed = true;
      const conn = getSupportHub();
      conn.off('newMessage', onMessage);
      conn.off('ticketUpdated', onTicket);
      conn.off('ticketCreated', onTicket);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // автообновление чата (фолбэк при недоступном SignalR)
  useEffect(() => {
    if (!activeTicket) return;
    const ticketId = activeTicket.id;
    const timer = setInterval(async () => {
      if (hubConnectedRef.current) return; // SignalR уже шлёт обновления
      try {
        let detail = await supportApi.getById(ticketId);
        if (detail.unreadCount > 0) detail = await supportApi.markRead(ticketId);
        setActiveTicket(prev => (prev && prev.id === ticketId ? detail : prev));
        updateList(detail);
      } catch {}
    }, 15000);
    return () => clearInterval(timer);
  }, [activeTicket?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTicket?.messages?.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const created = await supportApi.create(subject.trim(), message.trim());
      setSent(true);
      setSubject('');
      setMessage('');
      const refreshed = await supportApi.getMy();
      setTickets(refreshed);
      setActiveTicket(created);
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка отправки');
    }
    setSending(false);
  };

  const handleSend = async () => {
    if (!activeTicket || !chatInput.trim() || activeTicket.status === 'Closed' || chatSending) return;
    setChatSending(true);
    setChatError('');
    try {
      const detail = await supportApi.sendMessage(activeTicket.id, chatInput.trim());
      setActiveTicket(detail);
      updateList(detail);
      setChatInput('');
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Ошибка отправки');
    }
    setChatSending(false);
  };

  const status = activeTicket ? STATUS_MAP[activeTicket.status] : null;

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
                      <CheckCircle size={14} /> Обращение создано — чат открыт ниже
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

            {/* My tickets / chat */}
            {user && ticketsLoaded && (activeTicket || tickets.length > 0) && (
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Мои обращения</h2>

                {activeTicket && status ? (
                  <div className="bg-[#232a3b] rounded-xl border border-[#2e3548] overflow-hidden">
                    {/* Chat header */}
                    <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-[#2e3548] bg-[#2a3244]">
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => { setActiveTicket(null); setChatInput(''); setChatError(''); }}
                          className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors shrink-0"
                          aria-label="К списку"
                        >
                          <ArrowLeft size={16} />
                        </button>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{activeTicket.subject}</p>
                          <p className="text-[11px] text-white/30">
                            Обращение №{activeTicket.id} · {fmtTime(activeTicket.createdAt)}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                    </div>

                    {/* Messages */}
                    <div className="px-3 sm:px-4 py-4 space-y-3 h-[340px] sm:h-[400px] overflow-y-auto">
                      {activeTicket.messages?.map(m => {
                        const mine = m.senderRole === 'User';
                        return (
                          <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] sm:max-w-[75%] rounded-xl px-3.5 py-2.5 border ${
                              mine
                                ? 'bg-[#f97316]/12 border-[#f97316]/30'
                                : 'bg-[#2a3244] border-[#2e3548]'
                            }`}>
                              {!mine && (
                                <p className="text-[10px] font-semibold text-[#f97316] uppercase mb-1">{m.senderName || 'Поддержка'}</p>
                              )}
                              <p className="text-sm text-white/85 whitespace-pre-wrap break-words leading-relaxed">{m.body}</p>
                              <p className="text-[10px] text-white/30 mt-1 text-right">{fmtTime(m.createdAt)}</p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Composer */}
                    <div className="border-t border-[#2e3548] p-3 sm:p-4">
                      {activeTicket.status === 'Closed' ? (
                        <p className="text-xs text-white/40 flex items-center gap-2 py-1">
                          <Lock size={13} /> Обращение закрыто. Создайте новое, если нужна помощь.
                        </p>
                      ) : (
                        <>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <textarea
                              value={chatInput}
                              onChange={e => setChatInput(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSend();
                                }
                              }}
                              placeholder="Введите сообщение... (Enter — отправить, Shift+Enter — новая строка)"
                              rows={2}
                              maxLength={4000}
                              className="flex-1 px-3 py-2.5 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316] resize-y"
                            />
                            <button
                              onClick={handleSend}
                              disabled={chatSending || !chatInput.trim()}
                              className="btn-primary px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 justify-center disabled:opacity-50 sm:self-start"
                            >
                              {chatSending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
                              Отправить
                            </button>
                          </div>
                          {chatError && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mt-2">{chatError}</p>}
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tickets.map(t => {
                      const st = STATUS_MAP[t.status];
                      const preview = t.message;
                      return (
                        <button
                          key={t.id}
                          onClick={() => openTicket(t.id)}
                          className="w-full text-left bg-[#232a3b] rounded-xl border border-[#2e3548] p-4 sm:p-5 hover:border-[#f97316]/40 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-white truncate">{t.subject}</p>
                                {t.unreadCount > 0 && (
                                  <span className="shrink-0 min-w-[18px] h-[18px] px-1 bg-[#f97316] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                                    {t.unreadCount}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-white/30 mt-0.5">
                                {fmtTime(t.lastMessageAt || t.createdAt)}
                              </p>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${st.color}`}>
                              {st.icon} {st.label}
                            </span>
                          </div>
                          <p className="text-xs text-white/40 truncate">{preview}</p>
                          <p className="text-[11px] text-[#f97316] mt-2">Открыть чат →</p>
                        </button>
                      );
                    })}
                  </div>
                )}
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
