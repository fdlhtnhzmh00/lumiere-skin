/**
 * app/api/products/route.ts
 * GET  /api/products  - Ambil semua produk (dengan filter opsional)
 * POST /api/products  - Buat produk baru (memerlukan autentikasi)
 *
 * Implementasi lengkap: Phase 6 (Backend Implementation)
 */

import { NextRequest } from "next/server";
import { badRequest } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  // TODO: Phase 6 - ambil semua produk dengan filter
  void request;
  return badRequest("Endpoint belum diimplementasikan");
}

export async function POST(request: NextRequest) {
  // TODO: Phase 6 - buat produk baru
  void request;
  return badRequest("Endpoint belum diimplementasikan");
}
