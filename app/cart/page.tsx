"use client";

/**
 * app/cart/page.tsx
 */

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn, getLoginUrl } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalItems, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [qtyErrors, setQtyErrors] = useState<Record<string, string>>({});

  const handleQty = (productId: string, delta: number, currentQty: number) => {
    const result = updateQuantity(productId, currentQty + delta);
    if (!result.success) {
      setQtyErrors((e) => ({ ...e, [productId]: result.error ?? "Error" }));
      setTimeout(() => setQtyErrors((e) => { const n = {...e}; delete n[productId]; return n; }), 3000);
    } else {
      setQtyErrors((e) => { const n = {...e}; delete n[productId]; return n; });
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push(getLoginUrl("/checkout"));
      return;
    }
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4">
        <div className="w-24 h-24 rounded-full bg-brand-100 flex items-center justify-center">
          <ShoppingBag size={36} className="text-brand-400" />
        </div>
        <div className="text-center">
          <p className="font-heading text-xl font-semibold text-warm-900">Keranjang Masih Kosong</p>
          <p className="text-sm text-warm-500 mt-1">Tambahkan produk skincare favorit Anda</p>
        </div>
        <Link href="/products">
          <Button size="lg" className="gap-2">
            Mulai Belanja <ArrowRight size={15} />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="bg-white border-b border-warm-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="font-heading text-2xl font-semibold text-warm-900">
            Keranjang Belanja
          </h1>
          <p className="text-sm text-warm-500 mt-1">{totalItems} produk</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Item List ─────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="bg-white rounded-2xl border border-warm-200 p-4 flex gap-4">
                {/* Gambar */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-warm-100 shrink-0">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill className="object-cover"
                    onError={() => {}}
                    sizes="80px"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${product.slug}`}
                    className="text-sm font-medium text-warm-900 hover:text-brand-600 line-clamp-2 leading-snug">
                    {product.name}
                  </Link>
                  <p className="text-xs text-warm-400 mt-0.5">{product.categoryName}</p>
                  <p className="text-sm font-semibold text-warm-900 mt-1.5">
                    {formatCurrency(product.price)}
                  </p>

                  {qtyErrors[product.id] && (
                    <p className="text-xs text-red-600 mt-1">{qtyErrors[product.id]}</p>
                  )}

                  {/* Quantity control */}
                  <div className="flex items-center justify-between mt-2.5">
                    <div className="flex items-center border border-warm-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleQty(product.id, -1, quantity)}
                        disabled={quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center hover:bg-warm-100 disabled:opacity-40 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold">{quantity}</span>
                      <button
                        onClick={() => handleQty(product.id, 1, quantity)}
                        disabled={quantity >= Math.min(10, product.stock)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-warm-100 disabled:opacity-40 transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-brand-600">
                        {formatCurrency(product.price * quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-warm-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Summary ───────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-warm-200 p-5 sticky top-24 space-y-4">
              <h2 className="font-semibold text-warm-900">Ringkasan Belanja</h2>
              <div className="space-y-2 text-sm">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-warm-600">
                    <span className="line-clamp-1 max-w-[70%]">{product.name} ×{quantity}</span>
                    <span className="shrink-0">{formatCurrency(product.price * quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-warm-200 pt-3 flex justify-between font-semibold text-warm-900">
                <span>Total</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>

              <Button size="lg" className="w-full gap-2" onClick={handleCheckout}>
                Lanjut ke Checkout <ArrowRight size={15} />
              </Button>

              {!isAuthenticated && (
                <p className="text-xs text-center text-warm-500">
                  Anda perlu{" "}
                  <Link href={getLoginUrl("/checkout")} className="text-brand-600 hover:underline">masuk</Link>{" "}
                  untuk checkout
                </p>
              )}

              <Link href="/products" className="block text-center text-xs text-warm-500 hover:text-brand-600">
                ← Lanjut Belanja
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
