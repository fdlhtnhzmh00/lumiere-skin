"use client";

/**
 * app/cart/page.tsx
 * Keranjang Belanja LUMIÈRE SKIN
 *
 * Business Rules yang diimplementasikan:
 * BR-05: Jumlah minimal pembelian 1 unit
 * BR-06: Jumlah maksimal pembelian 10 unit per produk
 * BR-07: Jumlah tidak boleh melebihi stok tersedia
 * BR-08: Jumlah harus bilangan bulat positif (tidak negatif/nol/pecahan/teks)
 */

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, AlertCircle } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn, getLoginUrl } from "@/lib/utils";
import { CART_MAX_QUANTITY } from "@/lib/validations/cart";

// ─── Komponen CartItem ────────────────────────────────────────
interface CartItemRowProps {
  productId: string;
  name: string;
  slug: string;
  categoryName: string;
  price: number;
  stock: number;
  imageUrl: string;
  quantity: number;
  onUpdateQty: (productId: string, newQty: number) => { success: boolean; error?: string };
  onRemove: (productId: string) => void;
}

function CartItemRow({
  productId, name, slug, categoryName, price, stock,
  imageUrl, quantity, onUpdateQty, onRemove,
}: CartItemRowProps) {
  // Input langsung: bisa ketik angka, +, atau −
  const [inputVal, setInputVal]   = useState(String(quantity));
  const [inputError, setInputError] = useState<string | null>(null);
  const [imgErr, setImgErr]       = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Batas atas yang berlaku: lebih kecil dari MAX_QTY atau stok
  const maxAllowed = Math.min(CART_MAX_QUANTITY, stock);

  // Sinkronkan input ketika quantity dari context berubah dari luar
  React.useEffect(() => {
    setInputVal(String(quantity));
    setInputError(null);
  }, [quantity]);

  const applyQty = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === "" || trimmed === String(quantity)) {
      setInputVal(String(quantity));
      setInputError(null);
      return;
    }

    const result = onUpdateQty(productId, Number(trimmed));
    if (!result.success) {
      setInputError(result.error ?? "Jumlah tidak valid");
      setInputVal(String(quantity)); // kembalikan ke nilai lama
    } else {
      setInputError(null);
    }
  };

  const handleDecrease = () => {
    const result = onUpdateQty(productId, quantity - 1);
    if (!result.success) setInputError(result.error ?? "Error");
    else setInputError(null);
  };

  const handleIncrease = () => {
    const result = onUpdateQty(productId, quantity + 1);
    if (!result.success) setInputError(result.error ?? "Error");
    else setInputError(null);
  };

  return (
    <div
      data-testid="cart-item"
      data-product-id={productId}
      className="bg-white rounded-2xl border border-warm-200 p-4 flex gap-4"
    >
      {/* Gambar produk */}
      <Link href={`/products/${slug}`} className="relative w-20 h-20 rounded-xl overflow-hidden bg-warm-100 shrink-0 block">
        {!imgErr ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            onError={() => setImgErr(true)}
            sizes="80px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
            <span className="text-xl">✨</span>
          </div>
        )}
      </Link>

      {/* Informasi produk */}
      <div className="flex-1 min-w-0 space-y-1">
        <Link
          href={`/products/${slug}`}
          data-testid="cart-item-name"
          className="text-sm font-medium text-warm-900 hover:text-brand-600 line-clamp-2 leading-snug transition-colors"
        >
          {name}
        </Link>
        <p className="text-xs text-warm-400">{categoryName}</p>
        <p
          data-testid="cart-item-price"
          className="text-sm font-semibold text-warm-900"
        >
          {formatCurrency(price)}
        </p>

        {/* Info stok */}
        <p className="text-[10px] text-warm-400">
          Tersedia: {stock} unit · Maks. {maxAllowed} unit per produk
        </p>

        {/* Pesan error validasi */}
        {inputError && (
          <div
            data-testid="cart-qty-error"
            className="flex items-start gap-1.5 bg-red-50 text-red-600 text-xs px-2.5 py-1.5 rounded-lg"
          >
            <AlertCircle size={12} className="mt-0.5 shrink-0" />
            {inputError}
          </div>
        )}

        {/* Kontrol kuantitas + total + hapus */}
        <div className="flex items-center justify-between pt-1">

          {/* Input quantity */}
          <div
            className={cn(
              "flex items-center border rounded-lg overflow-hidden transition-colors",
              inputError ? "border-red-400" : "border-warm-300"
            )}
          >
            {/* Tombol kurangi */}
            <button
              data-testid="btn-qty-decrease"
              onClick={handleDecrease}
              disabled={quantity <= 1}
              aria-label="Kurangi jumlah"
              className="w-8 h-8 flex items-center justify-center hover:bg-warm-100 disabled:opacity-40 transition-colors"
            >
              <Minus size={12} />
            </button>

            {/* Input langsung */}
            <input
              ref={inputRef}
              data-testid="cart-qty-input"
              type="number"
              min={1}
              max={maxAllowed}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onBlur={(e)  => applyQty(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
              }}
              className="w-10 h-8 text-center text-xs font-semibold bg-transparent border-x border-warm-200 focus:outline-none focus:bg-warm-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />

            {/* Tombol tambah */}
            <button
              data-testid="btn-qty-increase"
              onClick={handleIncrease}
              disabled={quantity >= maxAllowed}
              aria-label="Tambah jumlah"
              className="w-8 h-8 flex items-center justify-center hover:bg-warm-100 disabled:opacity-40 transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Subtotal + Hapus */}
          <div className="flex items-center gap-3">
            <span
              data-testid="cart-item-subtotal"
              className="text-sm font-semibold text-brand-600"
            >
              {formatCurrency(price * quantity)}
            </span>
            <button
              data-testid="btn-remove-item"
              onClick={() => onRemove(productId)}
              aria-label={`Hapus ${name} dari keranjang`}
              className="p-1.5 rounded-lg hover:bg-red-50 text-warm-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Halaman Cart ─────────────────────────────────────────────
