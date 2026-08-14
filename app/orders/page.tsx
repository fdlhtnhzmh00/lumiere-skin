"use client";

/**
 * app/orders/page.tsx
 * Daftar pesanan milik pengguna yang sedang login.
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { formatCurrency, getLoginUrl } from "@/lib/utils";
import {
  ShoppingBag,
  ChevronRight,
  RefreshCw,
  PackageSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// â”€â”€â”€ Konfigurasi label dan warna status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STATUS_CONFIG = {
  DRAFT:     { label: "Menunggu",       variant: "default"  as const, emoji: "ðŸ•" },
  CONFIRMED: { label: "Dikonfirmasi",   variant: "gold"     as const, emoji: "âœ…" },
  COMPLETED: { label: "Selesai",        variant: "success"  as const, emoji: "ðŸŽ‰" },
  CANCELLED: { label: "Dibatalkan",     variant: "danger"   as const, emoji: "âŒ" },
};

interface Order {
  id: string;
  orderNumber: string;
  status: keyof typeof STATUS_CONFIG;
  totalPrice: number;
  createdAt: string;
  items: Array<{ product: { name: string; imageUrl: string } }>;
}

export default function OrdersPage() {
  const { isAuthenticated, token, isLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders]     = useState<Order[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [refreshing, setRefreshing]   = useState(false);

  const fetchOrders = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const res  = await fetch("/api/orders/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setOrders(json.data?.orders ?? []);
    } catch {
      // Biarkan orders tetap state sebelumnya
    } finally {
      setPageLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(getLoginUrl("/orders"));
      return;
    }
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading, token]);

  // â”€â”€ Loading skeleton â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (isLoading || pageLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div
      data-testid="orders-page"
      className="min-h-screen bg-stone-50"
    >
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-semibold text-stone-900">
                Pesanan Saya
              </h1>
              <p className="text-sm text-stone-500 mt-1">
                {orders.length} pesanan
              </p>
            </div>
            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-sage-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                size={13}
                className={refreshing ? "animate-spin" : ""}
              />
              Perbarui
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* â”€â”€ Kosong â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {orders.length === 0 ? (
          <div
            data-testid="orders-empty"
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
              <PackageSearch size={32} className="text-sage-500" />
            </div>
            <p className="font-heading text-lg font-semibold text-warm-800 mb-1">
              Belum ada pesanan
            </p>
            <p className="text-sm text-stone-500 mb-6">
              Mulai belanja dan buat pesanan pertama Anda
            </p>
            <Link href="/products">
              <Button>Mulai Belanja</Button>
            </Link>
          </div>
        ) : (
          /* â”€â”€ Daftar Pesanan â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
          <div className="space-y-3">
            {orders.map((order) => {
              const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.DRAFT;
              const productNames = order.items
                .map((i) => i.product.name)
                .join(", ");

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  data-testid="order-item"
                  data-order-id={order.id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 flex items-center justify-between hover:border-sage-300 hover:shadow-sm transition-all group block"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    {/* Nomor + Status */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm">{cfg.emoji}</span>
                      <p
                        data-testid="order-number"
                        className="font-semibold text-sm text-stone-900"
                      >
                        {order.orderNumber}
                      </p>
                      <Badge variant={cfg.variant} data-testid="order-status">
                        {cfg.label}
                      </Badge>
                    </div>

                    {/* Tanggal */}
                    <p className="text-xs text-stone-500">
                      {new Date(order.createdAt).toLocaleDateString("id-ID", {
                        day:   "numeric",
                        month: "long",
                        year:  "numeric",
                        hour:  "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    {/* Nama produk */}
                    <p className="text-xs text-stone-400 line-clamp-1 max-w-[280px]">
                      {productNames}
                    </p>
                  </div>

                  {/* Total + Chevron */}
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <p
                      data-testid="order-total"
                      className="font-semibold text-sm text-stone-900"
                    >
                      {formatCurrency(order.totalPrice)}
                    </p>
                    <ChevronRight
                      size={16}
                      className="text-stone-400 group-hover:text-sage-600 transition-colors"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Tombol belanja lagi */}
        {orders.length > 0 && (
          <div className="mt-6 text-center">
            <Link
              href="/products"
              className="text-sm text-sage-600 hover:underline"
            >
              + Buat pesanan baru
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

