/**
 * app/api/orders/list/route.ts
 * GET /api/orders/list — Ambil semua pesanan milik user yang login.
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/middleware/auth-middleware";
import { ok, internalError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    void request;
    const auth = await requireAuth(request);
    if (!auth.success) return auth.response;

    const orders = await prisma.order.findMany({
      where: { userId: auth.payload.userId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok({ orders });
  } catch (error) {
    console.error("[GET /api/orders/list] Error:", error);
    return internalError();
  }
}
