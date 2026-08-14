/**
 * scripts/fix-category-images.ts
 * Set imageUrl kategori ke null untuk menggunakan fallback gradient.
 * Menghilangkan error 404 dari Unsplash photo IDs yang sudah tidak aktif.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Membersihkan imageUrl kategori yang sudah tidak valid...\n");

  const categories = await prisma.category.findMany({
    select: { id: true, name: true, imageUrl: true },
  });

  let updated = 0;

  for (const cat of categories) {
    if (cat.imageUrl && cat.imageUrl.includes("unsplash.com")) {
      await prisma.category.update({
        where: { id: cat.id },
        data: { imageUrl: null },
      });
      console.log(`✅ ${cat.name} → imageUrl di-clear (gunakan fallback gradient)`);
      updated++;
    }
  }

  console.log(`\n📊 ${updated} kategori diperbarui`);
  console.log("   CategoryCard akan menampilkan gradient warna sebagai fallback.");
  await prisma.$disconnect();
}

main().catch(console.error);
