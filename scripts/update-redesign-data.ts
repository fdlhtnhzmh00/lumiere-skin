/**
 * scripts/update-redesign-data.ts
 *
 * Update database untuk redesign LUMIÈRE SKIN:
 * 1. Ubah nama 10 kategori → Bahasa Inggris
 * 2. Update imageUrl setiap kategori → ImgBB
 * 3. Ubah user "Sarah Putri" → "Team 1"
 *
 * Slug TIDAK DIUBAH agar tidak merusak URL, API, dan test.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Mapping: slug → {nameEN, imageUrl} ──────────────────────
const CATEGORY_UPDATES: Record<string, { name: string; imageUrl: string }> = {
  "pembersih-wajah": {
    name: "Face Cleanser",
    imageUrl: "https://i.ibb.co/933zkpBj/71e7bd58-a7f5-401a-9042-e089487c7195.jpg",
  },
  "toner-essence": {
    name: "Toner & Essence",
    imageUrl: "https://i.ibb.co/TMHLBY4M/0af8b1ed-d276-4c32-a787-7f1103dbdd8e.jpg",
  },
  "serum-ampoule": {
    name: "Serum & Ampoule",
    imageUrl: "https://i.ibb.co/DDVWzKW7/c8919eaa-3950-4af3-9dde-d9c1d2a2dfdf.jpg",
  },
  "pelembap-krim": {
    name: "Moisturizer & Cream",
    imageUrl: "https://i.ibb.co/YB7WSCpT/ff6982f6-1586-47b3-b32c-64eb2b39c75d.jpg",
  },
  "tabir-surya": {
    name: "Sunscreen",
    imageUrl: "https://i.ibb.co/kgSfF6Ky/7a4212bd-42c1-4dbe-bf01-790519f0be6a.jpg",
  },
  "masker-wajah": {
    name: "Face Mask",
    imageUrl: "https://i.ibb.co/N2fsmW0s/ca49f977-8b1c-46ad-ac80-e898acd28c14.jpg",
  },
  "perawatan-mata": {
    name: "Eye Care",
    imageUrl: "https://i.ibb.co/DHRSJqwp/51944212-ffbb-4390-b551-60110284247f.jpg",
  },
  "perawatan-bibir": {
    name: "Lip Care",
    imageUrl: "https://i.ibb.co/svb8cfSB/d4615368-3eeb-46ae-a88c-8e3ddcc46d96.jpg",
  },
  "eksfoliator": {
    name: "Exfoliator",
    imageUrl: "https://i.ibb.co/JjHpj9bH/25a7f0c3-6c1a-4adc-97b7-3d3ea1090ff3.jpg",
  },
  "perawatan-jerawat": {
    name: "Acne Care",
    imageUrl: "https://i.ibb.co/LhC2cQGC/f30b9f74-8eb7-4c17-a233-1c62fbe271af.jpg",
  },
};

async function main() {
  console.log("🔄 Memulai update redesign database...\n");

  // ── 1. Update kategori ────────────────────────────────────────
  console.log("📂 Update nama & gambar kategori:");
  for (const [slug, data] of Object.entries(CATEGORY_UPDATES)) {
    const cat = await prisma.category.findUnique({ where: { slug } });
    if (!cat) { console.log(`  ⚠️  Slug tidak ditemukan: ${slug}`); continue; }
    await prisma.category.update({
      where: { slug },
      data: { name: data.name, imageUrl: data.imageUrl },
    });
    console.log(`  ✅ ${slug.padEnd(22)} → "${data.name}"`);
  }

  // ── 2. Update user name ───────────────────────────────────────
  console.log("\n👤 Update nama user:");
  const user = await prisma.user.findUnique({ where: { email: "user@lumiereskin.com" } });
  if (user) {
    await prisma.user.update({
      where: { email: "user@lumiereskin.com" },
      data: { name: "Team 1", username: "team1" },
    });
    console.log(`  ✅ "${user.name}" → "Team 1"  (username: ${user.username} → team1)`);
  } else {
    console.log("  ⚠️  User user@lumiereskin.com tidak ditemukan");
  }

  // ── 3. Verifikasi ─────────────────────────────────────────────
  const cats = await prisma.category.findMany({ orderBy: { name: "asc" } });
  console.log("\n✅ Verifikasi kategori setelah update:");
  cats.forEach((c) =>
    console.log(`  ${c.name.padEnd(22)} | ${c.slug.padEnd(20)} | imageUrl: ${c.imageUrl ? "✓" : "✗"}`)
  );

  const updatedUser = await prisma.user.findUnique({ where: { email: "user@lumiereskin.com" } });
  console.log(`\n✅ User: ${updatedUser?.name} (${updatedUser?.username})\n`);
  console.log("🎉 Update database selesai!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
