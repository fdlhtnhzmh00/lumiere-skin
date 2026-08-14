/**
 * app/api/orders/[id]/status/route.ts
 * PATCH /api/orders/:id/status  - Ubah status pesanan
 *
 * Memerlukan autentikasi JWT.
 * Validasi aturan transisi status (State Transition Testing):
 *   DRAFT     -> CONFIRMED  (valid)
 *   DRAFT     -> CANCELLED  (valid)
 *   CONFIRMED -> COMPLETED  (valid)
 *   CONFIRMED -> CANCELLED  (valid)
 *   COMPLETED -> *          (tidak valid)
 *   CANCELLED -> *          (tidak valid)
 *
 * Implementasi lengkap: Phase 12 (Order Status & Business Rule Validation)
 */

import { NextRequest } from "next/server";
import { badRequest } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  // TODO: Phase 12 - ubah status pesanan dengan validasi transisi
  void request;
  void params;
  return badRequest("Endpoint belum diimplementasikan");
}
