/**
 * app/api/orders/route.ts
 * POST /api/orders  - Buat pesanan baru dari keranjang belanja
 *
 * Memerlukan autentikasi JWT.
 * Validasi: stok, quantity, field wajib (recipientName, shippingAddress, phoneNumber)
 * Implementasi lengkap: Phase 11 (Checkout & Order Management)
 */

import { NextRequest } from "next/server";
import { badRequest } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  // TODO: Phase 11 - buat pesanan baru
  void request;
  return badRequest("Endpoint belum diimplementasikan");
}
