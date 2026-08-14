/**
 * app/api/products/route.ts
 * GET  /api/products  - Ambil semua produk (dengan filter opsional)
 * POST /api/products  - Buat produk baru (memerlukan autentikasi)
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/middleware/auth-middleware";
import {
  ok,
  created,
  badRequest,
  conflict,
  internalError,
} from "@/lib/api-response";
import {
  validateProductName,
  validateProductPrice,
  validateProductStock,
} from "@/lib/validations/product";
import { generateSlug } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// GET /api/products
// Query params: category (slug), search, page, limit
// ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category")?.trim() || null;
    const search   = searchParams.get("search")?.trim()   || null;
    const page     = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
    const limit    = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));

    // Bangun where clause secara dinamis
    const where = {
      isActive: true,
      ...(category ? { category: { slug: category } } : {}),
      ...(search
        ? { name: { contains: search, mode: "insensitive" as const } }
        : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return ok({ products, total, page, limit });
  } catch (error) {
    console.error("[GET /api/products] Error:", error);
    return internalError();
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/products  [AUTH REQUIRED]
// Body: name, description, price, stock, categoryId, imageUrl,
//       ingredients?, skinType?, howToUse?
// ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    // 1. Verifikasi autentikasi
    const auth = await requireAuth(request);
    if (!auth.success) return auth.response;

    // 2. Parse body
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return badRequest("Request body harus berupa JSON yang valid");
    }

    // 3. Validasi field wajib (BR-01, BR-02, BR-03, BR-04)
    const nameError = validateProductName(body.name);
    if (nameError) return badRequest(nameError);

    const priceError = validateProductPrice(body.price);
    if (priceError) return badRequest(priceError);

    const stockError = validateProductStock(body.stock);
    if (stockError) return badRequest(stockError);

    if (!body.description || String(body.description).trim().length === 0) {
      return badRequest("Deskripsi produk wajib diisi");
    }
    if (!body.categoryId || String(body.categoryId).trim().length === 0) {
      return badRequest("Kategori produk wajib dipilih");
    }
    if (!body.imageUrl || String(body.imageUrl).trim().length === 0) {
      return badRequest("URL gambar produk wajib diisi");
    }

    // 4. Verifikasi kategori ada di database
    const category = await prisma.category.findUnique({
      where: { id: String(body.categoryId) },
    });
    if (!category) {
      return badRequest("Kategori tidak ditemukan");
    }

    // 5. Generate slug dan cek keunikan
    const baseSlug = generateSlug(String(body.name));
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    // 6. Buat produk baru
    const product = await prisma.product.create({
      data: {
        name:        String(body.name).trim(),
        slug,
        description: String(body.description).trim(),
        price:       Number(body.price),
        stock:       Number(body.stock),
        categoryId:  String(body.categoryId),
        imageUrl:    String(body.imageUrl).trim(),
        ingredients: body.ingredients ? String(body.ingredients).trim() : null,
        skinType:    body.skinType    ? String(body.skinType).trim()    : null,
        howToUse:    body.howToUse    ? String(body.howToUse).trim()    : null,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return created({ product }, "Produk berhasil ditambahkan");
  } catch (error: unknown) {
    // Handle duplicate slug (race condition yang sangat jarang)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return conflict("Produk dengan nama serupa sudah ada");
    }
    console.error("[POST /api/products] Error:", error);
    return internalError();
  }
}
