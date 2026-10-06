import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, ArrowLeft, Upload, FileArchive, Package, LifeBuoy, Send, CheckCircle, Clock, XCircle, ImagePlus, Lock } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { projectsApi } from '../api/projects';
import { categoriesApi } from '../api/categories';
import { ordersApi } from '../api/orders';
import { supportApi } from '../api/support';
import { uploadApi, type ProjectFileResponse } from '../api/upload';
import type { ApiProject, ApiCategory, ApiOrder, ApiSupportTicket } from '../api/types';
import Pagination from '../components/Pagination';
import { formatFileSize } from '../utils/preview';

const PAGE_SIZE = 10;

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const ticketStatusInfo = (status: string) =>
  status === 'Open'
    ? { label: 'Открыто', color: 'text-amber-400 bg-amber-500/10', icon: <Clock size={12} /> }
    : status === 'Answered'
    ? { label: 'Отвечено', color: 'text-green-400 bg-green-500/10', icon: <CheckCircle size={12} /> }
    : { label: 'Закрыто', color: 'text-white/40 bg-white/5', icon: <XCircle size={12} /> };

type View = 'list' | 'create' | 'edit';
type Tab = 'projects' | 'orders' | 'support';

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Ожидает оплаты',
  Delivered: 'Выдан',
  Cancelled: 'Отменён',
};

const STATUS_COLORS: Record<string, string> = {
  Pending: 'text-amber-400 bg-amber-500/10',
  Delivered: 'text-green-400 bg-green-500/10',
  Cancelled: 'text-red-400 bg-red-500/10',
};

