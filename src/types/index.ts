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
  /** Costo promedio ponderado puesto en Lima (se recalcula al recibir lotes) */
  cost?: number | null;
  /** Umbral de alerta de stock bajo (default 5) */
  lowStockThreshold?: number;
  images: string[];
  categoryId: string;
  category?: Category;
  brand?: string;
  subcategorySlug?: string;
  attributes?: string | Record<string, string>;
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

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  icon?: string;
  order?: number;
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
  // --- Logística ---
  carrier?: Carrier;
  trackingCode?: string;
  shippedAt?: string;
  deliveredAt?: string;
  // --- Descuentos ---
  couponCode?: string;
  /** Monto descontado (S/) aplicado al subtotal */
  discount?: number;
  // --- Pago online ---
  /** ID del cargo en la pasarela (Culqi: chr_…) */
  chargeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type Carrier = "OLVA" | "SHALOM" | "OTRO";

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

// ---------------------------------------------------------------------------
// Inventario
// ---------------------------------------------------------------------------

export type StockMovementType = "PURCHASE" | "SALE" | "ADJUSTMENT" | "CANCEL_RESTOCK";

export interface StockMovement {
  id: string;
  productId: string;
  /** Denormalizado para listar sin N+1 */
  productName: string;
  type: StockMovementType;
  /** Positivo = entra stock, negativo = sale */
  quantity: number;
  /** Balance del producto después del movimiento (auditable) */
  stockAfter: number;
  /** Costo unitario puesto en Lima (solo PURCHASE) */
  unitCost?: number;
  /** orderId o lotId que originó el movimiento */
  reference?: string;
  note?: string;
  createdBy: string;
  createdAt: string;
}

export interface PurchaseLotItem {
  productId: string;
  productName: string;
  qty: number;
  /** Costo unitario de compra (sin flete/extras) */
  unitCost: number;
  /** Costo unitario + extras prorrateados por valor de línea = puesto en Lima */
  landedUnitCost: number;
}

export interface PurchaseLot {
  id: string;
  /** Código legible secuencial: LOTE-001 */
  code: string;
  supplier: string;
  sourceUrl?: string;
  purchaseDate: string;
  items: PurchaseLotItem[];
  /** Flete + tributos + otros costos del lote (se prorratean) */
  extraCosts: number;
  itemsTotal: number;
  grandTotal: number;
  note?: string;
  createdBy: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Campañas y cupones
// ---------------------------------------------------------------------------

export type CampaignScope = "ALL" | "CATEGORY" | "PRODUCTS";

export interface CampaignHero {
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
}

export interface Campaign {
  id: string;
  name: string;
  /** Si existe, la campaña aparece en el hero de la portada */
  hero?: CampaignHero;
  /** 0 = solo banner, sin descuento */
  discountPercent: number;
  appliesTo: CampaignScope;
  categoryId?: string;
  productIds?: string[];
  startsAt: string;
  endsAt: string;
  showCountdown: boolean;
  active: boolean;
  /** A mayor prioridad gana cuando varias campañas alcanzan un producto */
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export type CouponType = "PERCENT" | "FIXED";

export interface Coupon {
  id: string;
  /** Siempre en UPPERCASE */
  code: string;
  type: CouponType;
  value: number;
  minOrder?: number;
  maxUses?: number;
  usedCount: number;
  startsAt?: string;
  endsAt?: string;
  active: boolean;
  createdAt: string;
}

/** Producto con precio efectivo resuelto en servidor (campañas aplicadas) */
export interface PricedProduct extends Product {
  finalPrice: number;
  /** Precio de referencia tachado (compareAtPrice o price pre-campaña) */
  effectiveCompareAt: number | null;
  discountPercent: number;
  campaignId?: string;
  campaignEndsAt?: string;
  showCountdown?: boolean;
}

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
