"use client";

/**
 * app/checkout/page.tsx
 * Halaman Checkout LUMIÈRE SKIN
 *
 * Business Rules yang divalidasi:
 * BR-09: Pengguna harus sudah login
 * BR-10: Keranjang tidak boleh kosong
 * BR-11: Nama penerima wajib diisi
 * BR-12: Alamat pengiriman wajib diisi
 * BR-13: Nomor telepon wajib diisi dengan format valid
 * BR-14: Pesanan baru selalu berstatus DRAFT
 */

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  CheckCircle,
  MapPin,
  Phone,
  User,
  StickyNote,
  AlertCircle,
  ArrowRight,
  Lock,
} from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency, getLoginUrl } from "@/lib/utils";

// ─── Tipe form ────────────────────────────────────────────────
interface CheckoutForm {
  recipientName:   string;
  shippingAddress: string;
  phoneNumber:     string;
  notes:           string;
}

type FormErrors = Partial<Record<keyof CheckoutForm, string>>;

// ─── Validasi form sisi klien ─────────────────────────────────
function validateForm(form: CheckoutForm): FormErrors {
  const errors: FormErrors = {};

  if (!form.recipientName.trim()) {
    errors.recipientName = "Nama penerima wajib diisi (BR-11)";
  }
  if (!form.shippingAddress.trim()) {
    errors.shippingAddress = "Alamat pengiriman wajib diisi (BR-12)";
  }
  if (!form.phoneNumber.trim()) {
    errors.phoneNumber = "Nomor telepon wajib diisi (BR-13)";
  } else if (!/^[0-9+\-\s()]{8,15}$/.test(form.phoneNumber.trim())) {
    errors.phoneNumber = "Format nomor telepon tidak valid (8-15 digit)";
  }

  return errors;
}

