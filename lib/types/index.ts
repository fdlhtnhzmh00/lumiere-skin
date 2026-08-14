import { OrderStatus } from "@prisma/client";

// =====================
// CART TYPES
// =====================
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  quantity: number;
  categoryName: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// =====================
// API RESPONSE TYPES
// =====================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// =====================
// PRODUCT TYPES
// =====================
export interface ProductWithCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  ingredients: string | null;
  skinType: string | null;
  howToUse: string | null;
  price: number;
  stock: number;
  imageUrl: string;
  isActive: boolean;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// =====================
// ORDER TYPES
// =====================
export interface OrderItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CreateOrderInput {
  recipientName: string;
  shippingAddress: string;
  phoneNumber: string;
  notes?: string;
  items: OrderItemInput[];
}

export interface OrderWithItems {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalPrice: number;
  recipientName: string;
  shippingAddress: string;
  phoneNumber: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    product: {
      id: string;
      name: string;
      imageUrl: string;
      slug: string;
    };
  }[];
}

// =====================
// STATUS TRANSITION TYPES
// =====================
export type ValidStatusTransition = {
  from: OrderStatus;
  to: OrderStatus;
};

export const VALID_TRANSITIONS: ValidStatusTransition[] = [
  { from: "DRAFT", to: "CONFIRMED" },
  { from: "DRAFT", to: "CANCELLED" },
  { from: "CONFIRMED", to: "COMPLETED" },
  { from: "CONFIRMED", to: "CANCELLED" },
];
