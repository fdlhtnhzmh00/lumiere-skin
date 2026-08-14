"use client";

/**
 * components/products/ProductCard.tsx
 * LUMIÈRE SKIN — Product Card v2.0
 * Clean minimal luxury skincare card style
 */

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Check, Plus, Star } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { cn, formatCurrency, getLoginUrl } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  imageUrl: string;
  description: string;
  category: { name: string; slug: string };
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem, isInCart } = useCart();
  const { isAuthenticated }   = useAuth();
  const router = useRouter();
  const [added, setAdded]     = useState(false);
  const [imgError, setImgError] = useState(false);

  const inCart   = isInCart(product.id);
  const outStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push(getLoginUrl(`/products/${product.slug}`));
      return;
    }
    if (outStock) return;

    const result = addItem({
      id:           product.id,
      name:         product.name,
      price:        product.price,
      stock:        product.stock,
      imageUrl:     product.imageUrl,
      slug:         product.slug,
      categoryName: product.category.name,
    }, 1);

    if (result.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
      data-testid="product-card"
    >
      <div className="bg-white rounded-2xl overflow-hidden card-shadow card-shadow-hover transition-all duration-300">

        {/* ── Image Area ─────────────────────────────────────── */}
        <div className="relative aspect-square overflow-hidden bg-stone-100">
          {!imgError ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-100 to-sage-100">
              <span className="text-4xl opacity-40">✨</span>
            </div>
          )}

          {/* Stock out overlay */}
          {outStock && (
            <div className="absolute inset-0 bg-stone-900/30 flex items-center justify-center">
              <span className="bg-white text-stone-700 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                Out of Stock
              </span>
            </div>
          )}

          {/* Low stock badge */}
          {lowStock && !outStock && (
            <div className="absolute top-3 left-3">
              <span className="bg-amber-50 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                Only {product.stock} left
              </span>
            </div>
          )}

          {/* Quick Add button — visible on hover */}
          {!outStock && (
            <button
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to cart`}
              data-testid="btn-add-to-cart-card"
              data-product-id={product.id}
              className={cn(
                "absolute bottom-3 right-3 w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-all duration-200 z-10",
                "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0",
                added
                  ? "bg-sage-600 text-white"
                  : "bg-white text-stone-800 hover:bg-sage-600 hover:text-white"
              )}
            >
              {added ? <Check size={15} /> : <Plus size={15} />}
            </button>
          )}
        </div>

        {/* ── Product Info ──────────────────────────────────── */}
        <div className="p-4 space-y-2">

          {/* Category label */}
          <p className="label-overline">{product.category.name}</p>

          {/* Product name */}
          <h3
            data-testid="product-card-name"
            className="font-heading text-sm font-semibold text-stone-900 line-clamp-2 leading-snug group-hover:text-sage-700 transition-colors"
          >
            {product.name}
          </h3>

          {/* Stars (decorative) */}
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map((s) => (
              <Star
                key={s}
                size={10}
                className={cn(
                  s <= 4 ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"
                )}
              />
            ))}
            <span className="text-[10px] text-stone-400 ml-1">(—)</span>
          </div>

          {/* Price row */}
          <div className="flex items-center justify-between pt-1">
            <span
              data-testid="product-card-price"
              className="text-sm font-bold text-stone-900"
            >
              {formatCurrency(product.price)}
            </span>

            {/* Mobile add button (always visible on mobile, not just hover) */}
            {!outStock && (
              <button
                onClick={handleAddToCart}
                aria-label={`Add ${product.name} to cart`}
                className={cn(
                  "sm:hidden w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                  added
                    ? "bg-sage-600 text-white"
                    : "bg-stone-100 text-stone-700 hover:bg-sage-600 hover:text-white"
                )}
              >
                {added ? <Check size={13} /> : <Plus size={13} />}
              </button>
            )}
          </div>

          {/* Full-width add button (shown below price on mobile → keeps consistent with desktop) */}
          {!outStock && (
            <button
              onClick={handleAddToCart}
              data-testid="btn-add-to-cart-card"
              data-product-id={product.id}
              className={cn(
                "hidden sm:flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all mt-1",
                added
                  ? "bg-sage-600 text-white"
                  : inCart
                  ? "bg-sage-50 text-sage-700 border border-sage-200 hover:bg-sage-100"
                  : "bg-stone-100 text-stone-700 hover:bg-sage-600 hover:text-white"
              )}
            >
              {added ? (
                <><Check size={12} />Added!</>
              ) : inCart ? (
                <><ShoppingBag size={12} />Add Again</>
              ) : (
                <><ShoppingBag size={12} />Add to Cart</>
              )}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
