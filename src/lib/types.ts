import type { DropPhase } from "./drop-config";

export type OrderStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderBuyer {
  name: string;
  phone: string;
  deliveryType: "delivery" | "pickup";
  address: string;
}

export interface Order {
  id: number;
  receipt: string;
  status: OrderStatus;
  createdAt: string;
  buyer: OrderBuyer;
  amount: number;
  productName?: string;
  edition?: string;
  paymentMethod?: "paylov" | "apple" | "google";
}

export interface WaitlistEntry {
  id: string;
  contact: string;
  createdAt: number;
}

export interface LiveProduct {
  id: string;
  name: string;
  edition: string;
  tagline?: string;
  price: number;
  currency?: string;
  mediaType?: '3d' | 'images';
  modelUrl?: string;
  images?: string[];
  colors?: {
    bg: string;
    fg: string;
    muted: string;
    accent: string;
    btn: string;
    btnText: string;
  };
  toolbarVariant?: 'light' | 'dark';
  modelScale?: number;
  cameraZ?: number;
}

export interface DropSnapshot {
  phase: DropPhase;
  stock: number;
  available: number;
  totalStock: number;
  startsAt: string;
  price: number;
  currency: string;
  name: string;
  edition: string;
  images: readonly string[];
  paused: boolean;
  product?: LiveProduct;
  dropId?: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  visible?: boolean;
}

export interface StorefrontDropCard {
  id: string;
  productId: string;
  phase: DropPhase;
  startsAt: string;
  stock: number;
  available: number;
  paused: boolean;
  name: string;
  edition: string;
  price: number;
  currency: string;
  images: string[];
  mediaType?: string;
  modelUrl?: string;
}

export interface StorefrontSnapshot {
  storefront: {
    displayName: string;
    bio: string;
    avatarUrl: string;
    logoEmoji: string;
    heroBgUrl?: string;
    socialLinks: SocialLink[];
  };
  drops: StorefrontDropCard[];
  products: LiveProduct[];
}

export interface CheckoutResult {
  ok: boolean;
  orderId: number;
  receipt: string;
  status: OrderStatus;
}

export interface AdminSnapshot {
  stock: number;
  totalStock: number;
  available: number;
  paused: boolean;
  startsAt: string;
  holds: { id: string; expiresAt: number }[];
  orders: Order[];
  waitlist: WaitlistEntry[];
}
