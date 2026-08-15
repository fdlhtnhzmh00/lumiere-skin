const { PrismaClient } = require("@prisma/client");
const https = require("https");
const http = require("http");

const prisma = new PrismaClient();

// Test apakah URL gambar bisa diakses
function testImageUrl(url) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith("https") ? https : http;
      const req = client.get(url, { timeout: 8000 }, (res) => {
        const ok = res.statusCode === 200;
        res.resume();
        resolve({ ok, status: res.statusCode });
      });
      req.on("timeout", () => { req.destroy(); resolve({ ok: false, status: "TIMEOUT" }); });
      req.on("error", () => resolve({ ok: false, status: "ERROR" }));
    } catch (e) {
      resolve({ ok: false, status: "EXCEPTION" });
    }
  });
}

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, slug: true, imageUrl: true },
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  console.log("Mengecek " + products.length + " gambar produk...\n");

  const broken = [];
  const working = [];

  for (const p of products) {
    const result = await testImageUrl(p.imageUrl);
    if (result.ok) {
      working.push(p);
      process.stdout.write("✓ ");
    } else {
      broken.push({ ...p, status: result.status });
      process.stdout.write("✗ ");
    }
  }

  console.log("\n\n=== HASIL AUDIT ===");
  console.log("Bekerja : " + working.length);
  console.log("Broken  : " + broken.length);

  if (broken.length > 0) {
    console.log("\n=== DAFTAR GAMBAR BROKEN ===");
    broken.forEach(function(p, i) {
      console.log((i+1) + ". " + p.name);
      console.log("   Slug : " + p.slug);
      console.log("   URL  : " + p.imageUrl);
      console.log("   Status: " + p.status);
      console.log();
    });
  }

  await prisma.$disconnect();
}

main().catch(console.error);
