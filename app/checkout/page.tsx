"use client";

/**
 * app/checkout/page.tsx
 * Halaman checkout — implementasi lengkap di Phase 11.
 * Saat ini menampilkan form dasar yang terhubung ke API.
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/context/CartContext";
import { useAuth } from "@/lib/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency, getLoginUrl } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ recipientName: "", shippingAddress: "", phoneNumber: "", notes: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
        <ShoppingBag size={40} className="text-brand-300" />
        <p className="font-semibold text-warm-900">Masuk untuk melanjutkan checkout</p>
        <Link href={getLoginUrl("/checkout")}><Button>Masuk Sekarang</Button></Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4">
        <ShoppingBag size={40} className="text-brand-300" />
        <p className="font-semibold text-warm-900">Keranjang Anda kosong</p>
        <Link href="/products"><Button>Belanja Produk</Button></Link>
      </div>
    );
  }

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.recipientName.trim()) e.recipientName = "Nama penerima wajib diisi";
    if (!form.shippingAddress.trim()) e.shippingAddress = "Alamat pengiriman wajib diisi";
    if (!form.phoneNumber.trim()) e.phoneNumber = "Nomor telepon wajib diisi";
    else if (!/^[0-9+\-\s()]{8,15}$/.test(form.phoneNumber.trim())) e.phoneNumber = "Format nomor telepon tidak valid";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          recipientName: form.recipientName.trim(),
          shippingAddress: form.shippingAddress.trim(),
          phoneNumber: form.phoneNumber.trim(),
          notes: form.notes.trim() || undefined,
          items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        }),
      });
      const json = await res.json();
      if (!res.ok) { setApiError(json.message ?? "Checkout gagal"); return; }
      clearCart();
      router.push(`/orders/${json.data.order.id}`);
    } catch { setApiError("Terjadi kesalahan. Coba lagi."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="bg-white border-b border-warm-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="font-heading text-2xl font-semibold text-warm-900">Checkout</h1>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-warm-200 p-6">
              <h2 className="font-semibold text-warm-900 mb-5">Data Pengiriman</h2>
              {apiError && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{apiError}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Nama Penerima" value={form.recipientName} onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))} error={errors.recipientName} placeholder="Nama lengkap penerima" required />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-warm-700">Alamat Pengiriman <span className="text-red-500">*</span></label>
                  <textarea value={form.shippingAddress} onChange={(e) => setForm((f) => ({ ...f, shippingAddress: e.target.value }))} placeholder="Alamat lengkap termasuk kelurahan, kecamatan, kota" rows={3} className="w-full px-3.5 py-2.5 text-sm bg-white border border-warm-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400" />
                  {errors.shippingAddress && <p className="text-xs text-red-600">{errors.shippingAddress}</p>}
                </div>
                <Input label="Nomor Telepon" type="tel" value={form.phoneNumber} onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))} error={errors.phoneNumber} placeholder="08xxxxxxxxxx" required />
                <Input label="Catatan (opsional)" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Instruksi khusus untuk kurir" />
                <Button type="submit" size="lg" className="w-full mt-2" loading={loading}>Buat Pesanan</Button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-warm-200 p-5 sticky top-24 space-y-3">
              <h2 className="font-semibold text-warm-900">Ringkasan</h2>
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-xs text-warm-600">
                  <span className="line-clamp-1 max-w-[70%]">{product.name} ×{quantity}</span>
                  <span>{formatCurrency(product.price * quantity)}</span>
                </div>
              ))}
              <div className="border-t border-warm-200 pt-3 flex justify-between font-semibold text-warm-900 text-sm">
                <span>Total</span><span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
