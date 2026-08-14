"use client";

/**
 * app/orders/page.tsx — Daftar pesanan pengguna
 */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { formatCurrency, cn, getLoginUrl } from "@/lib/utils";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG = {
  DRAFT:     { label: "Draft",      variant: "default"  as const },
  CONFIRMED: { label: "Dikonfirmasi", variant: "gold"   as const },
  COMPLETED: { label: "Selesai",    variant: "success"  as const },
  CANCELLED: { label: "Dibatalkan", variant: "danger"   as const },
};

export default function OrdersPage() {
  const { isAuthenticated, token, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Array<{
    id: string; orderNumber: string; status: keyof typeof STATUS_CONFIG;
    totalPrice: number; createdAt: string; items: Array<{ product: { name: string } }>;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(getLoginUrl("/orders"));
      return;
    }
    fetch("/api/orders/list", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((j) => { setOrders(j.data?.orders ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isAuthenticated, isLoading, token, router]);

  if (isLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-3">
        {[1,2,3].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="bg-white border-b border-warm-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="font-heading text-2xl font-semibold text-warm-900">Pesanan Saya</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-3">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag size={40} className="mx-auto text-brand-300 mb-3" />
            <p className="font-medium text-warm-800">Belum ada pesanan</p>
            <Link href="/products" className="mt-4 inline-block">
              <Button>Mulai Belanja</Button>
            </Link>
          </div>
        ) : (
          orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.DRAFT;
            return (
              <Link key={order.id} href={`/orders/${order.id}`}
                className="bg-white rounded-2xl border border-warm-200 p-5 flex items-center justify-between hover:border-brand-300 hover:shadow-sm transition-all group block">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-warm-900">{order.orderNumber}</p>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </div>
                  <p className="text-xs text-warm-500">
                    {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <p className="text-xs text-warm-400 line-clamp-1">
                    {order.items.map((i) => i.product.name).join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className="font-semibold text-sm text-warm-900">{formatCurrency(order.totalPrice)}</p>
                  <ChevronRight size={16} className="text-warm-400 group-hover:text-brand-500 transition-colors" />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
