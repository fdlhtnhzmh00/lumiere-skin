"use client";

/**
 * app/orders/[id]/page.tsx
 * Halaman detail pesanan dengan manajemen status.
 *
 * Mendukung query param ?new=1 untuk menampilkan notifikasi sukses.
 *
 * State Transition Rules (BR-15 s/d BR-20):
 * DRAFT     → CONFIRMED  ✓
 * DRAFT     → CANCELLED  ✓
 * CONFIRMED → COMPLETED  ✓
 * CONFIRMED → CANCELLED  ✓
 * COMPLETED → *          ✗ (tidak bisa diubah)
 * CANCELLED → *          ✗ (tidak bisa diaktifkan kembali)
 */

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  User,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShoppingBag,
  StickyNote,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getLoginUrl } from "@/lib/utils";
import { Suspense } from "react";

// ─── Konfigurasi status ───────────────────────────────────────
const STATUS_CONFIG = {
  DRAFT: {
    label:     "Menunggu Konfirmasi",
    variant:   "default" as const,
    color:     "text-warm-600",
    bg:        "bg-warm-100",
    icon:      RefreshCw,
    nextLabel: "Konfirmasi Pesanan",
    nextStatus: "CONFIRMED" as const,
  },
  CONFIRMED: {
    label:     "Dikonfirmasi",
    variant:   "gold" as const,
    color:     "text-amber-700",
    bg:        "bg-amber-50",
    icon:      CheckCircle,
    nextLabel: "Tandai Selesai",
    nextStatus: "COMPLETED" as const,
  },
  COMPLETED: {
    label:     "Selesai",
    variant:   "success" as const,
    color:     "text-green-700",
    bg:        "bg-green-50",
    icon:      CheckCircle,
    nextLabel: null,
    nextStatus: null,
  },
  CANCELLED: {
    label:     "Dibatalkan",
    variant:   "danger" as const,
    color:     "text-red-700",
    bg:        "bg-red-50",
    icon:      XCircle,
    nextLabel: null,
    nextStatus: null,
  },
};

type OrderStatus = keyof typeof STATUS_CONFIG;

interface OrderItem {
  id:        string;
  quantity:  number;
  unitPrice: number;
  subtotal:  number;
  product:   { id: string; name: string; imageUrl: string; slug: string };
}

interface Order {
  id:              string;
  orderNumber:     string;
  status:          OrderStatus;
  totalPrice:      number;
  recipientName:   string;
  shippingAddress: string;
  phoneNumber:     string;
  notes:           string | null;
  createdAt:       string;
  updatedAt:       string;
  user:            { id: string; name: string; email: string };
  items:           OrderItem[];
}

