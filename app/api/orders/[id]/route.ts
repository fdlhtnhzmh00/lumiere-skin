/**
 * app/api/orders/[id]/route.ts
 * GET /api/orders/:id
 *
 * Mengambil detail pesanan berdasarkan ID.
 * Memerlukan autentikasi JWT.
 * Hanya pemilik pesanan yang dapat melihat detail pesanannya.
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/middleware/auth-middleware";
import { ok, notFound, unauthorized, internalError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    void request;

    // 1. Verifikasi autentikasi
    const auth = await requireAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    // 2. Ambil pesanan dengan semua relasi
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true, slug: true },
            },
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      return notFound("Pesanan tidak ditemukan");
    }

    // 3. Hanya pemilik pesanan yang dapat melihat
    if (order.userId !== auth.payload.userId) {
      return unauthorized("Anda tidak memiliki akses ke pesanan ini");
    }

    return ok({ order });
  } catch (error) {
    console.error("[GET /api/orders/:id] Error:", error);
    return internalError();
  }
}
