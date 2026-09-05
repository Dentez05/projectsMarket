import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Project } from '../data/projects';

interface CartItem {
  project: Project;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
}

interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'paid' | 'delivered';
  date: string;
}

interface AppState {
  cart: CartItem[];
  user: User | null;
  orders: Order[];
  addToCart: (project: Project) => void;
  removeFromCart: (projectId: number) => void;
  isInCart: (projectId: number) => boolean;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  checkout: () => void;
}

const AppContext = createContext<AppState | null>(null);

const DEMO_USERS = [
  { id: 1, name: 'Алексей Петров', email: 'user@demo.com', password: 'demo123', role: 'user' as const },
  { id: 2, name: 'Иван Смирнов', email: 'admin@demo.com', password: 'admin123', role: 'admin' as const },
  { id: 3, name: 'Администратор', email: 'admin@projectsmarket.ru', password: 'Admin123', role: 'admin' as const },
];

const DEMO_ORDERS: Order[] = [
  {
    id: 'ORD-2024-001',
    items: [],
    total: 12900,
    status: 'paid',
    date: '2024-11-20',
  },
  {
    id: 'ORD-2024-002',
    items: [],
    total: 9900,
    status: 'delivered',
    date: '2024-12-01',
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>(DEMO_ORDERS);

  const addToCart = (project: Project) => {
    if (!cart.find(i => i.project.id === project.id)) {
      setCart(prev => [...prev, { project }]);
    }
  };

  const removeFromCart = (projectId: number) => {
    setCart(prev => prev.filter(i => i.project.id !== projectId));
  };

  const isInCart = (projectId: number) => cart.some(i => i.project.id === projectId);

  const login = (email: string, password: string) => {
    const found = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (found) {
      setUser({ id: found.id, name: found.name, email: found.email, role: found.role });
      return true;
    }
    return false;
  };

  const register = (name: string, email: string, _password: string) => {
    setUser({ id: 99, name, email, role: 'user' });
    return true;
  };

  const logout = () => setUser(null);

  const checkout = () => {
    if (cart.length === 0) return;
    const total = cart.reduce((sum, i) => sum + i.project.price, 0);
    const newOrder: Order = {
      id: `ORD-2024-${String(orders.length + 1).padStart(3, '0')}`,
      items: [...cart],
      total,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    };
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
  };

  return (
    <AppContext.Provider value={{ cart, user, orders, addToCart, removeFromCart, isInCart, login, register, logout, checkout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
