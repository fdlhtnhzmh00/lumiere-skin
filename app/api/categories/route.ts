/**
 * app/api/categories/route.ts
 * GET /api/categories  - Ambil semua kategori produk
 *
 * Endpoint bonus untuk mendukung filter kategori di UI.
 * Implementasi lengkap: Phase 6 (Backend Implementation)
 */

import { NextRequest } from "next/server";
import { badRequest } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  // TODO: Phase 6 - ambil semua kategori
  void request;
  return badRequest("Endpoint belum diimplementasikan");
}