export default function Admin() {
  const { projects, projectsLoaded, user, authReady } = useApp();
  const navigate = useNavigate();
  const [view, setView] = useState<View>('list');
  const [tab, setTab] = useState<Tab>('projects');
  const [filterCategory, setFilterCategory] = useState('Все');
  const [projectList, setProjectList] = useState<ApiProject[]>([]);
  const [editingProject, setEditingProject] = useState<ApiProject | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [projectsPage, setProjectsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [tickets, setTickets] = useState<ApiSupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [activeTicket, setActiveTicket] = useState<ApiSupportTicket | null>(null);
  const [chatText, setChatText] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProjectList(projects);
  }, [projects]);

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === 'orders') {
      setOrdersLoading(true);
      ordersApi.getAll().then(setOrders).catch(() => {}).finally(() => setOrdersLoading(false));
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'support') {
      setTicketsLoading(true);
      supportApi.getAll().then(setTickets).catch(() => {}).finally(() => setTicketsLoading(false));
    } else {
      setActiveTicket(null);
      setChatText('');
      setChatError('');
    }
  }, [tab]);

  // автообновление открытого чата
  useEffect(() => {
    if (tab !== 'support' || !activeTicket) return;
    const ticketId = activeTicket.id;
    const timer = setInterval(async () => {
      try {
        let detail = await supportApi.getById(ticketId);
        if (detail.unreadCount > 0) detail = await supportApi.markRead(ticketId);
        setActiveTicket(prev => (prev && prev.id === ticketId ? detail : prev));
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...detail, messages: undefined } : t));
      } catch {}
    }, 15000);
    return () => clearInterval(timer);
  }, [tab, activeTicket?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTicket?.messages?.length]);

  useEffect(() => {
    if (!authReady) return;
    if (!user) navigate('/login', { replace: true });
    else if (user.role !== 'admin') navigate('/', { replace: true });
  }, [authReady, user, navigate]);

  useEffect(() => { setProjectsPage(1); }, [filterCategory]);
  useEffect(() => { setOrdersPage(1); }, [tab]);

  const allCategories = useMemo(() => {
    const fromProjects = projectList.map(p => p.categoryName).filter(Boolean);
    const fromDb = categories.map(c => c.name);
    const merged = [...new Set([...fromProjects, ...fromDb])];
    return ['Все', ...merged];
  }, [projectList, categories]);

  if (!authReady) {
    return (
      <div className="pt-14 sm:pt-20 lg:pt-24 flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/20 border-t-[#f97316] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  const filtered = (filterCategory === 'Все' ? projectList : projectList.filter(p => p.categoryName === filterCategory))
    .sort((a, b) => b.id - a.id);

  const projectsTotalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safeProjectsPage = Math.min(projectsPage, projectsTotalPages);
  const visibleProjects = filtered.slice((safeProjectsPage - 1) * PAGE_SIZE, safeProjectsPage * PAGE_SIZE);

  const sortedOrders = [...orders].sort((a, b) => b.id - a.id);
  const ordersTotalPages = Math.max(1, Math.ceil(sortedOrders.length / PAGE_SIZE));
  const safeOrdersPage = Math.min(ordersPage, ordersTotalPages);
  const visibleOrders = sortedOrders.slice((safeOrdersPage - 1) * PAGE_SIZE, safeOrdersPage * PAGE_SIZE);

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить проект?')) return;
    try {
      await projectsApi.delete(id);
      setProjectList(prev => prev.filter(p => p.id !== id));
    } catch {}
  };

  const handleEdit = (project: ApiProject) => {
    setEditingProject(project);
    setView('edit');
  };

  const handleCreated = (project: ApiProject) => {
    setProjectList(prev => [project, ...prev]);
    setView('list');
  };

  const handleUpdated = (project: ApiProject) => {
    setProjectList(prev => prev.map(p => p.id === project.id ? project : p));
    setView('list');
    setEditingProject(null);
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch {}
  };

  const updateTicket = (detail: ApiSupportTicket) => {
    setTickets(prev => prev.map(t => t.id === detail.id ? { ...detail, messages: undefined } : t));
  };

  const openChat = async (ticketId: number) => {
    try {
      let detail = await supportApi.getById(ticketId);
      if (detail.unreadCount > 0) detail = await supportApi.markRead(ticketId);
      setActiveTicket(detail);
      updateTicket(detail);
      setChatText('');
      setChatError('');
    } catch {}
  };

  const sendChatMessage = async () => {
    if (!activeTicket || !chatText.trim() || activeTicket.status === 'Closed' || chatSending) return;
    setChatSending(true);
    setChatError('');
    try {
      const detail = await supportApi.sendMessage(activeTicket.id, chatText.trim());
      setActiveTicket(detail);
      updateTicket(detail);
      setChatText('');
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Ошибка отправки');
    }
    setChatSending(false);
  };

  const handleCloseTicket = async (ticketId: number) => {
    try {
      const updated = await supportApi.close(ticketId);
      updateTicket(updated);
      setActiveTicket(prev => (prev && prev.id === ticketId ? updated : prev));
    } catch {}
  };

  if (view === 'create') {
    return <ProjectForm onBack={() => setView('list')} onCreated={handleCreated} categories={categories} />;
  }

  if (view === 'edit' && editingProject) {
    return <ProjectForm onBack={() => { setView('list'); setEditingProject(null); }} onCreated={handleUpdated} categories={categories} project={editingProject} />;
  }

  return (
    <div className="pt-14 sm:pt-20 lg:pt-24">
      <div className="section-dark py-6 sm:py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">Панель управления</h1>
            {tab === 'projects' && (
              <button onClick={() => setView('create')} className="btn-primary flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg flex-shrink-0">
                <Plus size={15} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Создать проект</span><span className="sm:hidden">Создать</span>
              </button>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setTab('projects')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'projects' ? 'bg-[#f97316] text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
              Проекты
            </button>
            <button onClick={() => setTab('orders')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${tab === 'orders' ? 'bg-[#f97316] text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
              <Package size={15} /> Заказы
            </button>
            <button onClick={() => setTab('support')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${tab === 'support' ? 'bg-[#f97316] text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>
              <LifeBuoy size={15} /> Поддержка
              {tickets.filter(t => t.status === 'Open').length > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {tickets.filter(t => t.status === 'Open').length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        {tab === 'projects' && (
          <>
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 mb-5 sm:mb-6 scrollbar-hide">
          <button onClick={() => setFilterCategory('Все')}
            className={`shrink-0 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${filterCategory === 'Все' ? 'bg-[#f97316] text-white' : 'bg-[#232a3b] border border-[#2e3548] text-white/60 hover:border-[#f97316]/30'}`}>Все</button>
          {allCategories.filter(c => c !== 'Все').map(cat => (
            <button key={cat} onClick={() => setFilterCategory(cat)}
              className={`shrink-0 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${filterCategory === cat ? 'bg-[#f97316] text-white' : 'bg-[#232a3b] border border-[#2e3548] text-white/60 hover:border-[#f97316]/30'}`}>{cat}</button>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block bg-[#232a3b] rounded-xl border border-[#2e3548] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#2a3244] border-b border-[#2e3548]">
              <tr>
                <th className="text-left px-5 lg:px-6 py-3 text-xs font-semibold text-white/40 uppercase">ID</th>
                <th className="text-left px-5 lg:px-6 py-3 text-xs font-semibold text-white/40 uppercase">Название</th>
                <th className="text-left px-5 lg:px-6 py-3 text-xs font-semibold text-white/40 uppercase hidden md:table-cell">Категория</th>
                <th className="text-left px-5 lg:px-6 py-3 text-xs font-semibold text-white/40 uppercase">Цена</th>
                <th className="text-right px-5 lg:px-6 py-3 text-xs font-semibold text-white/40 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e3548]">
              {visibleProjects.map(p => (
                <tr key={p.id} className="hover:bg-[#2a3244] transition-colors">
                  <td className="px-5 lg:px-6 py-3.5 text-sm text-white/40">#{p.id}</td>
                  <td className="px-5 lg:px-6 py-3.5">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <img src={p.images?.[0] || ''} alt="" className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{p.title}</p>
                        <div className="flex gap-1 mt-0.5">
                          {p.isNew && <span className="text-[10px] bg-[#f97316]/10 text-[#f97316] px-1.5 py-0.5 rounded font-medium">Новый</span>}
                          {p.popular && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-medium">Популярный</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 lg:px-6 py-3.5 text-sm text-white/50 hidden md:table-cell">{p.categoryName}</td>
                  <td className="px-5 lg:px-6 py-3.5 text-sm font-semibold text-white">{p.price.toLocaleString('ru-RU')} &#8381;</td>
                  <td className="px-5 lg:px-6 py-3.5">
                    <div className="flex justify-end gap-1.5 sm:gap-2">
                      <button onClick={() => handleEdit(p)} className="p-1.5 sm:p-2 rounded-lg text-white/40 hover:text-[#f97316] hover:bg-[#f97316]/10 transition-colors"><Pencil size={14} className="sm:w-[15px] sm:h-[15px]" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 sm:p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} className="sm:w-[15px] sm:h-[15px]" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden space-y-2.5">
          {visibleProjects.map(p => (
            <div key={p.id} className="bg-[#232a3b] rounded-xl border border-[#2e3548] p-3.5 flex items-center gap-3">
              <img src={p.images?.[0] || ''} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{p.title}</p>
                <div className="flex gap-1 mt-0.5 flex-wrap">
                  <span className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded">{p.categoryName}</span>
                  {p.isNew && <span className="text-[10px] bg-[#f97316]/10 text-[#f97316] px-1.5 py-0.5 rounded font-medium">Новый</span>}
                  {p.popular && <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-medium">Популярный</span>}
                </div>
                <p className="font-semibold text-white text-sm mt-1">{p.price.toLocaleString('ru-RU')} &#8381;</p>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg text-white/40 hover:text-[#f97316] hover:bg-[#f97316]/10 transition-colors"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
        <Pagination page={safeProjectsPage} totalPages={projectsTotalPages} onPageChange={setProjectsPage} />
          </>
        )}

        {tab === 'orders' && (
          <>
            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-white/20 border-t-[#f97316] rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-white/10 mb-4" />
                <p className="text-white/40 text-sm">Заказов пока нет</p>
              </div>
            ) : (
              <>
                <div className="hidden sm:block bg-[#232a3b] rounded-xl border border-[#2e3548] overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#2a3244] border-b border-[#2e3548]">
                      <tr>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase">ID</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase">Номер</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase hidden lg:table-cell">Покупатель</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase hidden md:table-cell">Товары</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase">Сумма</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase">Статус</th>
                        <th className="text-right px-5 py-3 text-xs font-semibold text-white/40 uppercase">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2e3548]">
                      {visibleOrders.map(o => (
                        <tr key={o.id} className="hover:bg-[#2a3244] transition-colors">
                          <td className="px-5 py-3.5 text-sm text-white/40">#{o.id}</td>
                          <td className="px-5 py-3.5 text-sm text-white/60 font-mono">{o.orderNumber}</td>
                          <td className="px-5 py-3.5 hidden lg:table-cell">
                            <div className="min-w-0">
                              <p className="text-sm text-white truncate">{o.userName || '—'}</p>
                              <p className="text-xs text-white/40 truncate">{o.userEmail}</p>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-white/50 hidden md:table-cell max-w-[180px] truncate">{o.items.map(i => i.title).join(', ')}</td>
                          <td className="px-5 py-3.5 text-sm font-semibold text-white">{o.totalAmount.toLocaleString('ru-RU')} &#8381;</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${STATUS_COLORS[o.status] || 'text-white/40 bg-white/5'}`}>
                              {STATUS_LABELS[o.status] || o.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex justify-end gap-1">
                              {o.status === 'Pending' && (
                                <button onClick={() => handleStatusUpdate(o.id, 'Cancelled')} className="px-2.5 py-1 text-[10px] font-medium text-red-400 hover:bg-red-500/10 rounded-lg border border-red-500/20 transition-colors">Отменить</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="sm:hidden space-y-2.5">
                  {visibleOrders.map(o => (
                    <div key={o.id} className="bg-[#232a3b] rounded-xl border border-[#2e3548] p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-white/40 font-mono">{o.orderNumber}</span>
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${STATUS_COLORS[o.status] || 'text-white/40 bg-white/5'}`}>
                          {STATUS_LABELS[o.status] || o.status}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-white">{o.userName || '—'}</p>
                      <p className="text-[10px] text-white/40 mb-1">{o.userEmail}</p>
                      <p className="text-xs text-white/50 mb-1">{o.items.map(i => i.title).join(', ')}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-semibold text-white">{o.totalAmount.toLocaleString('ru-RU')} &#8381;</span>
                        <div className="flex gap-1">
                          {o.status === 'Pending' && (
                            <button onClick={() => handleStatusUpdate(o.id, 'Cancelled')} className="px-2.5 py-1 text-[10px] font-medium text-red-400 hover:bg-red-500/10 rounded-lg border border-red-500/20 transition-colors">Отменить</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Pagination page={safeOrdersPage} totalPages={ordersTotalPages} onPageChange={setOrdersPage} />
              </>
            )}
          </>
        )}

        {tab === 'support' && ticketsLoading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-white/20 border-t-[#f97316] rounded-full animate-spin" />
          </div>
        )}

        {tab === 'support' && !ticketsLoading && activeTicket && (
          <div className="bg-[#232a3b] rounded-xl border border-[#2e3548] overflow-hidden max-w-3xl">
            {/* Chat header */}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-[#2e3548] bg-[#2a3244]">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => { setActiveTicket(null); setChatText(''); setChatError(''); }}
                  className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors shrink-0"
                  aria-label="К списку"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">{activeTicket.subject}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${ticketStatusInfo(activeTicket.status).color}`}>
                      {ticketStatusInfo(activeTicket.status).icon} {ticketStatusInfo(activeTicket.status).label}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/30 truncate">
                    {activeTicket.userName} · {activeTicket.userEmail} · обращение №{activeTicket.id}
                  </p>
                </div>
              </div>
              {activeTicket.status !== 'Closed' && (
                <button
                  onClick={() => handleCloseTicket(activeTicket.id)}
                  className="px-3 py-1.5 text-xs font-medium text-white/50 hover:bg-white/5 rounded-lg border border-[#2e3548] transition-colors shrink-0"
                >
                  Закрыть
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="px-3 sm:px-4 py-4 space-y-3 h-[420px] overflow-y-auto">
              {activeTicket.messages?.map(m => {
                const mine = m.senderRole === 'Admin';
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] sm:max-w-[75%] rounded-xl px-3.5 py-2.5 border ${
                      mine
                        ? 'bg-[#f97316]/12 border-[#f97316]/30'
                        : 'bg-[#2a3244] border-[#2e3548]'
                    }`}>
                      {!mine && (
                        <p className="text-[10px] font-semibold text-white/60 uppercase mb-1">{m.senderName || 'Пользователь'}</p>
                      )}
                      <p className="text-sm text-white/85 whitespace-pre-wrap break-words leading-relaxed">{m.body}</p>
                      <p className="text-[10px] text-white/30 mt-1 text-right">{fmtTime(m.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Composer */}
            <div className="border-t border-[#2e3548] p-3 sm:p-4">
              {activeTicket.status === 'Closed' ? (
                <p className="text-xs text-white/40 flex items-center gap-2 py-1">
                  <Lock size={13} /> Обращение закрыто
                </p>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <textarea
                      value={chatText}
                      onChange={e => setChatText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendChatMessage();
                        }
                      }}
                      placeholder="Введите ответ... (Enter — отправить, Shift+Enter — новая строка)"
                      rows={2}
                      maxLength={4000}
                      className="flex-1 px-3 py-2.5 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316] resize-y"
                    />
                    <button
                      onClick={sendChatMessage}
                      disabled={chatSending || !chatText.trim()}
                      className="btn-primary px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 justify-center disabled:opacity-50 sm:self-start"
                    >
                      {chatSending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={13} />}
                      Отправить
                    </button>
                  </div>
                  {chatError && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mt-2">{chatError}</p>}
                </>
              )}
            </div>
          </div>
        )}

        {tab === 'support' && !ticketsLoading && !activeTicket && (
          tickets.length === 0 ? (
            <div className="text-center py-12">
              <LifeBuoy size={48} className="mx-auto text-white/10 mb-4" />
              <p className="text-white/40 text-sm">Обращений пока нет</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map(t => {
                const statusInfo = ticketStatusInfo(t.status);
                return (
                  <button
                    key={t.id}
                    onClick={() => openChat(t.id)}
                    className="w-full text-left bg-[#232a3b] rounded-xl border border-[#2e3548] p-4 sm:p-5 hover:border-[#f97316]/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-white truncate">{t.subject}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${statusInfo.color}`}>
                            {statusInfo.icon} {statusInfo.label}
                          </span>
                          {t.unreadCount > 0 && (
                            <span className="min-w-[18px] h-[18px] px-1 bg-[#f97316] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                              {t.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/40 mt-1">
                          {t.userName} · {t.userEmail} · {fmtTime(t.lastMessageAt || t.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-white/50 mb-2 leading-relaxed truncate">{t.message}</p>
                    <p className="text-[11px] text-[#f97316]">Открыть чат →</p>
                  </button>
                );
              })}
            </div>
          )
        )}
      </div>
    </div>
  );
}

interface ProjectFormProps {
  onBack: () => void;
  onCreated: (project: ApiProject) => void;
  categories: ApiCategory[];
  project?: ApiProject;
}

function ProjectForm({ onBack, onCreated, categories, project }: ProjectFormProps) {
  const [title, setTitle] = useState(project?.title || '');
  const [description, setDescription] = useState(project?.description || '');
  const [fullDescription, setFullDescription] = useState(project?.fullDescription || '');
  // строка, чтобы Backspace очищал «0» и не было ведущих нулей
  const [price, setPrice] = useState(project?.price ? String(project.price) : '');
  const [categoryName, setCategoryName] = useState(project?.categoryId ? categories.find(c => c.id === project.categoryId)?.name || '' : '');
  const [technologies, setTechnologies] = useState<string[]>(project?.technologies || []);
  const [techInput, setTechInput] = useState('');
  const [demo, setDemo] = useState(project?.demo || '');
  const [images, setImages] = useState<string[]>(project?.images || []);
  const [imageInput, setImageInput] = useState('');
  const [isNew, setIsNew] = useState(project?.isNew || false);
  const [popular, setPopular] = useState(project?.popular || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [catSuggestions, setCatSuggestions] = useState<string[]>([]);
  const catRef = useRef<HTMLDivElement>(null);
  const [projectFiles, setProjectFiles] = useState<ProjectFileResponse[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>(project?.previewImages || []);
  const [pendingPreviewImages, setPendingPreviewImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (project?.id) {
      uploadApi.getProjectFiles(project.id).then(setProjectFiles).catch(() => {});
    }
  }, [project?.id]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatSuggestions([]);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const item of Array.from(items)) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        setPendingPreviewImages(prev => [...prev, ...files]);
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, []);

  const addTechnology = () => { if (techInput.trim() && !technologies.includes(techInput.trim())) { setTechnologies([...technologies, techInput.trim()]); setTechInput(''); } };
  const removeTechnology = (tech: string) => setTechnologies(technologies.filter(t => t !== tech));
  const addImage = () => { if (imageInput.trim() && !images.includes(imageInput.trim())) { setImages([...images, imageInput.trim()]); setImageInput(''); } };
  const removeImage = (url: string) => setImages(images.filter(i => i !== url));

  const handleCategoryChange = (value: string) => {
    setCategoryName(value);
    if (value.trim()) {
      const existing = categories.map(c => c.name);
      setCatSuggestions(existing.filter(n => n.toLowerCase().includes(value.toLowerCase()) && n.toLowerCase() !== value.toLowerCase()).slice(0, 5));
    } else {
      setCatSuggestions([]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    if (project?.id) {
      setUploadingFile(true);
      try {
        const results = await uploadApi.uploadProjectFiles(fileArray, project.id, 'source_code');
        setProjectFiles(prev => [...prev, ...results]);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки файла');
      }
      setUploadingFile(false);
    } else {
      setPendingFiles(prev => [...prev, ...fileArray]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePreviewUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const images = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (images.length > 0) setPendingPreviewImages(prev => [...prev, ...images]);
    if (previewInputRef.current) previewInputRef.current.value = '';
  };

  const removePreviewImage = (url: string) => setPreviewImages(prev => prev.filter(u => u !== url));
  const removePendingPreview = (index: number) => setPendingPreviewImages(prev => prev.filter((_, i) => i !== index));

  const handleDeleteFile = async (fileId: number) => {
    try {
      await uploadApi.deleteFile(fileId);
      setProjectFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления файла');
    }
  };

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let resolvedCategoryId: number | null = null;
      if (categoryName.trim()) {
        const existing = categories.find(c => c.name.toLowerCase() === categoryName.trim().toLowerCase());
        if (existing) {
          resolvedCategoryId = existing.id;
        } else {
          const newCat = await categoriesApi.create({ name: categoryName.trim(), description: '' });
          resolvedCategoryId = newCat.id;
        }
      }

      const data = {
        title, description, fullDescription, price: Number(price || 0),
        categoryId: resolvedCategoryId, images, technologies, demo, isNew, popular,
      };
      if (project) {
        const uploaded = await uploadApi.uploadImages(pendingPreviewImages, project.id);
        const updated = await projectsApi.update(project.id, { ...data, previewImages: [...previewImages, ...uploaded] });
        onCreated(updated);
      } else {
        const created = await projectsApi.create({ ...data, previewImages: [] });
        if (created.id) {
          if (pendingFiles.length > 0) {
            await uploadApi.uploadProjectFiles(pendingFiles, created.id, 'source_code');
          }
          const uploaded = await uploadApi.uploadImages(pendingPreviewImages, created.id);
          if (uploaded.length > 0) {
            const refreshed = await projectsApi.update(created.id, { previewImages: uploaded });
            onCreated(refreshed);
            setLoading(false);
            return;
          }
        }
        onCreated(created);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    }
    setLoading(false);
  };

  return (
    <div className="pt-14 sm:pt-20 lg:pt-24">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
        <button onClick={onBack} className="flex items-center gap-1.5 sm:gap-2 text-white/40 hover:text-[#f97316] mb-5 sm:mb-6 text-xs sm:text-sm font-medium transition-colors">
          <ArrowLeft size={15} className="sm:w-4 sm:h-4" /> Назад к списку
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">{project ? 'Редактировать проект' : 'Новый проект'}</h1>
        <form onSubmit={handleSubmit} className="bg-[#232a3b] rounded-xl border border-[#2e3548] p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1">Название *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
              className="w-full px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]" />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1">Краткое описание *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={2}
              className="w-full px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]" />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1">Полное описание</label>
            <textarea value={fullDescription} onChange={e => setFullDescription(e.target.value)} rows={4}
              className="w-full px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1">Цена (&#8381;) *</label>
              <input type="number" value={price} required min={0}
                onChange={e => setPrice(e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, ''))}
                className="w-full px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]" />
            </div>
            <div className="relative" ref={catRef}>
              <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1">Категория</label>
              <input type="text" value={categoryName} onChange={e => handleCategoryChange(e.target.value)}
                placeholder="Например: E-commerce, CRM..."
                className="w-full px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]" />
              {catSuggestions.length > 0 && (
                <div className="absolute z-30 top-full mt-1 w-full bg-[#2a3244] border border-[#2e3548] rounded-lg shadow-xl max-h-40 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#2e3548] bg-[#232a3b]">
                    <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wide">Подсказки</span>
                    <button type="button" onClick={() => setCatSuggestions([])} title="Скрыть подсказки"
                      className="p-0.5 text-white/40 hover:text-[#f97316] hover:bg-[#f97316]/10 rounded transition-colors">
                      <X size={13} />
                    </button>
                  </div>
                  <div className="overflow-y-auto">
                    {catSuggestions.map(s => (
                      <button key={s} type="button" onClick={() => { setCategoryName(s); setCatSuggestions([]); }}
                        className="w-full text-left px-3 py-2 text-sm text-white/70 hover:bg-[#374155] hover:text-white transition-colors">{s}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1">Технологии</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={techInput} onChange={e => setTechInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTechnology())} placeholder="Добавить"
                className="flex-1 px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]" />
              <button type="button" onClick={addTechnology} className="px-3 py-2 bg-[#2a3244] border border-[#2e3548] text-white/60 rounded-lg text-sm font-medium hover:bg-[#374155] transition-colors">+</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {technologies.map(t => (
                <span key={t} className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#f97316]/10 text-[#f97316] text-[10px] sm:text-xs font-medium rounded-md">
                  {t}
                  <button type="button" onClick={() => removeTechnology(t)} className="hover:text-[#ea580c]"><X size={11} className="sm:w-3 sm:h-3" /></button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1">Ссылки на изображения</label>
            <div className="flex gap-2 mb-2">
              <input type="url" value={imageInput} onChange={e => setImageInput(e.target.value)} placeholder="URL изображения"
                className="flex-1 px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]" />
              <button type="button" onClick={addImage} className="px-3 py-2 bg-[#2a3244] border border-[#2e3548] text-white/60 rounded-lg text-sm font-medium hover:bg-[#374155] transition-colors">+</button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {images.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt="" className="w-full h-16 sm:h-24 object-cover rounded-lg" />
                  <button type="button" onClick={() => removeImage(url)} className="absolute top-0.5 right-0.5 p-0.5 sm:p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} className="sm:w-3 sm:h-3" /></button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1">Демо-ссылка</label>
            <input type="url" value={demo} onChange={e => setDemo(e.target.value)} placeholder="https://..."
              className="w-full px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#f97316]/30 focus:border-[#f97316]" />
          </div>
          <div className="flex gap-4 sm:gap-6">
            <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
              <input type="checkbox" checked={isNew} onChange={e => setIsNew(e.target.checked)} className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-[#2e3548] text-[#f97316] focus:ring-[#f97316] bg-[#2a3244]" />
              <span className="text-xs sm:text-sm text-white/60">Новый</span>
            </label>
            <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
              <input type="checkbox" checked={popular} onChange={e => setPopular(e.target.checked)} className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-[#2e3548] text-[#f97316] focus:ring-[#f97316] bg-[#2a3244]" />
              <span className="text-xs sm:text-sm text-white/60">Популярный</span>
            </label>
          </div>
          {error && <p className="text-xs sm:text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

          <div>
            <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1">Файлы проекта (исходный код)</label>
            <p className="text-[10px] sm:text-xs text-white/30 mb-2">Загрузите архив или файлы проекта. Хранятся в закрытом доступе — пользователь скачает после оплаты.</p>
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingFile}
                className="flex items-center gap-2 px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white/60 hover:border-[#f97316]/30 hover:text-[#f97316] transition-colors disabled:opacity-50">
                {uploadingFile ? <span className="w-4 h-4 border-2 border-white/30 border-t-[#f97316] rounded-full animate-spin" /> : <Upload size={15} />}
                {uploadingFile ? 'Загрузка...' : 'Выберите файлы'}
              </button>
            </div>
            {pendingFiles.length > 0 && !project?.id && (
              <div className="mt-2 space-y-1">
                {pendingFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-[#2a3244] text-white/50">
                    <FileArchive size={13} className="text-[#f97316]" />
                    <span className="truncate">{f.name}</span>
                    <span className="ml-auto text-white/30">{formatFileSize(f.size)}</span>
                    <button type="button" onClick={() => removePendingFile(i)} className="text-red-400 hover:text-red-300"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
            {projectFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                {projectFiles.map(f => (
                  <div key={f.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-[#2a3244] text-white/50">
                    <FileArchive size={13} className="text-[#f97316]" />
                    <span className="truncate">{f.originalFileName}</span>
                    <span className="ml-auto text-white/30">{formatFileSize(f.fileSize)}</span>
                    <button type="button" onClick={() => handleDeleteFile(f.id)} className="text-red-400 hover:text-red-300 ml-1"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-white/60 mb-1">Превью (скриншоты)</label>
            <p className="text-[10px] sm:text-xs text-white/30 mb-2">Скриншоты бесплатного фрагмента (страница Word, PDF, код...). Публикуются на странице проекта без ограничений. Можно сделать скриншот и вставить его клавишами Ctrl+V.</p>
            <div className="flex items-center gap-2">
              <input ref={previewInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handlePreviewUpload} />
              <button type="button" onClick={() => previewInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 bg-[#2a3244] border border-[#2e3548] rounded-lg text-sm text-white/60 hover:border-[#f97316]/30 hover:text-[#f97316] transition-colors disabled:opacity-50">
                <ImagePlus size={15} />
                Добавить скриншоты
              </button>
            </div>
            {(previewImages.length > 0 || pendingPreviewImages.length > 0) && (
              <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
                {previewImages.map((url, i) => (
                  <div key={`saved-${i}`} className="relative group">
                    <img src={url} alt="" className="w-full h-16 sm:h-24 object-cover rounded-lg border border-[#2e3548]" />
                    <button type="button" onClick={() => removePreviewImage(url)} title="Удалить"
                      className="absolute top-0.5 right-0.5 p-0.5 sm:p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} className="sm:w-3 sm:h-3" /></button>
                  </div>
                ))}
                {pendingPreviewImages.map((f, i) => (
                  <div key={`pending-${i}`} className="relative group">
                    <img src={URL.createObjectURL(f)} alt="" className="w-full h-16 sm:h-24 object-cover rounded-lg border border-dashed border-[#f97316]/50" />
                    <span className="absolute bottom-0.5 left-0.5 text-[9px] bg-black/70 text-[#f97316] px-1 rounded">новый</span>
                    <button type="button" onClick={() => removePendingPreview(i)} title="Убрать"
                      className="absolute top-0.5 right-0.5 p-0.5 sm:p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} className="sm:w-3 sm:h-3" /></button>
                  </div>
                ))}
              </div>
            )}
            {previewImages.length === 0 && pendingPreviewImages.length === 0 && (
              <p className="mt-2 text-[10px] text-white/30">Скриншоты не добавлены — на странице проекта будет блок «Файл доступен после покупки».</p>
            )}
          </div>

          <div className="flex justify-end gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-[#2e3548]">
            <button type="button" onClick={onBack} className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white/50 hover:bg-white/5 rounded-lg transition-colors">Отмена</button>
            <button type="submit" disabled={loading} className="btn-primary px-5 sm:px-6 py-2 text-xs sm:text-sm rounded-lg flex items-center gap-2">
              {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {project ? 'Сохранить' : 'Создать проект'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
