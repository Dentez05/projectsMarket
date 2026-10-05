// ─── User ───────────────────────────────────────────────
export interface ApiUser {
  id: number;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: ApiUser;
}

// ─── Category ───────────────────────────────────────────
export interface ApiCategory {
  id: number;
  name: string;
  description: string;
}

// ─── Project ────────────────────────────────────────────
export interface ApiProject {
  id: number;
  title: string;
  description: string;
  fullDescription: string;
  price: number;
  createdByUserId: number;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  categoryId: number | null;
  categoryName: string;
  images: string[];
  technologies: string[];
  demo: string | null;
  isNew: boolean;
  popular: boolean;
  previewImages: string[];
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  fullDescription: string;
  price: number;
  categoryId: number | null;
  images: string[];
  technologies: string[];
  previewImages: string[];
  demo: string;
  isNew: boolean;
  popular: boolean;
}

// ─── Cart ───────────────────────────────────────────────
export interface ApiCartItem {
  id: number;
  projectId: number;
  title: string;
  price: number;
  addedAt: string;
}

export interface ApiCartResponse {
  items: ApiCartItem[];
  totalPrice: number;
  count: number;
}

// ─── Order ──────────────────────────────────────────────
export interface ApiOrderItem {
  projectId: number;
  title: string;
  price: number;
}

export interface ApiOrder {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  paymentId: string | null;
  userName: string;
  userEmail: string;
  items: ApiOrderItem[];
}

// ─── Payment ────────────────────────────────────────────
export interface ApiPaymentResponse {
  paymentId: string;
  confirmationUrl: string;
  status: string;
}

// ─── Support ────────────────────────────────────────────
export interface ApiSupportTicket {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: 'Open' | 'Answered' | 'Closed';
  adminReply: string | null;
  createdAt: string;
  repliedAt: string | null;
}
