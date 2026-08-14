"use client";

/**
 * app/products/[id]/page.tsx
 * Product Detail — v2.0
 */

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ShoppingBag, Minus, Plus, Check, Star, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/context/AuthContext";
import { formatCurrency, cn, getLoginUrl } from "@/lib/utils";
import { CART_MAX_QUANTITY } from "@/lib/validations/cart";

interface Product {
  id: string; name: string; slug: string; price: number; stock: number;
  imageUrl: string; description: string; ingredients: string | null;
  skinType: string | null; howToUse: string | null; isActive: boolean;
  category: { name: string; slug: string };
}

const TABS = ["Description", "Ingredients", "How to Use", "Skin Type"] as const;

export default function ProductDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const { addItem, getItemQuantity } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct]   = useState<Product | null>(null);
  const [loading, setLoading]   = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Description");
  const [added, setAdded]   = useState(false);
  const [error, setError]   = useState("");
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    const idOrSlug = params.id as string;
    setLoading(true);
    fetch(`/api/products/${encodeURIComponent(idOrSlug)}`)
      .then((r) => r.json())
      .then((json) => {
        setProduct(json.success && json.data?.product ? json.data.product : null);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  const cartQty = product ? getItemQuantity(product.id) : 0;
  const maxQty  = product ? Math.min(CART_MAX_QUANTITY, product.stock) - cartQty : 0;

  const handleQtyChange = (delta: number) => {
    const next = quantity + delta;
    if (next < 1 || next > maxQty) return;
    setQuantity(next); setError("");
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) { router.push(getLoginUrl(`/products/${product?.slug ?? params.id}`)); return; }
    if (!product) return;
    const result = addItem({ id: product.id, name: product.name, price: product.price, stock: product.stock, imageUrl: product.imageUrl, slug: product.slug, categoryName: product.category.name }, quantity);
    if (result.success) { setAdded(true); setQuantity(1); setError(""); setTimeout(() => setAdded(false), 2500); }
    else setError(result.error ?? "Failed to add to cart");
  };

  // Tab data mapping
  const tabContent: Record<(typeof TABS)[number], string | null> = {
    "Description":  product?.description ?? null,
    "Ingredients":  product?.ingredients ?? null,
    "How to Use":   product?.howToUse ?? null,
    "Skin Type":    product?.skinType ?? null,
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="skeleton aspect-square rounded-2xl" />
        <div className="space-y-5 pt-4">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-9 w-4/5 rounded" />
          <div className="skeleton h-7 w-32 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-3/4 rounded" />
          <div className="skeleton h-12 w-full rounded-xl mt-4" />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-24 text-center">
      <p className="text-5xl mb-5">😕</p>
      <h2 className="font-heading text-2xl text-stone-800 mb-3">Product Not Found</h2>
      <p className="text-stone-500 mb-7 text-sm">This product may no longer be available.</p>
      <Link href="/products" className="btn-primary inline-flex gap-2">
        <ChevronLeft size={15} /> Back to Products
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50" data-testid="product-detail">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 text-xs text-stone-400 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-sage-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-sage-600 transition-colors">Products</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category.slug}`} className="hover:text-sage-600 transition-colors">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-stone-700 truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-sage-700 mb-8 transition-colors font-medium">
          <ChevronLeft size={15} /> Back to Products
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">

          {/* Image */}
          <div className="relative aspect-square bg-stone-100 rounded-2xl overflow-hidden">
            {!imgErr && product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                onError={() => setImgErr(true)}
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                data-testid="product-image"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-100 to-sage-100">
                <span className="text-6xl opacity-25">✨</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            {/* Category */}
            <p className="label-overline text-sage-600">{product.category.name}</p>

            {/* Name */}
            <h1 data-testid="product-name" className="font-heading text-3xl sm:text-4xl text-stone-900 leading-tight">
              {product.name}
            </h1>

            {/* Stars */}
            <div className="flex items-center gap-1.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={14} className={cn(s <= 4 ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200")} />
              ))}
              <span className="text-xs text-stone-400 ml-1">Featured Product</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span data-testid="product-price" className="font-heading text-3xl font-bold text-stone-900">
                {formatCurrency(product.price)}
              </span>
              {product.stock > 0 ? (
                <span data-testid="product-stock-badge" className={cn(
                  "text-xs font-semibold px-2.5 py-1 rounded-full",
                  product.stock <= 5 ? "bg-amber-50 text-amber-700" : "bg-sage-50 text-sage-700"
                )}>
                  {product.stock <= 5 ? `Only ${product.stock} left` : `In Stock (${product.stock})`}
                </span>
              ) : (
                <span data-testid="product-stock-badge" className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Skin type tags */}
            {product.skinType && (
              <div className="flex flex-wrap gap-2">
                {product.skinType.split(",").map((t) => (
                  <span key={t} className="text-xs bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full border border-stone-200">
                    {t.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Quantity + Add to Cart */}
            {product.stock > 0 && (
              <div className="space-y-4 pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-stone-700">Quantity</p>
                  <span className="text-xs text-stone-400">Max {Math.min(CART_MAX_QUANTITY, product.stock)} per order</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-white">
                    <button
                      data-testid="btn-qty-decrease"
                      onClick={() => handleQtyChange(-1)}
                      disabled={quantity <= 1}
                      className="w-11 h-11 flex items-center justify-center hover:bg-stone-50 disabled:opacity-30 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span data-testid="qty-display" className="w-12 text-center text-sm font-bold text-stone-900">
                      {quantity}
                    </span>
                    <button
                      data-testid="btn-qty-increase"
                      onClick={() => handleQtyChange(1)}
                      disabled={quantity >= maxQty}
                      className="w-11 h-11 flex items-center justify-center hover:bg-stone-50 disabled:opacity-30 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  {cartQty > 0 && <span className="text-xs text-sage-600 font-medium">✓ {cartQty} already in cart</span>}
                </div>

                {error && (
                  <p data-testid="add-to-cart-error" className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleAddToCart}
                  disabled={maxQty <= 0}
                  data-testid="btn-add-to-cart"
                  className={cn(
                    "w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm transition-all",
                    added ? "bg-sage-600 text-white" :
                    maxQty <= 0 ? "bg-stone-100 text-stone-400 cursor-not-allowed" :
                    "btn-primary w-full"
                  )}
                >
                  {added ? <><Check size={16} />Added to Cart!</> : <><ShoppingBag size={16} />{maxQty <= 0 ? "Cart Limit Reached" : "Add to Cart"}</>}
                </button>

                <button
                  onClick={() => { handleAddToCart(); if (!error && isAuthenticated) setTimeout(() => router.push("/cart"), 300); }}
                  disabled={maxQty <= 0}
                  data-testid="btn-buy-now"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm border-2 border-stone-200 text-stone-800 hover:border-sage-400 hover:text-sage-700 transition-all bg-white"
                >
                  Buy Now <ArrowRight size={15} />
                </button>
              </div>
            )}

            {/* Tabs */}
            <div className="border-t border-stone-100 pt-6">
              <div className="flex gap-0 border-b border-stone-200 mb-5 overflow-x-auto">
                {TABS.filter((t) => tabContent[t]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors",
                      activeTab === tab
                        ? "border-sage-600 text-sage-700"
                        : "border-transparent text-stone-400 hover:text-stone-700"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">
                {tabContent[activeTab] ?? "Information not available."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
