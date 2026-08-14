/**
 * app/api/orders/route.ts
 * POST /api/orders
 *
 * Membuat pesanan baru dari keranjang belanja.
 * Memerlukan autentikasi JWT.
 *
 * Business Rules yang divalidasi:
 * - BR-09: User harus login
 * - BR-10: Keranjang tidak boleh kosong
 * - BR-05: Quantity minimal 1
 * - BR-06: Quantity maksimal 10 per produk
 * - BR-07: Quantity tidak boleh melebihi stok
 * - BR-08: Quantity harus integer positif
 * - BR-11: recipientName wajib diisi
 * - BR-12: shippingAddress wajib diisi
 * - BR-13: phoneNumber wajib diisi
 * - BR-14: Status pesanan baru selalu DRAFT
 *
 * Menggunakan Prisma Transaction untuk atomicity:
 * - Deduct stok semua produk
 * - Buat order + order items
 * - Jika salah satu gagal, semua di-rollback
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/middleware/auth-middleware";
import {
  created,
  badRequest,
  notFound,
  unprocessable,
  internalError,
  ErrorCode,
} from "@/lib/api-response";
import { validateCartQuantity } from "@/lib/validations/cart";
import { generateOrderNumber } from "@/lib/utils";

interface OrderItemInput {
  productId: unknown;
  quantity: unknown;
}

export async function POST(request: NextRequest) {
  try {
    // ── 1. Verifikasi autentikasi (BR-09) ────────────────────
    const auth = await requireAuth(request);
    if (!auth.success) return auth.response;

    // ── 2. Parse body ────────────────────────────────────────
    let body: {
      recipientName?: unknown;
      shippingAddress?: unknown;
      phoneNumber?: unknown;
      notes?: unknown;
      items?: unknown;
    };
    try {
      body = await request.json();
    } catch {
      return badRequest("Request body harus berupa JSON yang valid");
    }

    // ── 3. Validasi data penerima (BR-11, BR-12, BR-13) ──────
    if (!body.recipientName || String(body.recipientName).trim() === "") {
      return badRequest("Nama penerima wajib diisi");
    }
    if (!body.shippingAddress || String(body.shippingAddress).trim() === "") {
      return badRequest("Alamat pengiriman wajib diisi");
    }
    if (!body.phoneNumber || String(body.phoneNumber).trim() === "") {
      return badRequest("Nomor telepon wajib diisi");
    }

    const phoneStr = String(body.phoneNumber).trim();
    if (!/^[0-9+\-\s()]{8,15}$/.test(phoneStr)) {
      return badRequest("Format nomor telepon tidak valid");
    }

    // ── 4. Validasi items (BR-10) ────────────────────────────
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return badRequest(
        "Keranjang belanja tidak boleh kosong",
        ErrorCode.VALIDATION_ERROR
      );
    }

    const rawItems = body.items as OrderItemInput[];

    // ── 5. Validasi setiap item dan ambil data produk ────────
    // Kumpulkan semua productId untuk single query
    const productIds = rawItems.map((item) => String(item.productId));
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const resolvedItems: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      productName: string;
    }> = [];

    let totalPrice = 0;

    for (const raw of rawItems) {
      const productId = String(raw.productId);
      const product = productMap.get(productId);

      if (!product) {
        return notFound(`Produk dengan ID ${productId} tidak ditemukan`);
      }

      // Validasi quantity (BR-05, BR-06, BR-07, BR-08)
      const qtyValidation = validateCartQuantity(raw.quantity, product.stock);
      if (!qtyValidation.valid) {
        return unprocessable(
          `${product.name}: ${qtyValidation.error}`,
          product.stock === 0 || Number(raw.quantity) > product.stock
            ? ErrorCode.INSUFFICIENT_STOCK
            : ErrorCode.VALIDATION_ERROR
        );
      }

      const quantity = Number(raw.quantity);
      const subtotal = product.price * quantity;
      totalPrice += subtotal;

      resolvedItems.push({
        productId:   product.id,
        quantity,
        unitPrice:   product.price,
        subtotal,
        productName: product.name,
      });
    }

    // ── 6. Buat pesanan dalam satu transaksi (atomic) ────────
    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      // Deduct stok untuk setiap produk secara atomic
      for (const item of resolvedItems) {
        const updated = await tx.product.updateMany({
          where: {
            id:    item.productId,
            stock: { gte: item.quantity }, // pastikan stok masih cukup
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        // Jika tidak ada baris yang terupdate, stok tidak mencukupi
        if (updated.count === 0) {
          throw new Error(`INSUFFICIENT_STOCK:${item.productName}`);
        }
      }

      // Buat order dan order items dalam satu operasi
      return await tx.order.create({
        data: {
          orderNumber,
          totalPrice,
          recipientName:   String(body.recipientName!).trim(),
          shippingAddress: String(body.shippingAddress!).trim(),
          phoneNumber:     phoneStr,
          notes: body.notes ? String(body.notes).trim() : null,
          userId: auth.payload.userId,
          status: "DRAFT", // BR-14: pesanan baru selalu DRAFT
          items: {
            create: resolvedItems.map((item) => ({
              productId: item.productId,
              quantity:  item.quantity,
              unitPrice: item.unitPrice,
              subtotal:  item.subtotal,
            })),
          },
        },
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
    });

    return created({ order }, "Pesanan berhasil dibuat");
  } catch (error: unknown) {
    // Handle stok tidak mencukupi yang terjadi di dalam transaksi
    if (error instanceof Error && error.message.startsWith("INSUFFICIENT_STOCK:")) {
      const productName = error.message.replace("INSUFFICIENT_STOCK:", "");
      return unprocessable(
        `Stok ${productName} tidak mencukupi saat pemrosesan`,
        ErrorCode.INSUFFICIENT_STOCK
      );
    }
    console.error("[POST /api/orders] Error:", error);
    return internalError();
  }
}
