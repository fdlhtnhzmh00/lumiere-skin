/**
 * app/api/categories/route.ts
 * GET /api/categories
 *
 * Endpoint bonus untuk mendukung filter kategori di UI.
 * Mengembalikan semua kategori beserta jumlah produk aktif per kategori.
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { ok, internalError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    void request;

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: { where: { isActive: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Tambahkan productCount ke setiap kategori untuk kemudahan UI
    const result = categories.map((cat) => ({
      id:           cat.id,
      name:         cat.name,
      slug:         cat.slug,
      description:  cat.description,
      imageUrl:     cat.imageUrl,
      productCount: cat._count.products,
    }));

    return ok({ categories: result });
  } catch (error) {
    console.error("[GET /api/categories] Error:", error);
    return internalError();
  }
}
