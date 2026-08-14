"use client";

/**
 * lib/context/CartContext.tsx
 * Keranjang belanja — disimpan di localStorage.
 * Validasi quantity menggunakan business rules dari lib/validations/cart.ts
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { validateCartQuantity } from "@/lib/validations/cart";

// ─── Tipe ────────────────────────────────────────────────────
export interface CartProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  slug: string;
  categoryName: string;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface AddResult {
  success: boolean;
  error?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: CartProduct, quantity?: number) => AddResult;
  updateQuantity: (productId: string, quantity: number) => AddResult;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

// ─── Context ──────────────────────────────────────────────────
const CartContext = createContext<CartContextType | null>(null);
const LS_CART = "lumiere_cart";

// ─── Provider ────────────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Baca cart dari localStorage saat mount (hanya sekali)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_CART);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  // Simpan ke localStorage setiap kali items berubah
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(LS_CART, JSON.stringify(items));
  }, [items, hydrated]);

  // ── addItem ──────────────────────────────────────────────────
  const addItem = useCallback(
    (product: CartProduct, quantity = 1): AddResult => {
      const existing = items.find((i) => i.product.id === product.id);
      const currentQty = existing ? existing.quantity : 0;
      const newQty = currentQty + quantity;

      const validation = validateCartQuantity(newQty, product.stock);
      if (!validation.valid) return { success: false, error: validation.error! };

      setItems((prev) => {
        if (existing) {
          return prev.map((i) =>
            i.product.id === product.id ? { ...i, quantity: newQty } : i
          );
        }
        return [...prev, { product, quantity }];
      });
      return { success: true };
    },
    [items]
  );

  // ── updateQuantity ────────────────────────────────────────────
  const updateQuantity = useCallback(
    (productId: string, quantity: number): AddResult => {
      const item = items.find((i) => i.product.id === productId);
      if (!item) return { success: false, error: "Produk tidak ada di keranjang" };

      const validation = validateCartQuantity(quantity, item.product.stock);
      if (!validation.valid) return { success: false, error: validation.error! };

      setItems((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
      );
      return { success: true };
    },
    [items]
  );

  // ── removeItem ────────────────────────────────────────────────
  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const isInCart = useCallback(
    (productId: string) => items.some((i) => i.product.id === productId),
    [items]
  );

  const getItemQuantity = useCallback(
    (productId: string) =>
      items.find((i) => i.product.id === productId)?.quantity ?? 0,
    [items]
  );

  const { totalItems, totalPrice } = useMemo(
    () => ({
      totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalItems,
        totalPrice,
        isInCart,
        getItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart harus digunakan di dalam CartProvider");
  return ctx;
}