export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalItems, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const router              = useRouter();

  const handleUpdateQty = (productId: string, newQty: number) => {
    return updateQuantity(productId, newQty);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push(getLoginUrl("/checkout"));
      return;
    }
    router.push("/checkout");
  };

  // ── Keranjang kosong ─────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div
        data-testid="cart-empty"
        className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4"
      >
        <div className="w-24 h-24 rounded-full bg-brand-100 flex items-center justify-center">
          <ShoppingBag size={36} className="text-brand-400" />
        </div>
        <div className="text-center">
          <p className="font-heading text-xl font-semibold text-warm-900">
            Keranjang Masih Kosong
          </p>
          <p className="text-sm text-warm-500 mt-1">
            Tambahkan produk skincare favorit Anda
          </p>
        </div>
        <Link href="/products">
          <Button size="lg" className="gap-2" data-testid="btn-start-shopping">
            Mulai Belanja <ArrowRight size={15} />
          </Button>
        </Link>
      </div>
    );
  }

  // ── Keranjang berisi produk ───────────────────────────────────
  return (
    <div data-testid="cart-page" className="min-h-screen bg-warm-50">

      {/* Header */}
      <div className="bg-white border-b border-warm-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-semibold text-warm-900">
                Keranjang Belanja
              </h1>
              <p
                data-testid="cart-items-count"
                className="text-sm text-warm-500 mt-1"
              >
                {totalItems} produk dipilih
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                data-testid="btn-clear-cart"
                className="text-xs text-warm-400 hover:text-red-500 transition-colors"
              >
                Hapus Semua
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Daftar Item ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(({ product, quantity }) => (
              <CartItemRow
                key={product.id}
                productId={product.id}
                name={product.name}
                slug={product.slug}
                categoryName={product.categoryName}
                price={product.price}
                stock={product.stock}
                imageUrl={product.imageUrl}
                quantity={quantity}
                onUpdateQty={handleUpdateQty}
                onRemove={removeItem}
              />
            ))}
          </div>

          {/* ── Ringkasan Belanja ─────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-warm-200 p-5 sticky top-24 space-y-4">
              <h2 className="font-semibold text-warm-900">Ringkasan Belanja</h2>

              {/* Daftar produk singkat */}
              <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
                {items.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex justify-between text-warm-600"
                  >
                    <span className="line-clamp-1 max-w-[65%] text-xs">
                      {product.name} ×{quantity}
                    </span>
                    <span className="shrink-0 text-xs">
                      {formatCurrency(product.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total harga */}
              <div className="border-t border-warm-200 pt-3 flex justify-between font-semibold text-warm-900">
                <span>Total</span>
                <span
                  data-testid="cart-total-price"
                >
                  {formatCurrency(totalPrice)}
                </span>
              </div>

              {/* Info business rules */}
              <div className="bg-warm-50 rounded-xl p-3 text-xs text-warm-500 space-y-1">
                <p>• Maks. 10 unit per produk (BR-06)</p>
                <p>• Tidak melebihi stok tersedia (BR-07)</p>
                <p>• Harus berupa bilangan bulat positif (BR-08)</p>
              </div>

              {/* Tombol checkout */}
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={handleCheckout}
                data-testid="btn-checkout"
              >
                Lanjut ke Checkout <ArrowRight size={15} />
              </Button>

              {/* Info login jika belum masuk */}
              {!isAuthenticated && (
                <p className="text-xs text-center text-warm-500">
                  Anda perlu{" "}
                  <Link
                    href={getLoginUrl("/checkout")}
                    className="text-brand-600 hover:underline"
                  >
                    masuk
                  </Link>{" "}
                  untuk checkout
                </p>
              )}

              <Link
                href="/products"
                className="block text-center text-xs text-warm-500 hover:text-brand-600 transition-colors"
              >
                ← Lanjut Belanja
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
