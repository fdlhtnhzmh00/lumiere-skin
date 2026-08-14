/**
 * app/api/products/[id]/route.ts
 * GET    /api/products/:id  - Ambil detail produk berdasarkan ID
 * PATCH  /api/products/:id  - Perbarui data produk (memerlukan autentikasi)
 * DELETE /api/products/:id  - Hapus produk / soft delete (memerlukan autentikasi)
 *
 * Implementasi lengkap: Phase 6 (Backend Implementation)
 */

import { NextRequest } from "next/server";
import { badRequest } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  // TODO: Phase 6 - ambil detail produk berdasarkan ID
  void request;
  void params;
  return badRequest("Endpoint belum diimplementasikan");
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  // TODO: Phase 6 - perbarui data produk
  void request;
  void params;
  return badRequest("Endpoint belum diimplementasikan");
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // TODO: Phase 6 - hapus produk (soft delete)
  void request;
  void params;
  return badRequest("Endpoint belum diimplementasikan");
}
