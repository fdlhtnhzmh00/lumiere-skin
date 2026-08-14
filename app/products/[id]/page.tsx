"use client";

/**
 * app/products/[id]/page.tsx
 * Halaman Detail Produk LUMIÈRE SKIN
 *
 * URL parameter [id] menerima CUID atau slug produk.
 * Contoh: /products/vitamin-c-brightening-serum ✓
 *
 * Cart Business Rules:
 * BR-05: min qty 1, BR-06: max qty 10, BR-07: tidak melebihi stok
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
import { formatCurrency, cn, getLoginUrl } from "@/lib/utils";
import { CART_MAX_QUANTITY } from "@/lib/validations/cart";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  imageUrl: string;
  description: string;
  ingredients: string | null;
  skinType: string | null;
  howToUse: string | null;
  isActive: boolean;
  category: { name: string; slug: string };
}

const TABS = ["Deskripsi", "Ingredients", "Cara Pakai", "Jenis Kulit"] as const;

export default function ProductDetailPage() {
  const params              = useParams();
  const router              = useRouter();
  const { addItem, getItemQuantity } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct]     = useState<Product | null>(null);
  const [loading, setLoading]     = useState(true);
  const [quantity, setQuantity]   = useState(1);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Deskripsi");
  const [added, setAdded]         = useState(false);
  const [error, setError]         = useState("");
  const [imgErr, setImgErr]       = useState(false);

  // Fetch produk berdasarkan slug atau ID
  useEffect(() => {
    const idOrSlug = params.id as string;
    setLoading(true);
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

  // Hitung batas qty yang boleh ditambahkan
  const cartQty  = product ? getItemQuantity(product.id) : 0;
  const maxQty   = product ? Math.min(CART_MAX_QUANTITY, product.stock) - cartQty : 0;

  // Naik/turun quantity
  const handleQtyChange = (delta: number) => {
    const next = quantity + delta;
    if (next < 1 || next > maxQty) return;
    setQuantity(next);
    setError("");
  };

  // Tambah ke keranjang
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push(getLoginUrl(`/products/${product?.slug ?? params.id}`));
      return;
    }
    if (!product) return;

    const result = addItem(
      {
        id:           product.id,
        name:         product.name,
        price:        product.price,
        stock:        product.stock,
        imageUrl:     product.imageUrl,
        slug:         product.slug,
        categoryName: product.category.name,
      },
      quantity
    );

    if (result.success) {
      setAdded(true);
      setQuantity(1);
      setError("");
      setTimeout(() => setAdded(false), 2500);
    } else {
      setError(result.error ?? "Gagal menambahkan ke keranjang");
    }
  };

  // Beli sekarang: tambah ke cart lalu langsung ke cart
  const handleBuyNow = () => {
    handleAddToCart();
    if (isAuthenticated && !error) {
      setTimeout(() => router.push("/cart"), 300);
    }
  };

  // ── Loading skeleton ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="space-y-4 pt-4">
            <div className="skeleton h-5 w-24 rounded" />
            <div className="skeleton h-8 w-3/4 rounded" />
            <div className="skeleton h-6 w-32 rounded" />
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // ── Produk tidak ditemukan ────────────────────────────────────
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">😕</p>
        <p className="font-heading text-xl font-semibold text-warm-800 mb-2">
          Produk Tidak Ditemukan
        </p>
        <p className="text-sm text-warm-500 mb-6">
          Produk yang Anda cari mungkin sudah tidak tersedia.
        </p>
        <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:underline font-medium">
          <ChevronLeft size={14} /> Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const tabContent: Record<(typeof TABS)[number], string | null> = {
    Deskripsi:   product.description,
    Ingredients: product.ingredients,
    "Cara Pakai": product.howToUse,
    "Jenis Kulit": product.skinType,
  };

  return (
    <div className="min-h-screen bg-warm-50" data-testid="product-detail">

      {/* Breadcrumb */}
      <div className="bg-white border-b border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 text-sm text-warm-500 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-brand-600 shrink-0">Beranda</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-brand-600 shrink-0">Produk</Link>
          <span>/</span>
          <Link href={`/products?category=${product.category.slug}`} className="hover:text-brand-600 shrink-0">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-warm-800 truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm text-warm-500 hover:text-brand-600 mb-6 transition-colors"
        >
          <ChevronLeft size={15} /> Kembali ke Produk
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Gambar Produk ─────────────────────────────────── */}
          <div>
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
                  data-testid="product-image"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
                  <span className="text-6xl">✨</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Info Produk ───────────────────────────────────── */}
          <div className="space-y-5">

            {/* Kategori + Nama */}
            <div>
              <Badge variant="brand" className="mb-3">
                {product.category.name}
              </Badge>
              <h1
                data-testid="product-name"
                className="font-heading text-2xl sm:text-3xl font-semibold text-warm-900 leading-tight"
              >
                {product.name}
              </h1>
            </div>

            {/* Harga + Stok */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span
                data-testid="product-price"
                className="font-heading text-3xl font-semibold text-warm-900"
              >
                {formatCurrency(product.price)}
              </span>
              {product.stock > 0 ? (
                <Badge
                  variant={product.stock <= 5 ? "warning" : "success"}
                  data-testid="product-stock-badge"
                >
                  Stok: {product.stock}
                </Badge>
              ) : (
                <Badge variant="danger" data-testid="product-stock-badge">
                  Stok Habis
                </Badge>
              )}
            </div>

            {/* Rating dekoratif */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  className={cn(
                    s <= 4
                      ? "fill-amber-400 text-amber-400"
                      : "fill-warm-200 text-warm-200"
                  )}
                />
              ))}
              <span className="text-xs text-warm-500 ml-1">(Produk Terpilih)</span>
            </div>

            {/* Tag jenis kulit */}
            {product.skinType && (
              <div className="flex flex-wrap gap-1.5">
                {product.skinType.split(",").map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">
                    {t.trim()}
                  </Badge>
                ))}
              </div>
            )}

            {/* ── Quantity Selector + Tombol Keranjang ─────────── */}
            {product.stock > 0 && (
              <div className="space-y-3 pt-2 border-t border-warm-100">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-warm-700">Jumlah</p>
                  <span className="text-xs text-warm-400">
                    Maks. {Math.min(CART_MAX_QUANTITY, product.stock)} unit
                    {cartQty > 0 && ` · ${cartQty} sudah di keranjang`}
                  </span>
                </div>

                {/* Kontrol +/- */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-warm-300 rounded-xl overflow-hidden">
                    <button
                      data-testid="btn-qty-decrease"
                      onClick={() => handleQtyChange(-1)}
                      disabled={quantity <= 1}
                      aria-label="Kurangi jumlah"
                      className="w-10 h-10 flex items-center justify-center hover:bg-warm-100 transition-colors disabled:opacity-40"
                    >
                      <Minus size={14} />
                    </button>
                    <span
                      data-testid="qty-display"
                      className="w-12 text-center text-sm font-semibold"
                    >
                      {quantity}
                    </span>
                    <button
                      data-testid="btn-qty-increase"
                      onClick={() => handleQtyChange(1)}
                      disabled={quantity >= maxQty}
                      aria-label="Tambah jumlah"
                      className="w-10 h-10 flex items-center justify-center hover:bg-warm-100 transition-colors disabled:opacity-40"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  {maxQty <= 0 && cartQty > 0 && (
                    <span className="text-xs text-amber-600">
                      Batas tercapai ({cartQty}/{Math.min(CART_MAX_QUANTITY, product.stock)})
                    </span>
                  )}
                </div>

                {/* Pesan error */}
                {error && (
                  <p
                    data-testid="add-to-cart-error"
                    className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl"
                  >
                    {error}
                  </p>
                )}

                {/* Info item di keranjang */}
                {cartQty > 0 && !error && (
                  <p className="text-xs text-brand-600">
                    ✓ {cartQty} unit sudah ada di keranjang
                  </p>
                )}

                {/* Tombol Tambah ke Keranjang */}
                <Button
                  onClick={handleAddToCart}
                  disabled={maxQty <= 0}
                  size="lg"
                  className={cn(
                    "w-full gap-2",
                    added ? "bg-green-600 hover:bg-green-600" : ""
                  )}
                  data-testid="btn-add-to-cart"
                >
                  {added ? (
                    <>
                      <Check size={16} /> Berhasil Ditambahkan!
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} />
                      {maxQty <= 0 ? "Batas Keranjang Tercapai" : "Tambah ke Keranjang"}
                    </>
                  )}
                </Button>

                {/* Tombol Beli Sekarang */}
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleBuyNow}
                  disabled={maxQty <= 0}
                  data-testid="btn-buy-now"
                >
                  Beli Sekarang
                </Button>
              </div>
            )}

            {/* ── Tab: Deskripsi / Ingredients / dll ──────────── */}
            <div className="border-t border-warm-200 pt-5">
              <div className="flex gap-1 border-b border-warm-200 mb-4 overflow-x-auto">
                {TABS.filter((t) => tabContent[t]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors",
                      activeTab === tab
                        ? "border-brand-500 text-brand-600"
                        : "border-transparent text-warm-500 hover:text-warm-800"
                    )}
                  >
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
