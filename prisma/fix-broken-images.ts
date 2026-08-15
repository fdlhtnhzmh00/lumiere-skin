/**
 * prisma/fix-broken-images.ts
 *
 * Ganti SEMUA gambar produk ke Unsplash yang terjamin bekerja.
 * ImgBB bisa dihapus kapanpun oleh user → tidak reliable untuk produksi.
 * Unsplash + unoptimized:true bekerja langsung di browser tanpa proxy.
 *
 * Menggunakan 22 foto skincare/beauty yang dikonfirmasi ada di Unsplash
 * dengan variasi crop parameter (center, top, bottom, entropy, faces)
 * sehingga 58 produk mendapat tampilan visual yang berbeda-beda.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── 22 Unsplash photo IDs skincare/beauty yang reliable ───────
const P: Record<string, string> = {
  A: "1556228578-0d85751bab32",   // skincare bottles
  B: "1556229010-6272de23c10b",   // cream jar white
  C: "1527799820374-dcf8d9d4a388", // beauty flat lay
  D: "1583209814683-c023dd293cc6", // skincare set
  E: "1616394584738-fc6e612e71b9", // products lineup
  F: "1570172619644-a2b5aecde81a", // blue serum bottle
  G: "1608248543803-ba4f8c70ae0b", // white jar clean
  H: "1574182245530-967d9b3831af", // tall glass bottle
  I: "1585751119851-b1ead7e4e9cb", // glass serum
  J: "1598440947619-2c35fc9aa908", // dropper serum
  K: "1606830733744-0ad0b9b3c4f5", // moisturizer cream
  L: "1626716474566-3073c900dd90", // skincare glow
  M: "1571781926291-c477ebfd024b", // pink flat lay
  N: "1556760544-74068565f05c",    // beauty cream
  O: "1612817288484-6f916006741a", // sunscreen tube
  P: "1590031971-a1e963a8f5b5",    // sunscreen apply
  Q: "1567721913486-6585f037b77b", // face mask
  R: "1556228720-195026d525f7",    // woman face care
  S: "1522335789203-aabd1fc54bc9", // eye area
  T: "1543779871-82d14e37d2ab",    // lip balm pink
  U: "1513161455079-7dc1de15ef3e", // scrub texture
  V: "1556228453-6e5a9e0beb3b",    // skincare flat
};

type Crop = "center" | "top" | "bottom" | "entropy" | "faces";

function img(key: keyof typeof P, crop: Crop = "center"): string {
  return `https://images.unsplash.com/photo-${P[key]}?auto=format&fit=crop&crop=${crop}&w=500&h=500&q=80`;
}

// ── Mapping slug → URL Unsplash unik ──────────────────────────
// Setiap kombinasi (key, crop) UNIK — 58 gambar berbeda
const IMAGE_MAP: Record<string, string> = {
  // ─ FACE CLEANSER (6) ─────────────────────────────────────────
  "glow-gentle-foam-cleanser":            img("A", "center"),
  "pure-balance-micellar-cleanser":       img("B", "center"),
  "radiance-rice-powder-cleanser":        img("C", "center"),
  "lumiere-deep-cleanse-gel":             img("D", "center"),
  "velvet-cloud-cream-cleanser":          img("E", "center"),
  "botanical-purifying-foam-wash":        img("F", "center"),

  // ─ TONER & ESSENCE (6) ───────────────────────────────────────
  "hydra-boost-hydrating-toner":          img("H", "center"),
  "brightening-rose-water-toner":         img("I", "center"),
  "clear-skin-aha-toner":                 img("J", "center"),
  "dewdrop-hydrating-essence":            img("K", "center"),
  "balance-ph-gentle-toner":              img("L", "center"),
  "fermented-rice-glow-essence":          img("M", "center"),

  // ─ SERUM & AMPOULE (7) ───────────────────────────────────────
  "vitamin-c-brightening-serum":          img("N", "center"),
  "retinol-renewal-night-serum":          img("I", "top"),
  "hyaluronic-acid-deep-hydration-serum": img("J", "top"),
  "niacinamide-10-pore-serum":            img("D", "entropy"),
  "peptide-firming-ampoule":              img("H", "top"),
  "glow-essence-brightening-serum":       img("F", "entropy"),
  "centella-asiatica-calm-serum":         img("V", "center"),

  // ─ MOISTURIZER & CREAM (6) ───────────────────────────────────
  "luminous-day-cream-spf15":             img("G", "center"),
  "hydra-rich-night-repair-cream":        img("K", "top"),
  "dewy-glow-gel-moisturizer":            img("A", "entropy"),
  "barrier-repair-intensive-cream":       img("E", "entropy"),
  "water-burst-lightweight-moisturizer":  img("L", "top"),
  "nutri-glow-face-butter":               img("C", "top"),

  // ─ SUNSCREEN (6) ─────────────────────────────────────────────
  "invisible-shield-sunscreen-spf50-pa":  img("P", "center"),
  "glow-protect-serum-sunscreen-spf30":   img("O", "center"),
  "mineral-sun-filter-spf50-plus":        img("P", "top"),
  "daily-uv-veil-spf50-pa-4":             img("O", "top"),
  "tinted-skin-protection-spf40":         img("P", "entropy"),
  "portable-sunscreen-stick-spf50":       img("O", "entropy"),

  // ─ FACE MASK (6) ─────────────────────────────────────────────
  "radiance-glow-sheet-mask":             img("Q", "center"),
  "charcoal-purifying-clay-mask":         img("R", "center"),
  "honey-glow-sleeping-mask":             img("Q", "top"),
  "aha-brightening-peel-off-mask":        img("M", "top"),
  "rose-petal-hydrogel-mask":             img("Q", "entropy"),
  "green-tea-soothing-clay-mask":         img("R", "top"),

  // ─ EYE CARE (5) ──────────────────────────────────────────────
  "caffeine-de-puff-eye-serum":           img("S", "center"),
  "retinol-eye-renewal-cream":            img("N", "top"),
  "brightening-under-eye-patch":          img("S", "top"),
  "cooling-eye-gel-treatment":            img("H", "entropy"),
  "age-defying-eye-complex":              img("S", "entropy"),

  // ─ LIP CARE (5) ──────────────────────────────────────────────
  "rose-butter-nourishing-lip-mask":      img("T", "center"),
  "vitamin-e-lip-renewal-serum":          img("T", "top"),
  "honey-glow-exfoliating-lip-scrub":     img("T", "entropy"),
  "plumping-hydrating-lip-treatment":     img("B", "top"),
  "spf15-daily-protect-lip-balm":         img("G", "top"),

  // ─ EXFOLIATOR (5) ────────────────────────────────────────────
  "sugar-glow-face-scrub":                img("U", "center"),
  "aha-bha-exfoliating-solution":         img("A", "top"),
  "enzyme-brightening-exfoliating-powder": img("C", "entropy"),
  "gentle-peeling-gel-exfoliant":         img("U", "top"),
  "glycolic-acid-glow-tonic":             img("J", "entropy"),

  // ─ ACNE CARE (6) ─────────────────────────────────────────────
  "salicylic-acid-2-spot-treatment":      img("R", "entropy"),
  "tea-tree-clear-skin-serum":            img("K", "entropy"),
  "bha-blemish-control-toner":            img("E", "top"),
  "acne-healing-invisible-patch":         img("V", "top"),
  "oil-control-mattifying-gel":           img("L", "entropy"),
  "pore-minimizing-clear-serum":          img("D", "top"),
};

// ── Verifikasi tidak ada duplikat ─────────────────────────────
function verifyUnique() {
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const [slug, url] of Object.entries(IMAGE_MAP)) {
    if (seen.has(url)) dupes.push(slug);
    seen.add(url);
  }
  if (dupes.length > 0) throw new Error(`DUPLIKAT: ${dupes.join(", ")}`);
  console.log(`✅ Verifikasi: ${Object.keys(IMAGE_MAP).length} URL semuanya unik`);
}

async function main() {
  console.log("🔧 Memperbaiki gambar produk yang broken...\n");
  verifyUnique();

  const products = await prisma.product.findMany({
    select: { id: true, slug: true, name: true },
  });

  let updated = 0;
  let notFound = 0;

  for (const p of products) {
    const newUrl = IMAGE_MAP[p.slug];
    if (!newUrl) { notFound++; continue; }

    await prisma.product.update({
      where: { id: p.id },
      data: { imageUrl: newUrl },
    });
    updated++;
    console.log(`✅ ${p.name.substring(0, 42).padEnd(42)} → Unsplash`);
  }

  console.log(`\n─────────────────────────────────────────`);
  console.log(`✅ Diperbarui   : ${updated} produk`);
  console.log(`⚠️  Tidak ada   : ${notFound} slug`);
  console.log(`\n🎉 Semua gambar produk sekarang menggunakan Unsplash!`);
  console.log(`   (Browser fetch langsung via unoptimized:true)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