// ─── Komponen dalam ───────────────────────────────────────────
function OrderDetailContent() {
  const params       = useParams();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const isNew        = searchParams.get("new") === "1";

  const { isAuthenticated, token, isLoading } = useAuth();

  const [order, setOrder]     = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError]     = useState("");
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const orderId = params.id as string;

  // Fetch order
  const fetchOrder = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res  = await fetch(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setOrder(json.data.order);
        setError("");
      } else {
        setError(json.message ?? "Gagal memuat pesanan");
      }
    } catch {
      setError("Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(getLoginUrl(`/orders/${orderId}`));
      return;
    }
    fetchOrder();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading, token, orderId]);

  // Update status
  const handleStatusUpdate = async (newStatus: string) => {
    if (!token || !order) return;
    setUpdating(true);
    setError("");
    try {
      const res  = await fetch(`/api/orders/${orderId}/status`, {
        method:  "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (res.ok) {
        setOrder((o) => o ? { ...o, status: newStatus as OrderStatus } : null);
      } else {
        setError(json.message ?? "Gagal mengubah status pesanan");
      }
    } catch {
      setError("Gagal menghubungi server");
    } finally {
      setUpdating(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────
  if (isLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        <div className="skeleton h-16 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-32 rounded-2xl" />
      </div>
    );
  }

  // ── Error tanpa data ─────────────────────────────────────────
  if (error && !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">😕</p>
        <p className="font-semibold text-warm-800 mb-2">Pesanan tidak ditemukan</p>
        <p className="text-sm text-warm-500 mb-6">{error}</p>
        <Link href="/orders" className="text-sm text-brand-600 hover:underline">
          ← Kembali ke Daftar Pesanan
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const cfg       = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.DRAFT;
  const StatusIcon = cfg.icon;
  const canCancel = order.status === "DRAFT" || order.status === "CONFIRMED";

  return (
    <div
      data-testid="order-detail"
      className="min-h-screen bg-warm-50"
    >
      {/* Header */}
      <div className="bg-white border-b border-warm-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="p-1.5 rounded-lg hover:bg-warm-100 transition-colors shrink-0"
            >
              <ArrowLeft size={18} className="text-warm-600" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1
                data-testid="order-number"
                className="font-heading text-xl font-semibold text-warm-900 truncate"
              >
                {order.orderNumber}
              </h1>
              <p className="text-xs text-warm-500">
                {new Date(order.createdAt).toLocaleDateString("id-ID", {
                  day:    "numeric",
                  month:  "long",
                  year:   "numeric",
                  hour:   "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <Badge
              variant={cfg.variant}
              data-testid="order-status-badge"
              className="shrink-0"
            >
              {cfg.label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">

        {/* ── Notifikasi pesanan baru ────────────────────────── */}
        {isNew && (
          <div
            data-testid="order-success-banner"
            className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3.5 rounded-2xl"
          >
            <CheckCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Pesanan Berhasil Dibuat!</p>
              <p className="text-xs mt-0.5">
                Pesanan Anda ({order.orderNumber}) telah dibuat dengan status{" "}
                <strong>DRAFT</strong>. Klik &ldquo;Konfirmasi Pesanan&rdquo; untuk memprosesnya.
              </p>
            </div>
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────── */}
        {error && (
          <div
            data-testid="order-error"
            className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl"
          >
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* ── Status Banner ──────────────────────────────────── */}
        <div className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl ${cfg.bg}`}>
          <StatusIcon size={18} className={cfg.color} />
          <div>
            <p className={`font-semibold text-sm ${cfg.color}`}>
              Status: {cfg.label}
            </p>
            <p className="text-xs text-warm-500 mt-0.5">
              Diperbarui: {new Date(order.updatedAt).toLocaleDateString("id-ID", {
                day: "numeric", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* ── Produk yang Dipesan ────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-warm-200 p-5">
          <h2 className="font-semibold text-warm-900 mb-4 flex items-center gap-2">
            <Package size={15} className="text-brand-500" />
            Produk Dipesan ({order.items.length} item)
          </h2>

          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                data-testid="order-product-item"
                className="flex items-center gap-3"
              >
                {/* Gambar */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-warm-100 shrink-0">
                  {!imgErrors[item.product.id] ? (
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      onError={() =>
                        setImgErrors((e) => ({ ...e, [item.product.id]: true }))
                      }
                      sizes="56px"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-sm">
                      ✨
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="text-sm font-medium text-warm-900 hover:text-brand-600 line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-warm-500">
                    {item.quantity} unit × {formatCurrency(item.unitPrice)}
                  </p>
                </div>

                {/* Subtotal */}
                <p className="text-sm font-semibold text-warm-900 shrink-0">
                  {formatCurrency(item.subtotal)}
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t border-warm-200 mt-4 pt-4 flex justify-between font-semibold">
            <span className="text-warm-900">Total Pesanan</span>
            <span
              data-testid="order-total-price"
              className="text-brand-600"
            >
              {formatCurrency(order.totalPrice)}
            </span>
          </div>
        </div>

        {/* ── Informasi Pengiriman ───────────────────────────── */}
        <div className="bg-white rounded-2xl border border-warm-200 p-5">
          <h2 className="font-semibold text-warm-900 mb-4 flex items-center gap-2">
            <MapPin size={15} className="text-brand-500" />
            Informasi Pengiriman
          </h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-start gap-2.5 text-warm-700">
              <User size={14} className="shrink-0 mt-0.5 text-brand-400" />
              <span data-testid="order-recipient">{order.recipientName}</span>
            </div>
            <div className="flex items-start gap-2.5 text-warm-700">
              <MapPin size={14} className="shrink-0 mt-0.5 text-brand-400" />
              <span>{order.shippingAddress}</span>
            </div>
            <div className="flex items-center gap-2.5 text-warm-700">
              <Phone size={14} className="shrink-0 text-brand-400" />
              <span>{order.phoneNumber}</span>
            </div>
            {order.notes && (
              <div className="flex items-start gap-2.5 text-warm-500">
                <StickyNote size={14} className="shrink-0 mt-0.5 text-brand-400" />
                <span className="italic text-xs">Catatan: {order.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Tombol Aksi Status ─────────────────────────────── */}
        {(cfg.nextStatus || canCancel) && (
          <div className="bg-white rounded-2xl border border-warm-200 p-5">
            <h2 className="font-semibold text-warm-900 mb-3 flex items-center gap-2">
              <RefreshCw size={15} className="text-brand-500" />
              Ubah Status Pesanan
            </h2>
            <p className="text-xs text-warm-500 mb-4">
              Perubahan status mengikuti aturan transisi yang berlaku
              (BR-15 s/d BR-20).
            </p>

            <div className="flex flex-wrap gap-3">
              {/* Tombol Konfirmasi / Selesai */}
              {cfg.nextStatus && (
                <Button
                  onClick={() => handleStatusUpdate(cfg.nextStatus!)}
                  loading={updating}
                  className="gap-2 flex-1 min-w-[140px]"
                  data-testid="btn-next-status"
                  data-target-status={cfg.nextStatus}
                >
                  <RefreshCw size={14} />
                  {cfg.nextLabel}
                </Button>
              )}

              {/* Tombol Batalkan */}
              {canCancel && (
                <Button
                  variant="danger"
                  onClick={() => handleStatusUpdate("CANCELLED")}
                  loading={updating}
                  className={`gap-2 ${cfg.nextStatus ? "w-auto" : "flex-1"}`}
                  data-testid="btn-cancel-order"
                >
                  <XCircle size={14} />
                  Batalkan Pesanan
                </Button>
              )}
            </div>

            {/* Info status final */}
            {!cfg.nextStatus && !canCancel && (
              <div className="flex items-center gap-2 text-xs text-warm-500">
                <AlertCircle size={13} className="text-warm-400" />
                Status pesanan ini sudah final dan tidak dapat diubah.
              </div>
            )}
          </div>
        )}

        {/* ── Link navigasi ──────────────────────────────────── */}
        <div className="flex items-center justify-between pt-2">
          <Link
            href="/orders"
            className="text-sm text-warm-500 hover:text-brand-600 transition-colors"
          >
            ← Semua Pesanan
          </Link>
          <Link
            href="/products"
            className="text-sm text-brand-600 hover:underline"
          >
            Belanja lagi →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Page wrapper dengan Suspense (karena useSearchParams) ────
export default function OrderDetailPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        <div className="skeleton h-16 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    }>
      <OrderDetailContent />
    </Suspense>
  );
}
