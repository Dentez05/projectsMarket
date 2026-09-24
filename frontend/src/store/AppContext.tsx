import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from 'react';
import type { ApiProject, ApiCartItem } from '../api/types';
import { authApi } from '../api/auth';
import { cartApi } from '../api/cart';
import { ordersApi } from '../api/orders';
import { projectsApi } from '../api/projects';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface CartItem {
  projectId: number;
  title: string;
  price: number;
  image: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  paymentId?: string;
  userName?: string;
  userEmail?: string;
  items: { projectId: number; title: string; price: number }[];
}

interface AppState {
  cart: CartItem[];
  user: User | null;
  orders: Order[];
  projects: ApiProject[];
  projectsLoaded: boolean;
  authReady: boolean;
  addToCart: (project: ApiProject) => Promise<boolean>;
  removeFromCart: (projectId: number) => Promise<void>;
  isInCart: (projectId: number) => boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkout: () => Promise<string | null>;
  refreshOrders: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p])), [projects]);
  const projectMapRef = useRef(projectMap);
  projectMapRef.current = projectMap;

  const enrichCartItem = useCallback((item: ApiCartItem): CartItem => {
    const project = projectMapRef.current.get(item.projectId);
    return {
      projectId: item.projectId,
      title: item.title,
      price: item.price,
      image: project?.images?.[0] || '',
    };
  }, []);

  useEffect(() => {
    projectsApi.getAll()
      .then(data => { setProjects(data); setProjectsLoaded(true); })
      .catch(() => setProjectsLoaded(true));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setAuthReady(true); return; }
    authApi.getProfile()
      .then(data => {
        setUser({
          id: data.id,
          name: data.fullName,
          email: data.email,
          role: data.role.toLowerCase() as 'user' | 'admin',
        });
      })
      .catch(() => { localStorage.removeItem('token'); })
      .finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    if (!user) { setCart([]); return; }
    cartApi.get()
      .then(data => setCart(data.items.map(enrichCartItem)))
      .catch(() => {});
  }, [user, enrichCartItem]);

  const refreshCart = useCallback(async () => {
    if (!user) return;
    try {
      const data = await cartApi.get();
      setCart(data.items.map(enrichCartItem));
    } catch {}
  }, [user, enrichCartItem]);

  const refreshOrders = useCallback(async () => {
    if (!user) return;
    try {
      const data = await ordersApi.getAll();
      setOrders(data.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        totalAmount: o.totalAmount,
        status: o.status,
        createdAt: o.createdAt,
        paymentId: o.paymentId ?? undefined,
        userName: o.userName,
        userEmail: o.userEmail,
        items: o.items,
      })));
    } catch {}
  }, [user]);

  useEffect(() => {
    if (user) refreshOrders();
  }, [user, refreshOrders]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await authApi.login({ email, password });
      localStorage.setItem('token', res.token);
      setUser({
        id: res.user.id,
        name: res.user.fullName,
        email: res.user.email,
        role: res.user.role.toLowerCase() as 'user' | 'admin',
      });
      return true;
    } catch {
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await authApi.register({ fullName: name, email, password });
      localStorage.setItem('token', res.token);
      setUser({
        id: res.user.id,
        name: res.user.fullName,
        email: res.user.email,
        role: res.user.role.toLowerCase() as 'user' | 'admin',
      });
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCart([]);
    setOrders([]);
  };

  const addToCart = async (project: ApiProject): Promise<boolean> => {
    if (!user) return false;
    if (cart.some(i => i.projectId === project.id)) return true;
    setCart(prev => [...prev, {
      projectId: project.id,
      title: project.title,
      price: project.price,
      image: project.images?.[0] || '',
    }]);
    try {
      await cartApi.add(project.id);
      return true;
    } catch {
      setCart(prev => prev.filter(i => i.projectId !== project.id));
      return false;
    }
  };

  const removeFromCart = async (projectId: number) => {
    setCart(prev => prev.filter(i => i.projectId !== projectId));
    try {
      await cartApi.remove(projectId);
    } catch {}
  };

  const isInCart = (projectId: number) => cart.some(i => i.projectId === projectId);

  const checkout = async (): Promise<string | null> => {
    try {
      const order = await ordersApi.create();
      setCart([]);
      await refreshOrders();
      return order.orderNumber;
    } catch {
      return null;
    }
  };

  return (
    <AppContext.Provider value={{
      cart, user, orders, projects, projectsLoaded, authReady,
      addToCart, removeFromCart, isInCart,
      login, register, logout, checkout,
      refreshOrders, refreshCart,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
