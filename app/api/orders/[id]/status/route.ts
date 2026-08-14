/**
 * app/api/orders/[id]/status/route.ts
 * PATCH /api/orders/:id/status
 *
 * Mengubah status pesanan sesuai aturan transisi yang berlaku.
 * Memerlukan autentikasi JWT.
 *
 * Aturan Transisi Status (State Transition Testing):
 * DRAFT     -> CONFIRMED  (valid)   BR-15
 * DRAFT     -> CANCELLED  (valid)   BR-16
 * CONFIRMED -> COMPLETED  (valid)   BR-17
 * CONFIRMED -> CANCELLED  (valid)   BR-18
 * COMPLETED -> *          (invalid) BR-19
 * CANCELLED -> *          (invalid) BR-20
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/middleware/auth-middleware";
import {
  ok,
  badRequest,
  notFound,
  unprocessable,
  internalError,
  ErrorCode,
} from "@/lib/api-response";
import {
  validateStatusTransition,
  isValidOrderStatus,
} from "@/lib/validations/order";
import type { OrderStatus } from "@/lib/validations/order";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // 1. Verifikasi autentikasi
    const auth = await requireAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    // 2. Cek pesanan ada
    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id:          true,
        orderNumber: true,
        status:      true,
        userId:      true,
      },
    });

    if (!order) {
      return notFound("Pesanan tidak ditemukan");
    }

    // 3. Parse body
    let body: { status?: unknown };
    try {
      body = await request.json();
    } catch {
      return badRequest("Request body harus berupa JSON yang valid");
    }

    // 4. Validasi status baru ada di body
    if (!body.status) {
      return badRequest("Field 'status' wajib diisi");
    }

    // 5. Validasi status adalah nilai enum yang valid
    if (!isValidOrderStatus(body.status)) {
      return badRequest(
        `Status tidak valid. Nilai yang diperbolehkan: DRAFT, CONFIRMED, COMPLETED, CANCELLED`
      );
    }

    const newStatus = body.status as OrderStatus;
    const currentStatus = order.status as OrderStatus;

    // 6. Validasi aturan transisi status (BR-15 s/d BR-20)
    const transitionResult = validateStatusTransition(currentStatus, newStatus);
    if (!transitionResult.valid) {
      return unprocessable(
        transitionResult.error!,
        ErrorCode.INVALID_STATUS_TRANSITION
      );
    }

    // 7. Update status pesanan
    const updated = await prisma.order.update({
      where: { id },
      data:  { status: newStatus },
      select: {
        id:          true,
        orderNumber: true,
        status:      true,
        updatedAt:   true,
      },
    });

    return ok(
      { order: updated },
      `Status pesanan berhasil diubah menjadi ${newStatus}`
    );
  } catch (error) {
    console.error("[PATCH /api/orders/:id/status] Error:", error);
    return internalError();
  }
}
