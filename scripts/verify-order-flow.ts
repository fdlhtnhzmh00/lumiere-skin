/**
 * scripts/verify-order-flow.ts
 * Verifikasi end-to-end order status flow via database langsung.
 *
 * Skenario yang diuji:
 * 1. Buat order DRAFT
 * 2. Transisi DRAFT → CONFIRMED (valid)
 * 3. Transisi CONFIRMED → COMPLETED (valid)
 * 4. Coba COMPLETED → CANCELLED (harus ditolak - BR-19)
 * 5. Buat order baru → DRAFT → CANCELLED (valid)
 * 6. Coba CANCELLED → CONFIRMED (harus ditolak - BR-20)
 * 7. Buat order baru → DRAFT → CONFIRMED → CANCELLED (valid)
 */

import { PrismaClient, OrderStatus } from "@prisma/client";
import { validateStatusTransition } from "../lib/validations/order";
import { generateOrderNumber } from "../lib/utils";

const prisma = new PrismaClient();

let pass = 0;
let fail = 0;

function assert(name: string, condition: boolean): void {
  if (condition) {
    console.log(`  ✅ PASS: ${name}`);
    pass++;
  } else {
    console.log(`  ❌ FAIL: ${name}`);
    fail++;
  }
}

async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  ORDER STATUS FLOW — End-to-End Verification     ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  // ── Setup: Ambil user dan produk dari database ─────────────
  const user    = await prisma.user.findFirst({ where: { email: "user@lumiereskin.com" } });
  const product = await prisma.product.findFirst({ where: { isActive: true, stock: { gte: 5 } } });

  if (!user || !product) {
    console.error("❌ User atau produk tidak ditemukan. Jalankan seed terlebih dahulu.");
    process.exit(1);
  }

  console.log(`User  : ${user.email}`);
  console.log(`Produk: ${product.name} (stok: ${product.stock})\n`);

  // ── Helper: buat order baru ────────────────────────────────
  async function createTestOrder(tag: string) {
    const order = await prisma.order.create({
      data: {
        orderNumber:     generateOrderNumber(),
        status:          "DRAFT",
        totalPrice:      product!.price * 2,
        recipientName:   "Test Penerima",
        shippingAddress: "Jl. Test No. 1, Makassar",
        phoneNumber:     "081234567890",
        userId:          user!.id,
        items: {
          create: [{
            productId: product!.id,
            quantity:  2,
            unitPrice: product!.price,
            subtotal:  product!.price * 2,
          }],
        },
      },
    });
    console.log(`📦 [${tag}] Order dibuat: ${order.orderNumber} (${order.status})`);
    return order;
  }

  // ── Helper: ubah status via Prisma (simulasi API) ──────────
  async function transitionStatus(orderId: string, currentStatus: OrderStatus, newStatus: OrderStatus) {
    const validation = validateStatusTransition(currentStatus, newStatus);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    const updated = await prisma.order.update({
      where: { id: orderId },
      data:  { status: newStatus },
    });
    return { success: true, order: updated };
  }

  // ═══════════════════════════════════════════════════════════
  // SKENARIO 1: Alur sukses penuh DRAFT → CONFIRMED → COMPLETED
  // ═══════════════════════════════════════════════════════════
  console.log("═══ SKENARIO 1: DRAFT → CONFIRMED → COMPLETED ═══");
  const order1 = await createTestOrder("S1");

  const s1a = await transitionStatus(order1.id, "DRAFT", "CONFIRMED");
  assert("DRAFT → CONFIRMED (valid)", s1a.success === true);

  const s1b = await transitionStatus(order1.id, "CONFIRMED", "COMPLETED");
  assert("CONFIRMED → COMPLETED (valid)", s1b.success === true);

  // Verifikasi status final
  const o1Final = await prisma.order.findUnique({ where: { id: order1.id } });
  assert("Status akhir = COMPLETED", o1Final?.status === "COMPLETED");

  // ═══════════════════════════════════════════════════════════
  // SKENARIO 2: COMPLETED tidak bisa dibatalkan (BR-19)
  // ═══════════════════════════════════════════════════════════
  console.log("\n═══ SKENARIO 2: COMPLETED → CANCELLED (harus ditolak) ═══");

  const s2 = await transitionStatus(order1.id, "COMPLETED", "CANCELLED");
  assert("COMPLETED → CANCELLED ditolak (BR-19)", s2.success === false);
  assert("Error message tidak null", s2.error !== null && s2.error !== undefined);
  console.log(`  ℹ️  Error: "${s2.error}"`);

  // ═══════════════════════════════════════════════════════════
  // SKENARIO 3: DRAFT → CANCELLED (valid)
  // ═══════════════════════════════════════════════════════════
  console.log("\n═══ SKENARIO 3: DRAFT → CANCELLED (valid) ═══");
  const order3 = await createTestOrder("S3");

  const s3 = await transitionStatus(order3.id, "DRAFT", "CANCELLED");
  assert("DRAFT → CANCELLED (valid)", s3.success === true);

  const o3Final = await prisma.order.findUnique({ where: { id: order3.id } });
  assert("Status akhir = CANCELLED", o3Final?.status === "CANCELLED");

  // ═══════════════════════════════════════════════════════════
  // SKENARIO 4: CANCELLED tidak bisa diaktifkan kembali (BR-20)
  // ═══════════════════════════════════════════════════════════
  console.log("\n═══ SKENARIO 4: CANCELLED → CONFIRMED (harus ditolak) ═══");

  const s4 = await transitionStatus(order3.id, "CANCELLED", "CONFIRMED");
  assert("CANCELLED → CONFIRMED ditolak (BR-20)", s4.success === false);
  assert("Error message tidak null", s4.error !== null && s4.error !== undefined);
  console.log(`  ℹ️  Error: "${s4.error}"`);

  // ═══════════════════════════════════════════════════════════
  // SKENARIO 5: DRAFT → CONFIRMED → CANCELLED (valid)
  // ═══════════════════════════════════════════════════════════
  console.log("\n═══ SKENARIO 5: DRAFT → CONFIRMED → CANCELLED (valid) ═══");
  const order5 = await createTestOrder("S5");

  const s5a = await transitionStatus(order5.id, "DRAFT", "CONFIRMED");
  assert("DRAFT → CONFIRMED (valid)", s5a.success === true);

  const s5b = await transitionStatus(order5.id, "CONFIRMED", "CANCELLED");
  assert("CONFIRMED → CANCELLED (valid)", s5b.success === true);

  const o5Final = await prisma.order.findUnique({ where: { id: order5.id } });
  assert("Status akhir = CANCELLED", o5Final?.status === "CANCELLED");

  // ═══════════════════════════════════════════════════════════
  // SKENARIO 6: Loncat status tidak valid (DRAFT → COMPLETED)
  // ═══════════════════════════════════════════════════════════
  console.log("\n═══ SKENARIO 6: DRAFT → COMPLETED (loncat, harus ditolak) ═══");
  const order6 = await createTestOrder("S6");

  const s6 = await transitionStatus(order6.id, "DRAFT", "COMPLETED");
  assert("DRAFT → COMPLETED ditolak (loncat status)", s6.success === false);
  console.log(`  ℹ️  Error: "${s6.error}"`);

  // Cleanup order6 (batalkan agar tidak mengganggu data)
  await prisma.order.update({ where: { id: order6.id }, data: { status: "CANCELLED" } });

  // ═══════════════════════════════════════════════════════════
  // SKENARIO 7: Status sama tidak valid
  // ═══════════════════════════════════════════════════════════
  console.log("\n═══ SKENARIO 7: DRAFT → DRAFT (status sama, harus ditolak) ═══");
  const order7 = await createTestOrder("S7");

  const s7 = await transitionStatus(order7.id, "DRAFT", "DRAFT");
  assert("DRAFT → DRAFT ditolak (status sama)", s7.success === false);

  await prisma.order.update({ where: { id: order7.id }, data: { status: "CANCELLED" } });

  // ═══════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log(`║  HASIL: ${pass} PASS  ${fail} FAIL  (Total: ${pass + fail})  `
    .padEnd(50) + "║");
  console.log("╚══════════════════════════════════════════════════╝");

  if (fail === 0) {
    console.log("\n🎉 SEMUA SKENARIO ORDER STATUS FLOW TERVERIFIKASI!\n");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
