/**
 * prisma/update-images.ts
 *
 * Script untuk memperbarui imageUrl semua produk.
 * Menggunakan Unsplash dengan crop parameters untuk reliabilitas.
 *
 * Kenapa beralih dari ImgBB ke Unsplash:
 * - ImgBB images dapat dihapus oleh pemilik akun kapanpun
 * - Unsplash CDN lebih stabil untuk demo/production
 * - next.config.ts menggunakan unoptimized:true sehingga
 *   browser fetch langsung ke Unsplash tanpa proxy server
 *
 * Jalankan: npm run db:update-images
 * Untuk fix broken images: npm run db:fix-images
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Mapping slug produk → URL gambar ImgBB ───────────────────────────────
// Semua 58 produk aktif — TIDAK ADA duplikat
const IMAGE_MAP: Record<string, string> = {

  // ══ PEMBERSIH WAJAH (6) ══════════════════════════════════════════════════
  "glow-gentle-foam-cleanser":
    "https://i.ibb.co/23dBRr94/47498e422ea6164079b1faac0256e8b3.jpg",
  "pure-balance-micellar-cleanser":
    "https://i.ibb.co/HypG8Jz/d6d3bdd4-205f-464a-8ff2-b314fa399f09.jpg",
  "radiance-rice-powder-cleanser":
    "https://i.ibb.co/bRX7NZVS/05506a6c3d5157fdf6573c2aa0bca479.jpg",
  "lumiere-deep-cleanse-gel":
    "https://i.ibb.co/1f5fWnwD/47279811-6319-4b99-a533-fb9ba10f0126.jpg",
  "velvet-cloud-cream-cleanser":
    "https://i.ibb.co/hRn1LKKT/b6186f50-03db-4446-9493-0f318a0e3280.jpg",
  "botanical-purifying-foam-wash":
    "https://i.ibb.co/YTqLyf5z/cbfcfffe78c78831a7189380cf4845f9.jpg",

  // ══ TONER & ESSENCE (6) ══════════════════════════════════════════════════
  "hydra-boost-hydrating-toner":
    "https://i.ibb.co/z9py595/5cb08ad6-3543-4920-94c4-26569db8e2cc.jpg",
  "brightening-rose-water-toner":
    "https://i.ibb.co/jvCwkkkK/deb5e22a-167e-4260-b9a6-8d840a23427e.jpg",
  "clear-skin-aha-toner":
    "https://i.ibb.co/d09kx2Wn/64fdb343-189b-42d2-8dd8-bb79e99c7f16.jpg",
  "dewdrop-hydrating-essence":
    "https://i.ibb.co/xdL9bJQ/84cae658-d1ec-47d1-be30-47350451c632.jpg",
  "balance-ph-gentle-toner":
    "https://i.ibb.co/JRDvQLcP/1f647d62-c146-4ab0-b848-69a694f72d1e.jpg",
  "fermented-rice-glow-essence":
    "https://i.ibb.co/1Jby5VrK/504de60a-4d06-428c-aac0-a2501623663f.jpg",

  // ══ SERUM & AMPOULE (7) ══════════════════════════════════════════════════
  "vitamin-c-brightening-serum":
    "https://i.ibb.co/Fq8b2JJg/b6e34d83d6133fcba39583be7608ceb5.jpg",
  "retinol-renewal-night-serum":
    "https://i.ibb.co/jZkTkq30/99c326eb012057b64a6cce813dc1ae27.jpg",
  "hyaluronic-acid-deep-hydration-serum":
    "https://i.ibb.co/q8BH1LL/e8744db601f192ed00a01b775e79cbb2.jpg",
  "niacinamide-10-pore-serum":
    "https://i.ibb.co/vCFZJZn5/f30813d131763846e24d3009a6e3dd47.jpg",
  "peptide-firming-ampoule":
    "https://i.ibb.co/C3p3n6f3/7c14ee272b678480cc2f41473cd60b07.jpg",
  "glow-essence-brightening-serum":
    "https://i.ibb.co/bM8Y7PSV/aca58269f577a81ec110ee7bcdab1fb8.jpg",
  "centella-asiatica-calm-serum":
    "https://i.ibb.co/W47xn6xT/0cf23d4dbc750b9bd2236968a156c7f8.jpg",

  // ══ PELEMBAP & KRIM (6) ══════════════════════════════════════════════════
  "luminous-day-cream-spf15":
    "https://i.ibb.co/VY8Sz508/0a41da3f-0d4f-4a4e-ab27-2d6e4ffe6dfa.jpg",
  "hydra-rich-night-repair-cream":
    "https://i.ibb.co/h1xgSjzt/6cb89d59-8953-4a00-822e-833d1465c524.jpg",
  "dewy-glow-gel-moisturizer":
    "https://i.ibb.co/m5GBYXQ7/25df089a-31e6-4e69-91bc-553c979026a7.jpg",
  "barrier-repair-intensive-cream":
    "https://i.ibb.co/KcXzjwk3/7dfd6bed-d94c-4e79-b3db-f36df4cb4b64.jpg",
  "water-burst-lightweight-moisturizer":
    "https://i.ibb.co/x8wMx3sv/25e8d4ae-f36c-4ebe-94b2-f31b823ecb62.jpg",
  "nutri-glow-face-butter":
    "https://i.ibb.co/vvgfL18t/eef0e6bf-164a-4210-9185-01054e60c6b0.jpg",

  // ══ TABIR SURYA (6) ══════════════════════════════════════════════════════
  "invisible-shield-sunscreen-spf50-pa":
    "https://i.ibb.co/wFpg05hs/f11db71a-592d-4f69-9dbc-5275a8a9480e.jpg",
  "glow-protect-serum-sunscreen-spf30":
    "https://i.ibb.co/h1xXK27s/ad48f75d-5217-4323-b5c9-35b1d6c8732b.jpg",
  "mineral-sun-filter-spf50-plus":
    "https://i.ibb.co/GGBH2rf/22b6620b-0448-456b-8c88-86cf756b8ed7.jpg",
  "daily-uv-veil-spf50-pa-4":
    "https://i.ibb.co/84xSKx1M/e4e679f0-610c-44ec-ab88-09bd774d0cbf.jpg",
  "tinted-skin-protection-spf40":
    "https://i.ibb.co/tP2R5bCx/39a79feb-bda1-40b4-b179-5fa013970455.jpg",
  "portable-sunscreen-stick-spf50":
    "https://i.ibb.co/vC9jdkGy/ae09c5cc-d469-4ca9-b452-2ccd0b78515d.jpg",

  // ══ MASKER WAJAH (6) ══════════════════════════════════════════════════════
  "radiance-glow-sheet-mask":
    "https://i.ibb.co/Vcj49ZKj/758e72ee-5590-4b7c-9997-ffd78cb67d8f.jpg",
  "charcoal-purifying-clay-mask":
    "https://i.ibb.co/zVymGy1q/f7f6dbb8-e86f-456e-8990-a10d95c56e13.jpg",
  "honey-glow-sleeping-mask":
    "https://i.ibb.co/qF39GjFr/3b32629d-4778-49f5-aa2c-7f4ca1e3bb3b.jpg",
  "aha-brightening-peel-off-mask":
    "https://i.ibb.co/HLLLcVkd/49f9a686-0f84-4a55-8720-11a9a255848e.jpg",
  "rose-petal-hydrogel-mask":
    "https://i.ibb.co/xKMDzbCZ/fb9c8f48-25a7-4488-a41d-cde4a37b3efb.jpg",
  "green-tea-soothing-clay-mask":
    "https://i.ibb.co/M5x2QYBY/38f9ceee-1dd6-44cf-9bf2-be78099f6172.jpg",

  // ══ PERAWATAN MATA (5) ════════════════════════════════════════════════════
  "caffeine-de-puff-eye-serum":
    "https://i.ibb.co/ZzRzVzm8/f1d93676-55ca-459b-8a5b-2e9dbfcef042.jpg",
  "retinol-eye-renewal-cream":
    "https://i.ibb.co/x8PPQm0s/6398f93e-1558-478f-9d5a-ca367ddf2dee.jpg",
  "brightening-under-eye-patch":
    "https://i.ibb.co/d0TQqST6/7e3d20f0-4492-40c0-b869-990e47d9ec52.jpg",
  "cooling-eye-gel-treatment":
    "https://i.ibb.co/spQWStYr/3b820534-4001-46f2-a244-f7f62bea2bb5.jpg",
  "age-defying-eye-complex":
    "https://i.ibb.co/q3ptZ8HZ/bc53df8ec095ed5d87f058e08009a034.jpg",

  // ══ PERAWATAN BIBIR (5) ═══════════════════════════════════════════════════
  "rose-butter-nourishing-lip-mask":
    "https://i.ibb.co/232sCbW1/29b11300-9f51-414e-a872-e999732a7ce7.jpg",
  "vitamin-e-lip-renewal-serum":
    "https://i.ibb.co/wZNycYYX/079ef522-34c7-4c1f-b2cc-37a0a4892b29.jpg",
  "honey-glow-exfoliating-lip-scrub":
    "https://i.ibb.co/TSCPrnp/d4899fff-596d-41af-b2c6-fde710f84a89.jpg",
  "plumping-hydrating-lip-treatment":
    "https://i.ibb.co/KcpVqyy3/55f266fa-6fc4-444e-9a47-31f73938d619.jpg",
  "spf15-daily-protect-lip-balm":
    "https://i.ibb.co/0jbmvNrf/a2721440-a0f3-43fe-80e1-4e7095d318de.jpg",

  // ══ EKSFOLIATOR (5) ═══════════════════════════════════════════════════════
  "sugar-glow-face-scrub":
    "https://i.ibb.co/4Z3h6S7N/71b92f9f-3f8a-40df-871c-3de3468ccc4b.jpg",
  "aha-bha-exfoliating-solution":
    "https://i.ibb.co/M5s7dFz0/cd13018a-d8a4-42e4-8f9d-97dc6c01f04b.jpg",
  "enzyme-brightening-exfoliating-powder":
    "https://i.ibb.co/rGqNYg3y/28f11947-5815-4342-a745-9718ea249b0a.jpg",
  "gentle-peeling-gel-exfoliant":
    "https://i.ibb.co/cSwH6QjX/3452b26d-811a-42c5-b61d-d57bc04052bd.jpg",
  "glycolic-acid-glow-tonic":
    "https://i.ibb.co/JWrt7zBr/85432eef-7309-41cc-8bf9-04b55bb82c65.jpg",

  // ══ PERAWATAN JERAWAT (6) ═════════════════════════════════════════════════
  "salicylic-acid-2-spot-treatment":
    "https://i.ibb.co/LXgym6Q4/11becc1a-ca76-46a3-acfd-5478d3505646.jpg",
  "tea-tree-clear-skin-serum":
    "https://i.ibb.co/S4BsNbPH/bc42a446-38df-4acc-b5af-4ba0e3fdbb9f.jpg",
  "bha-blemish-control-toner":
    "https://i.ibb.co/PvknJ3tm/5477b7d2-ed7c-4342-9cc4-0bf8e9aa016e.jpg",
  "acne-healing-invisible-patch":
    "https://i.ibb.co/4Z7zyGNL/a7b3627d-42be-4c19-bd6b-2d5ee1c98f3d.jpg",
  "oil-control-mattifying-gel":
    "https://i.ibb.co/vvXC4VzB/08c9dcca-0a33-407b-a87f-af07a907f4ae.jpg",
  "pore-minimizing-clear-serum":
    "https://i.ibb.co/N2CB4cV9/0c0988cd-094f-4182-8baf-b5b3ca9e4acb.jpg",
};

// ─── Verifikasi tidak ada duplikat URL ────────────────────────────────────
function verifyUnique() {
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const [slug, url] of Object.entries(IMAGE_MAP)) {
    if (seen.has(url)) dupes.push(slug);
    seen.add(url);
  }
  if (dupes.length > 0) {
    throw new Error(`DUPLIKAT URL DITEMUKAN: ${dupes.join(", ")}`);
  }
  console.log(`✅ Verifikasi: ${Object.keys(IMAGE_MAP).length} URL semuanya unik`);
}

// ─── Update database ──────────────────────────────────────────────────────
async function main() {
  console.log("🖼️  Memperbarui gambar produk LUMIÈRE SKIN (ImgBB URLs)...\n");

  verifyUnique();

  const products = await prisma.product.findMany({
    select: { id: true, slug: true, name: true, imageUrl: true },
  });

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const product of products) {
    const newUrl = IMAGE_MAP[product.slug];

    if (!newUrl) {
      console.log(`⚠️  Slug tidak ada di IMAGE_MAP: "${product.slug}"`);
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
    console.log(`✅ ${product.name.substring(0, 45).padEnd(45)} → ImgBB`);
  }

  console.log("\n─────────────────────────────────────");
  console.log(`📊 Total produk   : ${products.length}`);
  console.log(`✅ Diperbarui     : ${updated}`);
  console.log(`⏩ Tidak berubah  : ${skipped}`);
  console.log(`⚠️  Slug tidak ada : ${notFound}`);
  console.log("\n🎉 Pembaruan gambar ke ImgBB selesai!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
