/**
 * app/api/products/[id]/route.ts
 * GET    /api/products/:id  - Ambil detail produk (by CUID id ATAU slug)
 * PATCH  /api/products/:id  - Perbarui data produk (memerlukan autentikasi)
 * DELETE /api/products/:id  - Hapus produk / soft delete (memerlukan autentikasi)
 *
 * Parameter :id menerima CUID (id internal) ATAU slug produk secara transparan.
 * Contoh:
 *   GET /api/products/clxxxxx              → cari by id
 *   GET /api/products/vitamin-c-brightening-serum → cari by slug ✓
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/middleware/auth-middleware";
import {
  ok,
  badRequest,
  notFound,
  internalError,
} from "@/lib/api-response";
import {
  validateProductName,
  validateProductPrice,
  validateProductStock,
} from "@/lib/validations/product";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Helper: cari produk berdasarkan id (CUID) atau slug
async function findProduct(idOrSlug: string) {
  return prisma.product.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug },
      ],
      isActive: true,
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
  });
}

// ─────────────────────────────────────────────────────────────
// GET /api/products/:id
// Menerima CUID atau slug produk secara transparan.
// ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    void request;
    const { id } = await params;

    const product = await findProduct(id);

    if (!product) {
      return notFound("Produk tidak ditemukan");
    }

    return ok({ product });
  } catch (error) {
    console.error("[GET /api/products/:id] Error:", error);
    return internalError();
  }
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/products/:id  [AUTH REQUIRED]
// Semua field bersifat opsional (partial update).
// ─────────────────────────────────────────────────────────────
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    // Cek produk ada (by id atau slug)
    const existing = await findProduct(id);
    if (!existing) {
      return notFound("Produk tidak ditemukan");
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return badRequest("Request body harus berupa JSON yang valid");
    }

    // Validasi field yang disertakan
    if (body.name !== undefined) {
      const err = validateProductName(body.name);
      if (err) return badRequest(err);
    }
    if (body.price !== undefined) {
      const err = validateProductPrice(body.price);
      if (err) return badRequest(err);
    }
    if (body.stock !== undefined) {
      const err = validateProductStock(body.stock);
      if (err) return badRequest(err);
    }
    if (body.categoryId !== undefined) {
      const category = await prisma.category.findUnique({
        where: { id: String(body.categoryId) },
      });
      if (!category) return badRequest("Kategori tidak ditemukan");
    }

    const updateData: Record<string, unknown> = {};
    if (body.name        !== undefined) updateData.name        = String(body.name).trim();
    if (body.description !== undefined) updateData.description = String(body.description).trim();
    if (body.price       !== undefined) updateData.price       = Number(body.price);
    if (body.stock       !== undefined) updateData.stock       = Number(body.stock);
    if (body.imageUrl    !== undefined) updateData.imageUrl    = String(body.imageUrl).trim();
    if (body.ingredients !== undefined) updateData.ingredients = body.ingredients ? String(body.ingredients).trim() : null;
    if (body.skinType    !== undefined) updateData.skinType    = body.skinType    ? String(body.skinType).trim()    : null;
    if (body.howToUse    !== undefined) updateData.howToUse    = body.howToUse    ? String(body.howToUse).trim()    : null;
    if (body.categoryId  !== undefined) updateData.categoryId  = String(body.categoryId);
    if (body.isActive    !== undefined) updateData.isActive    = Boolean(body.isActive);

    if (Object.keys(updateData).length === 0) {
      return badRequest("Tidak ada data yang diperbarui");
    }

    // Update menggunakan id asli dari database (bukan slug yang dikirim)
    const updated = await prisma.product.update({
      where: { id: existing.id },
      data: updateData,
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return ok({ product: updated }, "Produk berhasil diperbarui");
  } catch (error) {
    console.error("[PATCH /api/products/:id] Error:", error);
    return internalError();
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/products/:id  [AUTH REQUIRED]
// Soft delete: isActive = false
// ─────────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAuth(request);
    if (!auth.success) return auth.response;

    void request;
    const { id } = await params;

    const existing = await findProduct(id);
    if (!existing) {
      return notFound("Produk tidak ditemukan");
    }

    await prisma.product.update({
      where: { id: existing.id },
      data: { isActive: false },
    });

    return ok(null, "Produk berhasil dihapus");
  } catch (error) {
    console.error("[DELETE /api/products/:id] Error:", error);
    return internalError();
  }
}
