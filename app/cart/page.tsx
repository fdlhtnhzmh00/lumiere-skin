"use client";

/**
 * app/cart/page.tsx — Cart v2.0
 * All business rules preserved, visual redesign applied.
 * BR-05: min qty 1 | BR-06: max qty 10 | BR-07: ≤ stock | BR-08: positive integer
 */

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, AlertCircle } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/context/AuthContext";
import { formatCurrency, cn, getLoginUrl } from "@/lib/utils";
import { CART_MAX_QUANTITY } from "@/lib/validations/cart";

// ─── Cart Item Row ────────────────────────────────────────────
interface CartItemRowProps {
  productId: string; name: string; slug: string; categoryName: string;
  price: number; stock: number; imageUrl: string; quantity: number;
  onUpdateQty: (id: string, qty: number) => { success: boolean; error?: string };
  onRemove: (id: string) => void;
}

function CartItemRow({ productId, name, slug, categoryName, price, stock, imageUrl, quantity, onUpdateQty, onRemove }: CartItemRowProps) {
  const [inputVal, setInputVal]   = useState(String(quantity));
  const [inputError, setInputError] = useState<string | null>(null);
  const [imgErr, setImgErr]       = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const maxAllowed = Math.min(CART_MAX_QUANTITY, stock);

  useEffect(() => { setInputVal(String(quantity)); setInputError(null); }, [quantity]);

  const applyQty = (raw: string) => {
    if (raw.trim() === "" || raw.trim() === String(quantity)) { setInputVal(String(quantity)); setInputError(null); return; }
    const result = onUpdateQty(productId, Number(raw.trim()));
    if (!result.success) { setInputError(result.error ?? "Invalid quantity"); setInputVal(String(quantity)); }
    else setInputError(null);
  };

  const handleStep = (delta: number) => {
    const result = onUpdateQty(productId, quantity + delta);
    if (!result.success) setInputError(result.error ?? "Error");
    else setInputError(null);
  };

  return (
    <div data-testid="cart-item" data-product-id={productId} className="bg-white rounded-2xl border border-stone-200 p-4 flex gap-4 card-shadow">
      {/* Image */}
      <Link href={`/products/${slug}`} className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 block">
        {!imgErr ? (
          <Image src={imageUrl} alt={name} fill className="object-cover" onError={() => setImgErr(true)} sizes="80px" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-stone-100 to-sage-50 flex items-center justify-center text-xl opacity-30">✨</div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="label-overline">{categoryName}</p>
        <Link href={`/products/${slug}`} data-testid="cart-item-name" className="text-sm font-semibold text-stone-900 hover:text-sage-700 line-clamp-2 leading-snug transition-colors block">
          {name}
        </Link>
        <p data-testid="cart-item-price" className="text-sm font-bold text-stone-900">{formatCurrency(price)}</p>
        <p className="text-[10px] text-stone-400">In stock: {stock} · Max {maxAllowed}/order</p>

        {inputError && (
          <div data-testid="cart-qty-error" className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 px-2.5 py-1.5 rounded-lg">
            <AlertCircle size={11} /> {inputError}
          </div>
        )}

        {/* Quantity + Subtotal + Remove */}
        <div className="flex items-center justify-between pt-2">
          <div className={cn("flex items-center border rounded-xl overflow-hidden bg-white transition-colors", inputError ? "border-red-300" : "border-stone-200")}>
            <button data-testid="btn-qty-decrease" onClick={() => handleStep(-1)} disabled={quantity <= 1} aria-label="Decrease" className="w-8 h-8 flex items-center justify-center hover:bg-stone-50 disabled:opacity-30 transition-colors">
              <Minus size={12} />
            </button>
            <input
              ref={inputRef}
              data-testid="cart-qty-input"
              type="number" min={1} max={maxAllowed}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onBlur={(e) => applyQty(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
              className="w-9 h-8 text-center text-xs font-bold bg-transparent border-x border-stone-200 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button data-testid="btn-qty-increase" onClick={() => handleStep(1)} disabled={quantity >= maxAllowed} aria-label="Increase" className="w-8 h-8 flex items-center justify-center hover:bg-stone-50 disabled:opacity-30 transition-colors">
              <Plus size={12} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span data-testid="cart-item-subtotal" className="text-sm font-bold text-stone-900">
              {formatCurrency(price * quantity)}
            </span>
            <button data-testid="btn-remove-item" onClick={() => onRemove(productId)} aria-label={`Remove ${name}`} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Cart Page ────────────────────────────────────────────────
export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalItems, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleUpdateQty = (productId: string, newQty: number) => updateQuantity(productId, newQty);
  const handleCheckout  = () => {
    if (!isAuthenticated) { router.push(getLoginUrl("/checkout")); return; }
    router.push("/checkout");
  };

  // Empty state
  if (items.length === 0) {
    return (
      <div data-testid="cart-empty" className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4 bg-stone-50">
        <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center">
          <ShoppingBag size={32} className="text-stone-400" />
        </div>
        <div className="text-center">
          <h2 className="font-heading text-2xl text-stone-800 mb-2">Your cart is empty</h2>
          <p className="text-sm text-stone-400">Discover our premium skincare collection</p>
        </div>
        <Link href="/products" data-testid="btn-start-shopping" className="btn-primary inline-flex gap-2">
          Shop Now <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <div data-testid="cart-page" className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="label-overline text-sage-600 mb-1">Shopping</p>
              <h1 className="font-heading text-3xl text-stone-900">Your Cart</h1>
              <p data-testid="cart-items-count" className="text-sm text-stone-400 mt-1">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
            </div>
            <button onClick={clearCart} data-testid="btn-clear-cart" className="text-xs text-stone-400 hover:text-red-500 transition-colors">
              Clear all
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(({ product, quantity }) => (
              <CartItemRow key={product.id} productId={product.id} name={product.name} slug={product.slug} categoryName={product.categoryName} price={product.price} stock={product.stock} imageUrl={product.imageUrl} quantity={quantity} onUpdateQty={handleUpdateQty} onRemove={removeItem} />
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sticky top-24 card-shadow space-y-5">
              <h2 className="font-heading text-xl text-stone-900">Order Summary</h2>

              <div className="space-y-2 max-h-44 overflow-y-auto">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-xs text-stone-500">
                    <span className="line-clamp-1 max-w-[65%]">{product.name} ×{quantity}</span>
                    <span className="shrink-0">{formatCurrency(product.price * quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-100 pt-4 flex justify-between font-bold text-stone-900">
                <span>Total</span>
                <span data-testid="cart-total-price">{formatCurrency(totalPrice)}</span>
              </div>

              <button onClick={handleCheckout} data-testid="btn-checkout" className="w-full btn-primary py-3.5 flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight size={15} />
              </button>

              {!isAuthenticated && (
                <p className="text-xs text-center text-stone-400">
                  <Link href={getLoginUrl("/checkout")} className="text-sage-600 font-semibold hover:underline">Sign in</Link> to complete your order
                </p>
              )}

              <Link href="/products" className="block text-center text-xs text-stone-400 hover:text-sage-600 transition-colors">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
