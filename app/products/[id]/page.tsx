"use client";

/**
 * app/products/[id]/page.tsx
 * Detail produk dengan pilihan quantity dan tambah ke keranjang.
 */

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ShoppingBag, Minus, Plus, Check, Star } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";

interface Product {
  id: string; name: string; slug: string; price: number; stock: number;
  imageUrl: string; description: string; ingredients: string | null;
  skinType: string | null; howToUse: string | null; isActive: boolean;
  category: { name: string; slug: string };
}

const TABS = ["Deskripsi", "Ingredients", "Cara Pakai", "Jenis Kulit"] as const;

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, getItemQuantity } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct]   = useState<Product | null>(null);
  const [loading, setLoading]   = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Deskripsi");
  const [added, setAdded]       = useState(false);
  const [error, setError]       = useState("");
  const [imgErr, setImgErr]     = useState(false);

  useEffect(() => {
    const idOrSlug = params.id as string;
    setLoading(true);

    // API sekarang menerima id ATAU slug secara transparan
    fetch(`/api/products/${encodeURIComponent(idOrSlug)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.product) {
          setProduct(json.data.product);
        } else {
          setProduct(null);
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  const cartQty = product ? getItemQuantity(product.id) : 0;
  const maxQty  = Math.min(10, (product?.stock ?? 0) - cartQty);

  const handleQty = (delta: number) => {
    const next = quantity + delta;
    if (next < 1 || next > maxQty) return;
    setQuantity(next);
    setError("");
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    if (!product) return;

    const result = addItem({
      id: product.id, name: product.name, price: product.price,
      stock: product.stock, imageUrl: product.imageUrl, slug: product.slug,
      categoryName: product.category.name,
    }, quantity);

    if (result.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
      setQuantity(1);
    } else {
      setError(result.error ?? "Gagal menambahkan ke keranjang");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-5 w-24 rounded" />
            <div className="skeleton h-8 w-3/4 rounded" />
            <div className="skeleton h-6 w-32 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-3">😕</p>
        <p className="font-semibold text-warm-800">Produk tidak ditemukan</p>
        <Link href="/products" className="mt-4 inline-block text-sm text-brand-600 hover:underline">
          ← Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const tabContent: Record<typeof TABS[number], string | null> = {
    "Deskripsi":  product.description,
    "Ingredients": product.ingredients,
    "Cara Pakai": product.howToUse,
    "Jenis Kulit": product.skinType,
  };

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 text-sm text-warm-500">
          <Link href="/" className="hover:text-brand-600">Beranda</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-brand-600">Produk</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category.slug}`} className="hover:text-brand-600">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-warm-800 line-clamp-1">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-warm-500 hover:text-brand-600 mb-6 transition-colors">
          <ChevronLeft size={15} /> Kembali ke Produk
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* ── Gambar ─────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-warm-100 rounded-2xl overflow-hidden border border-warm-200">
              {!imgErr && product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={() => setImgErr(true)}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
                  <span className="text-6xl">✨</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Info ───────────────────────────────────────── */}
          <div className="space-y-5">
            <div>
              <Badge variant="brand" className="mb-3">{product.category.name}</Badge>
              <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-warm-900 leading-tight">
                {product.name}
              </h1>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-heading text-3xl font-semibold text-warm-900">
                {formatCurrency(product.price)}
              </span>
              {product.stock > 0 ? (
                <Badge variant="success">Stok: {product.stock}</Badge>
              ) : (
                <Badge variant="danger">Stok Habis</Badge>
              )}
            </div>

            {/* Rating dekoratif */}
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} size={14} className={cn(s <= 4 ? "fill-amber-400 text-amber-400" : "fill-warm-200 text-warm-200")} />
              ))}
              <span className="text-xs text-warm-500 ml-1">(Produk Terpilih)</span>
            </div>

            {product.skinType && (
              <div className="flex flex-wrap gap-1.5">
                {product.skinType.split(",").map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">{t.trim()}</Badge>
                ))}
              </div>
            )}

            {/* Quantity + Cart */}
            {product.stock > 0 && (
              <div className="space-y-3 pt-2">
                <p className="text-sm font-medium text-warm-700">Jumlah</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-warm-300 rounded-xl overflow-hidden">
                    <button onClick={() => handleQty(-1)} disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center hover:bg-warm-100 transition-colors disabled:opacity-40">
                      <Minus size={14} />
                    </button>
                    <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
                    <button onClick={() => handleQty(1)} disabled={quantity >= maxQty}
                      className="w-10 h-10 flex items-center justify-center hover:bg-warm-100 transition-colors disabled:opacity-40">
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-xs text-warm-400">Maks. {maxQty} unit</span>
                </div>

                {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                {cartQty > 0 && !error && (
                  <p className="text-xs text-brand-600">✓ {cartQty} unit sudah ada di keranjang</p>
                )}

                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className={cn("w-full gap-2", added ? "bg-green-600 hover:bg-green-600" : "")}
                >
                  {added ? <><Check size={16} />Berhasil Ditambahkan!</> : <><ShoppingBag size={16} />Tambah ke Keranjang</>}
                </Button>

                <Button variant="outline" size="lg" className="w-full" onClick={() => { handleAddToCart(); if (!error) router.push("/cart"); }}>
                  Beli Sekarang
                </Button>
              </div>
            )}

            {/* Tabs deskripsi */}
            <div className="border-t border-warm-200 pt-5">
              <div className="flex gap-1 border-b border-warm-200 mb-4 overflow-x-auto">
                {TABS.filter((t) => tabContent[t]).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={cn("px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors",
                      activeTab === tab ? "border-brand-500 text-brand-600" : "border-transparent text-warm-500 hover:text-warm-800")}>
                    {tab}
                  </button>
                ))}
              </div>
              <p className="text-sm text-warm-600 leading-relaxed">
                {tabContent[activeTab] ?? "Informasi tidak tersedia."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
