"use client";

/**
 * app/providers.tsx
 * Wrapper client-component untuk semua Context Providers.
 * Dipasang di root layout agar tersedia di seluruh aplikasi.
 */

import { AuthProvider } from "@/lib/context/AuthContext";
import { CartProvider } from "@/lib/context/CartContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}
