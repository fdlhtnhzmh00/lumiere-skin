"use client";

/**
 * app/orders/[id]/page.tsx — Detail pesanan
 */

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getLoginUrl } from "@/lib/utils";
import { Package, MapPin, Phone, User, ArrowLeft, RefreshCw } from "lucide-react";

const STATUS_CONFIG = {
  DRAFT:     { label: "Menunggu Konfirmasi", variant: "default" as const, next: "CONFIRMED" as const, nextLabel: "Konfirmasi Pesanan" },
  CONFIRMED: { label: "Dikonfirmasi",        variant: "gold"    as const, next: "COMPLETED" as const, nextLabel: "Tandai Selesai" },
  COMPLETED: { label: "Selesai",             variant: "success" as const, next: null, nextLabel: null },
  CANCELLED: { label: "Dibatalkan",          variant: "danger"  as const, next: null, nextLabel: null },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, token, isLoading } = useAuth();

  const [order, setOrder]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError]   = useState("");

  const fetchOrder = async () => {
    const res = await fetch(`/api/orders/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (res.ok) setOrder(json.data.order);
    else setError(json.message ?? "Gagal memuat pesanan");
    setLoading(false);
  };

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(getLoginUrl(`/orders/${params.id}`));
      return;
    }
    fetchOrder();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading, token]);

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    const res = await fetch(`/api/orders/${params.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    });
    const json = await res.json();
    if (res.ok) { setOrder((o: any) => ({ ...o, status: newStatus })); }
    else setError(json.message ?? "Gagal mengubah status");
    setUpdating(false);
  };

  const handleCancel = () => handleStatusUpdate("CANCELLED");

  if (isLoading || loading) {
    return <div className="max-w-3xl mx-auto px-4 py-12"><div className="skeleton h-96 rounded-2xl" /></div>;
  }

  if (error && !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-warm-600">{error}</p>
        <Link href="/orders" className="mt-4 inline-block text-sm text-brand-600 hover:underline">← Kembali ke Pesanan</Link>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[order?.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.DRAFT;

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="bg-white border-b border-warm-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center gap-3">
          <Link href="/orders" className="p-1.5 rounded-lg hover:bg-warm-100 transition-colors">
            <ArrowLeft size={18} className="text-warm-600" />
          </Link>
          <div>
            <h1 className="font-heading text-xl font-semibold text-warm-900">{order?.orderNumber}</h1>
            <p className="text-xs text-warm-500">
              {order?.createdAt && new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <Badge variant={cfg.variant} className="ml-auto">{cfg.label}</Badge>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* Produk */}
        <div className="bg-white rounded-2xl border border-warm-200 p-5">
          <h2 className="font-semibold text-warm-900 mb-4 flex items-center gap-2">
            <Package size={16} className="text-brand-500" /> Produk Dipesan
          </h2>
          <div className="space-y-3">
            {order?.items?.map((item: any) => (
              <div key={item.id} className="flex gap-3 items-center">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-warm-100 shrink-0">
                  <Image src={item.product.imageUrl} alt={item.product.name} fill className="object-cover" sizes="56px" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.slug}`} className="text-sm font-medium text-warm-900 hover:text-brand-600 line-clamp-1">
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-warm-500">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                </div>
                <p className="text-sm font-semibold text-warm-900 shrink-0">{formatCurrency(item.subtotal)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-warm-200 mt-4 pt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-brand-600">{formatCurrency(order?.totalPrice)}</span>
          </div>
        </div>

        {/* Pengiriman */}
        <div className="bg-white rounded-2xl border border-warm-200 p-5">
          <h2 className="font-semibold text-warm-900 mb-4">Informasi Pengiriman</h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex gap-2.5 text-warm-700"><User size={14} className="shrink-0 mt-0.5 text-brand-400" />{order?.recipientName}</div>
            <div className="flex gap-2.5 text-warm-700"><MapPin size={14} className="shrink-0 mt-0.5 text-brand-400" />{order?.shippingAddress}</div>
            <div className="flex gap-2.5 text-warm-700"><Phone size={14} className="shrink-0 mt-0.5 text-brand-400" />{order?.phoneNumber}</div>
            {order?.notes && <p className="text-xs text-warm-500 italic">Catatan: {order.notes}</p>}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {cfg.next && (
            <Button onClick={() => handleStatusUpdate(cfg.next!)} loading={updating} className="flex-1 gap-2">
              <RefreshCw size={14} /> {cfg.nextLabel}
            </Button>
          )}
          {(order?.status === "DRAFT" || order?.status === "CONFIRMED") && (
            <Button variant="danger" onClick={handleCancel} loading={updating} className={cfg.next ? "w-auto" : "flex-1"}>
              Batalkan Pesanan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