// ─── Halaman Checkout ─────────────────────────────────────────
export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { isAuthenticated, token }       = useAuth();
  const router                           = useRouter();

  const [form, setForm]         = useState<CheckoutForm>({
    recipientName:   "",
    shippingAddress: "",
    phoneNumber:     "",
    notes:           "",
  });
  const [errors, setErrors]     = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // ── Guard: belum login (BR-09) ────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4">
        <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center">
          <Lock size={30} className="text-brand-400" />
        </div>
        <div className="text-center">
          <p className="font-heading text-xl font-semibold text-warm-900">
            Login Diperlukan
          </p>
          <p className="text-sm text-warm-500 mt-1">
            Anda perlu login untuk melanjutkan checkout (BR-09)
          </p>
        </div>
        <Link href={getLoginUrl("/checkout")}>
          <Button size="lg" className="gap-2">
            Masuk Sekarang <ArrowRight size={15} />
          </Button>
        </Link>
      </div>
    );
  }

  // ── Guard: keranjang kosong (BR-10) ──────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4">
        <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center">
          <ShoppingBag size={30} className="text-brand-400" />
        </div>
        <div className="text-center">
          <p className="font-heading text-xl font-semibold text-warm-900">
            Keranjang Kosong
          </p>
          <p className="text-sm text-warm-500 mt-1">
            Tambahkan produk terlebih dahulu sebelum checkout (BR-10)
          </p>
        </div>
        <Link href="/products">
          <Button size="lg">Jelajahi Produk</Button>
        </Link>
      </div>
    );
  }

  // ── Handler perubahan form ────────────────────────────────────
  const handleChange = (field: keyof CheckoutForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    // Hapus error field yang sedang diubah
    if (errors[field]) {
      setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
    }
  };

  // ── Submit checkout ───────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    // Validasi sisi klien
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientName:   form.recipientName.trim(),
          shippingAddress: form.shippingAddress.trim(),
          phoneNumber:     form.phoneNumber.trim(),
          notes:           form.notes.trim() || undefined,
          items:           items.map((i) => ({
            productId: i.product.id,
            quantity:  i.quantity,
          })),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setApiError(json.message ?? "Checkout gagal. Coba lagi.");
        return;
      }

      // Berhasil: bersihkan keranjang dan arahkan ke detail pesanan
      clearCart();
      router.push(`/orders/${json.data.order.id}?new=1`);
    } catch {
      setApiError("Terjadi kesalahan koneksi. Periksa internet Anda dan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-50" data-testid="checkout-page">

      {/* Header */}
      <div className="bg-white border-b border-warm-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="font-heading text-2xl font-semibold text-warm-900">
            Checkout
          </h1>
          <p className="text-sm text-warm-500 mt-1">
            Langkah terakhir sebelum pesanan Anda diproses
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Form Pengiriman ───────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-warm-200 p-6">
              <h2 className="font-semibold text-warm-900 mb-5 flex items-center gap-2">
                <MapPin size={16} className="text-brand-500" />
                Informasi Pengiriman
              </h2>

              {/* Error dari API */}
              {apiError && (
                <div
                  data-testid="checkout-error"
                  className="mb-5 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl"
                >
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  {apiError}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                noValidate
                className="space-y-4"
                data-testid="checkout-form"
              >
                {/* Nama Penerima */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="recipientName"
                    className="block text-sm font-medium text-warm-700"
                  >
                    <span className="flex items-center gap-1.5">
                      <User size={13} className="text-brand-400" />
                      Nama Penerima
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    id="recipientName"
                    type="text"
                    data-testid="input-recipient-name"
                    placeholder="Nama lengkap penerima paket"
                    value={form.recipientName}
                    onChange={(e) => handleChange("recipientName", e.target.value)}
                    autoComplete="name"
                    className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl transition-colors placeholder:text-warm-400 text-warm-900 focus:outline-none focus:ring-2 ${
                      errors.recipientName
                        ? "border-red-400 focus:ring-red-200"
                        : "border-warm-300 hover:border-warm-400 focus:ring-brand-300 focus:border-brand-400"
                    }`}
                  />
                  {errors.recipientName && (
                    <p className="text-xs text-red-600">{errors.recipientName}</p>
                  )}
                </div>

                {/* Alamat Pengiriman */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="shippingAddress"
                    className="block text-sm font-medium text-warm-700"
                  >
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-brand-400" />
                      Alamat Pengiriman
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <textarea
                    id="shippingAddress"
                    data-testid="input-shipping-address"
                    placeholder="Jl. Nama Jalan No. XX, Kelurahan, Kecamatan, Kota, Kode Pos"
                    value={form.shippingAddress}
                    onChange={(e) => handleChange("shippingAddress", e.target.value)}
                    rows={3}
                    autoComplete="street-address"
                    className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl resize-none transition-colors placeholder:text-warm-400 text-warm-900 focus:outline-none focus:ring-2 ${
                      errors.shippingAddress
                        ? "border-red-400 focus:ring-red-200"
                        : "border-warm-300 hover:border-warm-400 focus:ring-brand-300 focus:border-brand-400"
                    }`}
                  />
                  {errors.shippingAddress && (
                    <p className="text-xs text-red-600">{errors.shippingAddress}</p>
                  )}
                </div>

                {/* Nomor Telepon */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-warm-700"
                  >
                    <span className="flex items-center gap-1.5">
                      <Phone size={13} className="text-brand-400" />
                      Nomor Telepon
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    data-testid="input-phone"
                    placeholder="08xxxxxxxxxx"
                    value={form.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    autoComplete="tel"
                    className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl transition-colors placeholder:text-warm-400 text-warm-900 focus:outline-none focus:ring-2 ${
                      errors.phoneNumber
                        ? "border-red-400 focus:ring-red-200"
                        : "border-warm-300 hover:border-warm-400 focus:ring-brand-300 focus:border-brand-400"
                    }`}
                  />
                  {errors.phoneNumber && (
                    <p className="text-xs text-red-600">{errors.phoneNumber}</p>
                  )}
                </div>

                {/* Catatan (opsional) */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-warm-700"
                  >
                    <span className="flex items-center gap-1.5">
                      <StickyNote size={13} className="text-brand-400" />
                      Catatan untuk Kurir
                      <span className="text-xs text-warm-400 font-normal">(opsional)</span>
                    </span>
                  </label>
                  <textarea
                    id="notes"
                    data-testid="input-notes"
                    placeholder="Contoh: Harap ditaruh di depan pintu, jangan dilempar"
                    value={form.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-warm-300 hover:border-warm-400 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 placeholder:text-warm-400 text-warm-900"
                  />
                </div>

                {/* Tombol Buat Pesanan */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2 mt-2"
                  loading={loading}
                  data-testid="btn-submit-order"
                >
                  <CheckCircle size={16} />
                  {loading ? "Memproses Pesanan..." : "Buat Pesanan"}
                </Button>
              </form>
            </div>

            {/* Info keamanan */}
            <div className="flex items-center gap-2.5 text-xs text-warm-500 px-1">
              <Lock size={12} className="text-brand-400 shrink-0" />
              <span>
                Pembayaran dan data Anda terlindungi. Pesanan dibuat dengan status{" "}
                <strong>DRAFT</strong> dan dapat dikonfirmasi atau dibatalkan.
              </span>
            </div>
          </div>

          {/* ── Ringkasan Pesanan ─────────────────────────────── */}
          <div className="lg:col-span-1">
            <div
              data-testid="order-summary"
              className="bg-white rounded-2xl border border-warm-200 p-5 sticky top-24 space-y-4"
            >
              <h2 className="font-semibold text-warm-900 flex items-center gap-2">
                <ShoppingBag size={15} className="text-brand-500" />
                Ringkasan Pesanan
              </h2>

              {/* Daftar item */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-2.5">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-warm-100 shrink-0">
                      {!imgErrors[product.id] ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                          onError={() =>
                            setImgErrors((e) => ({ ...e, [product.id]: true }))
                          }
                          sizes="40px"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-sm">
                          ✨
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-warm-800 line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-xs text-warm-400">
                        {quantity} × {formatCurrency(product.price)}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-warm-800 shrink-0">
                      {formatCurrency(product.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-warm-200 pt-3 space-y-2">
                <div className="flex justify-between text-xs text-warm-500">
                  <span>{items.length} produk ({items.reduce((s, i) => s + i.quantity, 0)} unit)</span>
                </div>
                <div
                  data-testid="checkout-total"
                  className="flex justify-between font-semibold text-warm-900"
                >
                  <span>Total</span>
                  <span className="text-brand-600">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              <Link
                href="/cart"
                className="block text-center text-xs text-warm-400 hover:text-brand-600 transition-colors"
              >
                ← Ubah keranjang
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
