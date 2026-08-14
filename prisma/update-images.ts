/**
 * prisma/update-images.ts
 *
 * Script untuk memperbarui imageUrl semua produk agar setiap produk
 * memiliki gambar yang UNIK dan BERBEDA secara visual.
 *
 * Strategi:
 * - Gunakan 22 foto Unsplash skincare/beauty yang sudah dikonfirmasi
 * - Variasikan parameter crop imgix (center, top, bottom, entropy, faces)
 *   sehingga setiap produk mendapat potongan gambar berbeda
 * - Hasil: 59 kombinasi (photoId, crop) yang semuanya unik
 *
 * Jalankan: npm run db:update-images
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── 22 foto Unsplash skincare/beauty yang sudah dikonfirmasi ─────────────
const PHOTO = {
  A: "1556228578-0d85751bab32",   // beberapa botol skincare
  B: "1556229010-6272de23c10b",   // jar krim putih
  C: "1527799820374-dcf8d9d4a388", // produk kecantikan flat lay
  D: "1583209814683-c023dd293cc6", // set produk skincare
  E: "1616394584738-fc6e612e71b9", // koleksi produk skincare
  F: "1570172619644-a2b5aecde81a", // botol biru serum
  G: "1608248543803-ba4f8c70ae0b", // jar putih di atas meja
  H: "1574182245530-967d9b3831af", // botol kaca tinggi
  I: "1585751119851-b1ead7e4e9cb", // botol serum kaca bening
  J: "1598440947619-2c35fc9aa908", // botol dropper serum
  K: "1606830733744-0ad0b9b3c4f5", // krim pelembap
  L: "1626716474566-3073c900dd90", // set skincare glow
  M: "1571781926291-c477ebfd024b", // flat lay pink kecantikan
  N: "1556760544-74068565f05c",   // krim kecantikan
  O: "1612817288484-6f916006741a", // tabung sunscreen
  P: "1590031971-a1e963a8f5b5",   // aplikasi sunscreen
  Q: "1567721913486-6585f037b77b", // masker wajah
  R: "1556228720-195026d525f7",   // wajah perempuan
  S: "1522335789203-aabd1fc54bc9", // area mata
  T: "1543779871-82d14e37d2ab",   // lip balm merah muda
  U: "1513161455079-7dc1de15ef3e", // tekstur scrub/eksfolian
  V: "1556228453-6e5a9e0beb3b",   // flat lay skincare
} as const;

// ─── Helper URL builder ───────────────────────────────────────────────────
type CropMode = "center" | "top" | "bottom" | "entropy" | "faces" | "left" | "right";

function img(photoKey: keyof typeof PHOTO, crop: CropMode = "center"): string {
  const id = PHOTO[photoKey];
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&crop=${crop}&w=500&h=500&q=80`;
}

// ─── Mapping slug produk → URL gambar unik ────────────────────────────────
// Setiap entri menggunakan kombinasi (photoKey, crop) yang BERBEDA.
// Total: 59 kombinasi unik dari 22 foto × 7 crop mode.
const IMAGE_MAP: Record<string, string> = {

  // ══ PEMBERSIH WAJAH (6) ══════════════════════════════════════════════════
  "glow-gentle-foam-cleanser":          img("A", "center"),  // A:center
  "pure-balance-micellar-cleanser":     img("B", "center"),  // B:center
  "radiance-rice-powder-cleanser":      img("C", "center"),  // C:center
  "lumiere-deep-cleanse-gel":           img("D", "center"),  // D:center
  "velvet-cloud-cream-cleanser":        img("E", "center"),  // E:center
  "botanical-purifying-foam-wash":      img("F", "center"),  // F:center

  // ══ TONER & ESSENCE (6) ══════════════════════════════════════════════════
  "hydra-boost-hydrating-toner":        img("H", "center"),  // H:center
  "brightening-rose-water-toner":       img("I", "center"),  // I:center
  "clear-skin-aha-toner":               img("J", "center"),  // J:center
  "dewdrop-hydrating-essence":          img("K", "center"),  // K:center
  "balance-ph-gentle-toner":            img("L", "center"),  // L:center
  "fermented-rice-glow-essence":        img("M", "center"),  // M:center

  // ══ SERUM & AMPOULE (7) ══════════════════════════════════════════════════
  "vitamin-c-brightening-serum":        img("N", "center"),  // N:center
  "retinol-renewal-night-serum":        img("I", "top"),     // I:top
  "hyaluronic-acid-deep-hydration-serum": img("J", "top"),   // J:top
  "niacinamide-10-pore-serum":          img("D", "entropy"), // D:entropy
  "peptide-firming-ampoule":            img("H", "top"),     // H:top
  "glow-essence-brightening-serum":     img("F", "entropy"), // F:entropy
  "centella-asiatica-calm-serum":       img("V", "center"),  // V:center

  // ══ PELEMBAP & KRIM (6) ══════════════════════════════════════════════════
  "luminous-day-cream-spf15":           img("G", "center"),  // G:center
  "hydra-rich-night-repair-cream":      img("K", "top"),     // K:top
  "dewy-glow-gel-moisturizer":          img("A", "entropy"), // A:entropy
  "barrier-repair-intensive-cream":     img("E", "entropy"), // E:entropy
  "water-burst-lightweight-moisturizer": img("L", "top"),    // L:top
  "nutri-glow-face-butter":             img("C", "top"),     // C:top

  // ══ TABIR SURYA (6) ══════════════════════════════════════════════════════
  "invisible-shield-sunscreen-spf50-pa": img("P", "center"), // P:center
  "glow-protect-serum-sunscreen-spf30":  img("O", "center"), // O:center
  "mineral-sun-filter-spf50-plus":       img("P", "top"),    // P:top
  "daily-uv-veil-spf50-pa-4":            img("O", "top"),    // O:top
  "tinted-skin-protection-spf40":        img("P", "entropy"), // P:entropy
  "portable-sunscreen-stick-spf50":      img("O", "entropy"), // O:entropy

  // ══ MASKER WAJAH (6) ══════════════════════════════════════════════════════
  "radiance-glow-sheet-mask":           img("Q", "center"),  // Q:center
  "charcoal-purifying-clay-mask":       img("R", "center"),  // R:center
  "honey-glow-sleeping-mask":           img("Q", "top"),     // Q:top
  "aha-brightening-peel-off-mask":      img("M", "top"),     // M:top
  "rose-petal-hydrogel-mask":           img("Q", "entropy"), // Q:entropy
  "green-tea-soothing-clay-mask":       img("R", "top"),     // R:top

  // ══ PERAWATAN MATA (5) ════════════════════════════════════════════════════
  "caffeine-de-puff-eye-serum":         img("S", "center"),  // S:center
  "retinol-eye-renewal-cream":          img("N", "top"),     // N:top
  "brightening-under-eye-patch":        img("S", "top"),     // S:top
  "cooling-eye-gel-treatment":          img("H", "entropy"), // H:entropy
  "age-defying-eye-complex":            img("S", "entropy"), // S:entropy

  // ══ PERAWATAN BIBIR (5) ═══════════════════════════════════════════════════
  "rose-butter-nourishing-lip-mask":    img("T", "center"),  // T:center
  "vitamin-e-lip-renewal-serum":        img("T", "top"),     // T:top
  "honey-glow-exfoliating-lip-scrub":   img("T", "entropy"), // T:entropy
  "plumping-hydrating-lip-treatment":   img("B", "top"),     // B:top
  "spf15-daily-protect-lip-balm":       img("G", "top"),     // G:top

  // ══ EKSFOLIATOR (5) ═══════════════════════════════════════════════════════
  "sugar-glow-face-scrub":              img("U", "center"),  // U:center
  "aha-bha-exfoliating-solution":       img("A", "top"),     // A:top
  "enzyme-brightening-exfoliating-powder": img("C", "entropy"), // C:entropy
  "gentle-peeling-gel-exfoliant":       img("U", "top"),     // U:top
  "glycolic-acid-glow-tonic":           img("J", "entropy"), // J:entropy

  // ══ PERAWATAN JERAWAT (6) ═════════════════════════════════════════════════
  "salicylic-acid-2-spot-treatment":    img("R", "entropy"), // R:entropy
  "tea-tree-clear-skin-serum":          img("K", "entropy"), // K:entropy
  "bha-blemish-control-toner":          img("E", "top"),     // E:top
  "acne-healing-invisible-patch":       img("V", "top"),     // V:top
  "oil-control-mattifying-gel":         img("L", "entropy"), // L:entropy
  "pore-minimizing-clear-serum":        img("D", "top"),     // D:top

  // ══ PRODUK TEST (soft-deleted, tetap diupdate) ═══════════════════════════
  "test-brightening-toner":             img("F", "top"),     // F:top
};

// ─── Verifikasi tidak ada duplikat sebelum update ─────────────────────────
function verifyUnique() {
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const [slug, url] of Object.entries(IMAGE_MAP)) {
    if (seen.has(url)) dupes.push(slug);
    seen.add(url);
  }
  if (dupes.length > 0) {
    throw new Error(`DUPLIKAT DITEMUKAN: ${dupes.join(", ")}`);
  }
  console.log(`✅ Verifikasi: ${Object.keys(IMAGE_MAP).length} URL semuanya unik`);
}

// ─── Update database ──────────────────────────────────────────────────────
async function main() {
  console.log("🖼️  Memperbarui gambar produk LUMIÈRE SKIN...\n");

  verifyUnique();

  // Ambil semua produk (termasuk yang soft-deleted)
  const products = await prisma.product.findMany({
    select: { id: true, slug: true, name: true, imageUrl: true },
  });

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const product of products) {
    const newUrl = IMAGE_MAP[product.slug];

    if (!newUrl) {
      console.log(`⚠️  Slug tidak ada di IMAGE_MAP: "${product.slug}" — lewati`);
      notFound++;
      continue;
    }

    if (newUrl === product.imageUrl) {
      skipped++;
      continue;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { imageUrl: newUrl },
    });

    updated++;
    console.log(`✅ ${product.name}`);
    console.log(`   ${newUrl.replace("https://images.unsplash.com/photo-", "photo-").substring(0, 70)}\n`);
  }

  console.log("─────────────────────────────────────");
  console.log(`📊 Total produk   : ${products.length}`);
  console.log(`✅ Diperbarui     : ${updated}`);
  console.log(`⏩ Tidak berubah  : ${skipped}`);
  console.log(`⚠️  Slug tidak ada : ${notFound}`);
  console.log("\n🎉 Pembaruan gambar selesai!");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
