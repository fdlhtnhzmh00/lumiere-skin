/**
 * app/products/page.tsx
 * Server Component wrapper — memanggil client component dalam Suspense.
 */
import React, { Suspense } from "react";
import { ProductsClient } from "./ProductsClient";

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-brand-300 border-t-brand-600 animate-spin mx-auto" />
          <p className="text-sm text-warm-500">Memuat produk...</p>
        </div>
      </div>
    }>
      <ProductsClient />
    </Suspense>
  );
}
