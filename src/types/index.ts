export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  stock: number;
  images: string[];
  categoryId: string;
  category?: Category;
  tags: string;
  weight: string | null;
  origin: string;
  featured: boolean;
  active: boolean;
  reviews?: Review[];
  averageRating?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  products?: Product[];
  _count?: { products: number };
}

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  maxStock: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes: string | null;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  total: number;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  user?: { name: string; lastName: string };
  productId: string;
  approved: boolean;
  createdAt: Date;
}

export interface User {
  id: string;
  dni: string;
  email: string;
  name: string;
  lastName: string;
  phone: string | null;
  role: "USER" | "ADMIN";
  address: string | null;
  city: string | null;
  district: string | null;
  postalCode: string | null;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "transfer" | "yape" | "plin" | "card";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface NewsletterForm {
  email: string;
}
