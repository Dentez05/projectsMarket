export interface ApiUser {
  id: number;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
  emailConfirmed: boolean;
}

export interface AuthResponse {
  token: string;
  user: ApiUser;
}

export interface ApiCategory {
  id: number;
  name: string;
  description: string;
}

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
  soldCount?: number;
  averageRating?: number;
  reviewsCount?: number;
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
  promoCode?: string | null;
  discountAmount?: number;
  items: ApiOrderItem[];
}

export interface ApiSupportMessage {
  id: number;
  ticketId: number;
  senderId: number;
  senderRole: 'User' | 'Admin';
  senderName: string;
  body: string;
  createdAt: string;
}

export interface ApiSupportTicket {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: 'Open' | 'Answered' | 'Closed';
  createdAt: string;
  lastMessageAt: string;
  unreadCount: number;
  messages?: ApiSupportMessage[];
}

export interface ApiReview {
  id: number;
  projectId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ApiPromoCode {
  id: number;
  code: string;
  type: 'Percent' | 'Fixed';
  value: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface PromoValidationResponse {
  isValid: boolean;
  error?: string | null;
  code?: string | null;
  type?: string | null;
  value: number;
  discount: number;
  total: number;
}
