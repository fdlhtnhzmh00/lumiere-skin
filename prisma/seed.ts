/**
 * prisma/seed.ts
 * Seed data untuk LUMIÈRE SKIN
 * Berisi: 2 user akun, 10 kategori, 58 produk skincare
 *
 * Jalankan dengan:
 *   npm run db:seed
 * atau:
 *   npx prisma db seed
 *
 * GAMBAR PRODUK:
 * Setiap produk memiliki URL gambar Unsplash yang UNIK.
 * Menggunakan 22 foto skincare/beauty + variasi parameter crop imgix
 * (center, top, entropy, faces, dll.) sehingga setiap produk terlihat berbeda.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── 22 foto skincare/beauty dari Unsplash ───────────────────────────────
const PHOTO = {
  A: "1556228578-0d85751bab32",    // beberapa botol skincare
  B: "1556229010-6272de23c10b",    // jar krim putih
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
  M: "1571781926291-c477ebfd024b", // pink flat lay kecantikan
  N: "1556760544-74068565f05c",    // krim kecantikan
  O: "1612817288484-6f916006741a", // tabung sunscreen
  P: "1590031971-a1e963a8f5b5",    // aplikasi sunscreen
  Q: "1567721913486-6585f037b77b", // masker wajah
  R: "1556228720-195026d525f7",    // wajah perempuan
  S: "1522335789203-aabd1fc54bc9", // area mata
  T: "1543779871-82d14e37d2ab",    // lip balm
  U: "1513161455079-7dc1de15ef3e", // tekstur scrub
  V: "1556228453-6e5a9e0beb3b",    // flat lay skincare
} as const;

type PhotoKey = keyof typeof PHOTO;
type CropMode = "center" | "top" | "bottom" | "entropy" | "faces" | "left" | "right";

// Helper: URL gambar unik dengan parameter crop imgix
// Menerima PhotoKey (huruf A-V) atau Unsplash photo ID langsung
function img(keyOrId: PhotoKey | string, crop: CropMode = "center"): string {
  // Jika keyOrId ada di PHOTO (single huruf A-V), resolve ke ID
  // Jika tidak, gunakan langsung sebagai Unsplash photo ID
  const photoId = keyOrId in PHOTO
    ? PHOTO[keyOrId as PhotoKey]
    : keyOrId;
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&crop=${crop}&w=500&h=500&q=80`;
}

async function main() {
  console.log("🌱 Memulai proses seeding database LUMIÈRE SKIN...");

  // ============================================================
  // BERSIHKAN DATA LAMA (urutan penting: hapus child dulu)
  // ============================================================
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Data lama berhasil dihapus");

  // ============================================================
  // BUAT USER AKUN
  // ============================================================
  const passwordUser = await bcrypt.hash("Lumiere123!", 10);
  const passwordAdmin = await bcrypt.hash("Admin123!", 10);

  const userAccount = await prisma.user.create({
    data: {
      email: "user@lumiereskin.com",
      username: "team1",
      password: passwordUser,
      name: "Team 1",
    },
  });

  const adminAccount = await prisma.user.create({
    data: {
      email: "admin@lumiereskin.com",
      username: "admin",
      password: passwordAdmin,
      name: "Admin LUMIÈRE SKIN",
    },
  });

  console.log(`✅ User dibuat: ${userAccount.email}`);
  console.log(`✅ Admin dibuat: ${adminAccount.email}`);

  // ============================================================
  // BUAT KATEGORI (10 kategori)
  // ============================================================
  const categoryData = [
    {
      name: "Face Cleanser",
      slug: "pembersih-wajah",
      description: "Gentle cleansers that remove dirt, oil, and makeup without stripping your skin",
      imageUrl: "https://i.ibb.co/933zkpBj/71e7bd58-a7f5-401a-9042-e089487c7195.jpg",
    },
    {
      name: "Toner & Essence",
      slug: "toner-essence",
      description: "Balance skin pH and deliver the first layer of hydration after cleansing",
      imageUrl: "https://i.ibb.co/TMHLBY4M/0af8b1ed-d276-4c32-a787-7f1103dbdd8e.jpg",
    },
    {
      name: "Serum & Ampoule",
      slug: "serum-ampoule",
      description: "Concentrated treatments to target specific skin concerns effectively",
      imageUrl: "https://i.ibb.co/DDVWzKW7/c8919eaa-3950-4af3-9dde-d9c1d2a2dfdf.jpg",
    },
    {
      name: "Moisturizer & Cream",
      slug: "pelembap-krim",
      description: "Lock in moisture and protect the skin barrier throughout the day",
      imageUrl: "https://i.ibb.co/YB7WSCpT/ff6982f6-1586-47b3-b32c-64eb2b39c75d.jpg",
    },
    {
      name: "Sunscreen",
      slug: "tabir-surya",
      description: "Protect skin from UV damage that causes premature aging and dark spots",
      imageUrl: "https://i.ibb.co/kgSfF6Ky/7a4212bd-42c1-4dbe-bf01-790519f0be6a.jpg",
    },
    {
      name: "Face Mask",
      slug: "masker-wajah",
      description: "Weekly intensive treatments for brighter, cleaner, deeply hydrated skin",
      imageUrl: "https://i.ibb.co/N2fsmW0s/ca49f977-8b1c-46ad-ac80-e898acd28c14.jpg",
    },
    {
      name: "Eye Care",
      slug: "perawatan-mata",
      description: "Targeted products for dark circles, puffiness, and fine lines around the eye area",
      imageUrl: "https://i.ibb.co/DHRSJqwp/51944212-ffbb-4390-b551-60110284247f.jpg",
    },
    {
      name: "Lip Care",
      slug: "perawatan-bibir",
      description: "Nourish, hydrate, and protect your lips for a healthy, soft pout",
      imageUrl: "https://i.ibb.co/svb8cfSB/d4615368-3eeb-46ae-a88c-8e3ddcc46d96.jpg",
    },
    {
      name: "Exfoliator",
      slug: "eksfoliator",
      description: "Remove dead skin cells for a brighter, smoother, and cleaner complexion",
      imageUrl: "https://i.ibb.co/JjHpj9bH/25a7f0c3-6c1a-4adc-97b7-3d3ea1090ff3.jpg",
    },
    {
      name: "Acne Care",
      slug: "perawatan-jerawat",
      description: "Specialized products for acne-prone, oily, and blemish-prone skin types",
      imageUrl: "https://i.ibb.co/LhC2cQGC/f30b9f74-8eb7-4c17-a233-1c62fbe271af.jpg",
    },
  ];

  for (const cat of categoryData) {
    await prisma.category.create({ data: cat });
  }
  console.log(`✅ ${categoryData.length} kategori berhasil dibuat`);

  // Ambil semua kategori dan buat mapping slug -> id
  const categories = await prisma.category.findMany();
  const catMap: Record<string, string> = {};
  for (const cat of categories) {
    catMap[cat.slug] = cat.id;
  }

  // ============================================================
  // BUAT PRODUK (62 produk)
  // ============================================================

  const products = [
    // ===========================
    // PEMBERSIH WAJAH (6 produk)
    // ===========================
    {
      name: "Glow Gentle Foam Cleanser",
      slug: "glow-gentle-foam-cleanser",
      description: "Pembersih wajah berbusa lembut yang membersihkan kotoran dan minyak berlebih tanpa membuat kulit terasa kering. Diformulasikan dengan ekstrak green tea dan aloe vera.",
      ingredients: "Water, Glycerin, Cocamidopropyl Betaine, Sodium Laureth Sulfate, Camellia Sinensis Leaf Extract, Aloe Barbadensis Leaf Juice, Panthenol, Allantoin, Citric Acid",
      skinType: "Semua Jenis Kulit",
      howToUse: "Basahi wajah, tuang produk secukupnya, pijat lembut dengan gerakan melingkar selama 30-60 detik, bilas dengan air bersih. Gunakan pagi dan malam.",
      price: 145000,
      stock: 50,
      imageUrl: img("1556228578-0d85751bab32"),
      categoryId: catMap["pembersih-wajah"],
    },
    {
      name: "Pure Balance Micellar Cleanser",
      slug: "pure-balance-micellar-cleanser",
      description: "Micellar water pembersih yang mampu mengangkat sisa makeup, kotoran, dan minyak dalam satu langkah tanpa perlu dibilas. Cocok sebagai first cleanser.",
      ingredients: "Aqua, Hexylene Glycol, Glycerin, Poloxamer 184, Disodium EDTA, Panthenol, Chamomilla Recutita Flower Extract, Sodium Benzoate",
      skinType: "Semua Jenis Kulit",
      howToUse: "Tuang secukupnya pada kapas, usapkan perlahan ke seluruh wajah dan area mata hingga bersih. Dapat digunakan tanpa bilas.",
      price: 120000,
      stock: 45,
      imageUrl: img("1556229010-6272de23c10b"),
      categoryId: catMap["pembersih-wajah"],
    },
    {
      name: "Radiance Rice Powder Cleanser",
      slug: "radiance-rice-powder-cleanser",
      description: "Pembersih bubuk beras yang efektif mengelupas sel kulit mati sambil membersihkan wajah. Memberikan efek cerah alami setelah penggunaan rutin.",
      ingredients: "Oryza Sativa (Rice) Starch, Kaolin, Sodium Cocoyl Isethionate, Glycerin, Oryza Sativa Bran Extract, Niacinamide, Allantoin",
      skinType: "Normal, Kombinasi, Berminyak",
      howToUse: "Ambil sejumput bubuk, campurkan dengan sedikit air di telapak tangan hingga membentuk pasta, pijat lembut ke wajah lalu bilas.",
      price: 98000,
      stock: 60,
      imageUrl: img("1527799820374-dcf8d9d4a388"),
      categoryId: catMap["pembersih-wajah"],
    },
    {
      name: "Lumière Deep Cleanse Gel",
      slug: "lumiere-deep-cleanse-gel",
      description: "Gel pembersih deep cleansing dengan teknologi micro-bubble yang mampu membersihkan pori-pori secara mendalam. Mengandung salicylic acid untuk kulit lebih bersih.",
      ingredients: "Water, Glycerin, Sodium PCA, Salicylic Acid 0.5%, Zinc PCA, Tea Tree Leaf Oil, Niacinamide, Panthenol, Allantoin",
      skinType: "Berminyak, Berjerawat, Kombinasi",
      howToUse: "Basahi wajah, aplikasikan gel dan pijat membentuk busa selama 60 detik. Fokus pada area T-zone. Bilas bersih dengan air.",
      price: 165000,
      stock: 35,
      imageUrl: img("1583209814683-c023dd293cc6"),
      categoryId: catMap["pembersih-wajah"],
    },
    {
      name: "Velvet Cloud Cream Cleanser",
      slug: "velvet-cloud-cream-cleanser",
      description: "Pembersih tekstur krim mewah yang membersihkan sekaligus menutrisi kulit. Dilengkapi dengan shea butter dan ceramide untuk menjaga kelembapan kulit sensitif.",
      ingredients: "Water, Cetearyl Alcohol, Glycerin, Butyrospermum Parkii (Shea) Butter, Ceramide NP, Sodium PCA, Rosa Damascena Flower Water, Allantoin",
      skinType: "Kering, Sensitif, Normal",
      howToUse: "Pijat krim ke wajah kering atau lembap dengan gerakan melingkar. Bilas dengan air hangat atau angkat dengan waslap lembap.",
      price: 135000,
      stock: 40,
      imageUrl: img("1616394584738-fc6e612e71b9"),
      categoryId: catMap["pembersih-wajah"],
    },
    {
      name: "Botanical Purifying Foam Wash",
      slug: "botanical-purifying-foam-wash",
      description: "Sabun wajah berbusa dengan formulasi botanical yang kaya antioksidan. Mengangkat kotoran dan polusi harian tanpa mengganggu skin barrier.",
      ingredients: "Water, Sodium Laureth Sulfate, Cocamidopropyl Betaine, Camellia Japonica Leaf Extract, Green Tea Extract, Vitamin E, Hyaluronic Acid, Citric Acid",
      skinType: "Normal, Kombinasi",
      howToUse: "Keluarkan foam secukupnya, aplikasikan ke wajah yang sudah dibasahi, pijat lembut, bilas hingga bersih.",
      price: 110000,
      stock: 55,
      imageUrl: img("1570172619644-a2b5aecde81a"),
      categoryId: catMap["pembersih-wajah"],
    },

    // ===========================
    // TONER & ESSENCE (6 produk)
    // ===========================
    {
      name: "Hydra Boost Hydrating Toner",
      slug: "hydra-boost-hydrating-toner",
      description: "Toner hidrasi intensif dengan kandungan hyaluronic acid 3-molecular weight yang menembus lapisan kulit untuk hidrasi dari dalam. Tekstur ringan dan cepat meresap.",
      ingredients: "Water, Butylene Glycol, Glycerin, Hyaluronic Acid, Sodium Hyaluronate, Panthenol, Centella Asiatica Extract, Allantoin, Betaine",
      skinType: "Kering, Normal, Sensitif",
      howToUse: "Tuangkan ke telapak tangan atau kapas, tepuk-tepuk lembut ke seluruh wajah setelah cleansing. Gunakan 2-3 lapis untuk hidrasi maksimal.",
      price: 155000,
      stock: 50,
      imageUrl: img("1574182245530-967d9b3831af"),
      categoryId: catMap["toner-essence"],
    },
    {
      name: "Brightening Rose Water Toner",
      slug: "brightening-rose-water-toner",
      description: "Toner air mawar yang mencerahkan dan menyegarkan kulit. Kandungan rose extract dan vitamin C bekerja sinergis untuk tampilan kulit lebih cerah dan merata.",
      ingredients: "Rosa Damascena Flower Water, Glycerin, Niacinamide, Ascorbic Acid, Sodium Ascorbyl Phosphate, Panthenol, Allantoin, Phenoxyethanol",
      skinType: "Semua Jenis Kulit",
      howToUse: "Setelah membersihkan wajah, semprotkan langsung ke wajah atau gunakan kapas untuk mengaplikasikan secara merata.",
      price: 175000,
      stock: 40,
      imageUrl: img("1585751119851-b1ead7e4e9cb"),
      categoryId: catMap["toner-essence"],
    },
    {
      name: "Clear Skin AHA Toner",
      slug: "clear-skin-aha-toner",
      description: "Toner eksfoliasi ringan dengan Glycolic Acid 5% untuk mengangkat sel kulit mati dan mempercepat regenerasi kulit. Kulit tampak lebih cerah dan halus dalam 2 minggu.",
      ingredients: "Water, Glycolic Acid 5%, Lactic Acid 2%, Aloe Barbadensis Leaf Juice, Glycerin, Sodium PCA, Green Tea Extract, Allantoin",
      skinType: "Normal, Berminyak, Kombinasi",
      howToUse: "Gunakan malam hari. Oleskan ke wajah menggunakan kapas setelah membersihkan wajah. Hindari area mata. Selalu gunakan sunscreen di pagi hari.",
      price: 195000,
      stock: 30,
      imageUrl: img("1556228578-0d85751bab32"),
      categoryId: catMap["toner-essence"],
    },
    {
      name: "Dewdrop Hydrating Essence",
      slug: "dewdrop-hydrating-essence",
      description: "Essence bertekstur air ringan yang kaya dengan fermented ingredients untuk meningkatkan daya serap produk selanjutnya. Memberikan efek glowing natural.",
      ingredients: "Saccharomyces Ferment Filtrate, Bifida Ferment Lysate, Galactomyces Ferment Filtrate, Glycerin, Niacinamide, Centella Asiatica, Hyaluronic Acid",
      skinType: "Semua Jenis Kulit",
      howToUse: "Tepuk-tepuk ringan ke seluruh wajah dan leher setelah toner. Digunakan sebelum serum dan pelembap.",
      price: 220000,
      stock: 25,
      imageUrl: img("1598440947619-2c35fc9aa908"),
      categoryId: catMap["toner-essence"],
    },
    {
      name: "Balance pH Gentle Toner",
      slug: "balance-ph-gentle-toner",
      description: "Toner formulasi gentle untuk menyeimbangkan pH kulit setelah pembersihan. Tanpa alkohol, cocok untuk kulit sensitif dan mudah merah.",
      ingredients: "Water, Glycerin, Panthenol, Betaine, Allantoin, Chamomilla Recutita Extract, Calendula Officinalis Extract, Sodium PCA, Citric Acid",
      skinType: "Sensitif, Kering, Normal",
      howToUse: "Tuangkan ke kapas lembut, usapkan ke seluruh wajah dengan gerakan ke atas. Gunakan setelah pembersih wajah.",
      price: 130000,
      stock: 60,
      imageUrl: img("1606830733744-0ad0b9b3c4f5"),
      categoryId: catMap["toner-essence"],
    },
    {
      name: "Fermented Rice Glow Essence",
      slug: "fermented-rice-glow-essence",
      description: "Essence premium dengan 70% fermented rice water yang telah terbukti secara ilmiah mencerahkan dan melembapkan kulit. Terinspirasi dari ritual kecantikan tradisional Asia.",
      ingredients: "Oryza Sativa (Rice) Ferment Filtrate 70%, Saccharomyces Ferment Filtrate, Glycerin, Niacinamide, Beta-Glucan, Panthenol, Sodium Hyaluronate",
      skinType: "Semua Jenis Kulit",
      howToUse: "Tepuk-tepukkan ke kulit dengan telapak tangan hangat untuk memaksimalkan penyerapan. Gunakan 2-3 lapis jika diinginkan.",
      price: 245000,
      stock: 20,
      imageUrl: img("1616394584738-fc6e612e71b9"),
      categoryId: catMap["toner-essence"],
    },

    // ===========================
    // SERUM & AMPOULE (7 produk)
    // ===========================
    {
      name: "Vitamin C Brightening Serum",
      slug: "vitamin-c-brightening-serum",
      description: "Serum vitamin C stabil dengan formula 15% L-Ascorbic Acid yang efektif memudarkan noda hitam dan hiperpigmentasi. Kulit tampak cerah dan merata dalam 4 minggu pemakaian.",
      ingredients: "Water, L-Ascorbic Acid 15%, Vitamin E, Ferulic Acid, Hyaluronic Acid, Glycerin, Panthenol, Niacinamide, Zinc Sulfate",
      skinType: "Normal, Kombinasi, Berminyak",
      howToUse: "Aplikasikan 3-4 tetes ke wajah pagi hari setelah toner. Tunggu meresap sebelum melanjutkan skincare routine. Selalu gunakan sunscreen.",
      price: 295000,
      stock: 35,
      imageUrl: img("1598440947619-2c35fc9aa908"),
      categoryId: catMap["serum-ampoule"],
    },
    {
      name: "Retinol Renewal Night Serum",
      slug: "retinol-renewal-night-serum",
      description: "Serum retinol 0.3% yang membantu mempercepat pergantian sel kulit, mengurangi garis halus, dan memperbaiki tekstur kulit. Formulasi buffered untuk meminimalkan iritasi.",
      ingredients: "Water, Retinol 0.3%, Glycerin, Squalane, Niacinamide, Peptide Complex, Hyaluronic Acid, Tocopherol, Bisabolol, Allantoin",
      skinType: "Normal, Kombinasi, Berminyak",
      howToUse: "Gunakan malam hari saja. Mulai 2-3x seminggu, tingkatkan secara bertahap. Selalu gunakan sunscreen di pagi hari.",
      price: 345000,
      stock: 20,
      imageUrl: img("1585751119851-b1ead7e4e9cb"),
      categoryId: catMap["serum-ampoule"],
    },
    {
      name: "Hyaluronic Acid Deep Hydration Serum",
      slug: "hyaluronic-acid-deep-hydration-serum",
      description: "Serum hidrasi dengan 3 molekul hyaluronic acid berbeda ukuran yang menembus setiap lapisan kulit untuk hidrasi mendalam dan tahan lama hingga 72 jam.",
      ingredients: "Water, Sodium Hyaluronate, Hyaluronic Acid, Hydrolyzed Hyaluronic Acid, Glycerin, Panthenol, Centella Asiatica, Allantoin, Betaine",
      skinType: "Kering, Normal, Sensitif",
      howToUse: "Aplikasikan 2-3 tetes ke wajah yang masih lembap setelah toner. Pat hingga meresap. Gunakan pagi dan malam.",
      price: 255000,
      stock: 40,
      imageUrl: img("1571781926291-c477ebfd024b"),
      categoryId: catMap["serum-ampoule"],
    },
    {
      name: "Niacinamide 10% Pore Serum",
      slug: "niacinamide-10-pore-serum",
      description: "Serum niacinamide 10% dengan zinc PCA untuk mengecilkan pori-pori, mengontrol produksi sebum, dan mencerahkan kulit secara bertahap.",
      ingredients: "Water, Niacinamide 10%, Zinc PCA 1%, Glycerin, Panthenol, Allantoin, Hyaluronic Acid, Sodium PCA",
      skinType: "Berminyak, Kombinasi, Berjerawat",
      howToUse: "Aplikasikan 3-4 tetes ke wajah setelah toner. Dapat digunakan pagi dan malam. Cocok digunakan bersama hyaluronic acid.",
      price: 185000,
      stock: 55,
      imageUrl: img("1583209814683-c023dd293cc6"),
      categoryId: catMap["serum-ampoule"],
    },
    {
      name: "Peptide Firming Ampoule",
      slug: "peptide-firming-ampoule",
      description: "Ampoule premium dengan 5 jenis peptide aktif untuk meningkatkan produksi kolagen, mengencangkan kulit, dan mengurangi tanda-tanda penuaan secara visible.",
      ingredients: "Water, Acetyl Hexapeptide-3, Palmitoyl Tripeptide-1, Palmitoyl Tetrapeptide-7, Copper Tripeptide-1, Leuphasyl, Glycerin, Hyaluronic Acid, Squalane",
      skinType: "Kering, Normal, Semua Jenis Kulit",
      howToUse: "Gunakan 1 ampul per minggu atau aplikasikan 2-3 tetes setiap malam. Pat ke wajah dan leher hingga meresap.",
      price: 385000,
      stock: 15,
      imageUrl: img("1627819476-c023dd293cc6"),
      categoryId: catMap["serum-ampoule"],
    },
    {
      name: "Glow Essence Brightening Serum",
      slug: "glow-essence-brightening-serum",
      description: "Serum pencerah dengan kombinasi alpha arbutin, kojic acid, dan tranexamic acid untuk memudarkan hiperpigmentasi dan memberikan efek glow dari dalam.",
      ingredients: "Water, Alpha Arbutin 2%, Tranexamic Acid, Kojic Acid, Niacinamide, Glycerin, Vitamin C Derivative, Hyaluronic Acid, Allantoin",
      skinType: "Semua Jenis Kulit",
      howToUse: "Aplikasikan 2-3 tetes setelah toner, fokus pada area gelap atau noda. Gunakan pagi dan malam hari.",
      price: 265000,
      stock: 30,
      imageUrl: img("1556760544-74068565f05c"),
      categoryId: catMap["serum-ampoule"],
    },
    {
      name: "Centella Asiatica Calm Serum",
      slug: "centella-asiatica-calm-serum",
      description: "Serum centella asiatica 70% untuk menenangkan kulit iritasi, kemerahan, dan sensitif. Ideal setelah prosedur kecantikan atau saat kulit sedang dalam kondisi sensitif.",
      ingredients: "Centella Asiatica Extract 70%, Madecassoside, Asiaticoside, Asiatic Acid, Glycerin, Panthenol, Allantoin, Bisabolol, Ceramide NP",
      skinType: "Sensitif, Berjerawat, Semua Jenis Kulit",
      howToUse: "Aplikasikan ke seluruh wajah atau area yang memerlukannya setelah toner. Tepuk-tepuk hingga meresap sempurna.",
      price: 225000,
      stock: 45,
      imageUrl: img("1527799820374-dcf8d9d4a388"),
      categoryId: catMap["serum-ampoule"],
    },

    // ===========================
    // PELEMBAP & KRIM (6 produk)
    // ===========================
    {
      name: "Luminous Day Cream SPF15",
      slug: "luminous-day-cream-spf15",
      description: "Pelembap siang hari ringan dengan SPF15 yang memberikan perlindungan UV sekaligus menjaga kelembapan kulit sepanjang hari. Tekstur ringan tidak meninggalkan white cast.",
      ingredients: "Water, Glycerin, Dimethicone, Niacinamide, Hyaluronic Acid, Titanium Dioxide (SPF15), Vitamin E, Green Tea Extract, Ceramide NP",
      skinType: "Normal, Kombinasi",
      howToUse: "Aplikasikan secukupnya ke wajah dan leher sebagai tahap terakhir skincare pagi. Gunakan sebelum makeup.",
      price: 210000,
      stock: 40,
      imageUrl: img("1608248543803-ba4f8c70ae0b"),
      categoryId: catMap["pelembap-krim"],
    },
    {
      name: "Hydra Rich Night Repair Cream",
      slug: "hydra-rich-night-repair-cream",
      description: "Krim malam ultra-rich yang bekerja optimal saat kulit beristirahat untuk memperbaiki dan memperbarui sel kulit. Kandungan retinol ringan dan peptide untuk anti-aging.",
      ingredients: "Water, Shea Butter, Glycerin, Squalane, Retinyl Palmitate, Peptide Complex, Hyaluronic Acid, Ceramide NP, Niacinamide, Vitamin E",
      skinType: "Kering, Normal",
      howToUse: "Aplikasikan secukupnya ke wajah dan leher sebagai langkah terakhir skincare malam. Gunakan sebagai sleeping mask seminggu sekali untuk hasil optimal.",
      price: 275000,
      stock: 25,
      imageUrl: img("1606830733744-0ad0b9b3c4f5"),
      categoryId: catMap["pelembap-krim"],
    },
    {
      name: "Dewy Glow Gel Moisturizer",
      slug: "dewy-glow-gel-moisturizer",
      description: "Pelembap gel berbasis air ringan yang memberikan hidrasi intens tanpa rasa berminyak. Formula water-burst memberikan efek dewy glow yang tahan lama.",
      ingredients: "Water, Glycerin, Betaine, Hyaluronic Acid, Niacinamide, Panthenol, Aloe Vera, Centella Asiatica, Allantoin",
      skinType: "Berminyak, Kombinasi, Normal",
      howToUse: "Aplikasikan secara merata ke wajah dan leher. Gunakan setelah serum. Cocok untuk pagi dan malam hari.",
      price: 185000,
      stock: 50,
      imageUrl: img("1556228578-0d85751bab32"),
      categoryId: catMap["pelembap-krim"],
    },
    {
      name: "Barrier Repair Intensive Cream",
      slug: "barrier-repair-intensive-cream",
      description: "Krim repair intensif untuk memulihkan skin barrier yang rusak akibat over-exfoliation atau lingkungan. Kaya ceramide, cholesterol, dan fatty acid dalam rasio optimal.",
      ingredients: "Water, Ceramide NP, Ceramide AP, Ceramide EOP, Cholesterol, Fatty Acids, Glycerin, Niacinamide, Panthenol, Hyaluronic Acid",
      skinType: "Kering, Sensitif, Rusak",
      howToUse: "Oleskan lapisan tipis ke seluruh wajah kapanpun kulit terasa kering atau iritasi. Dapat digunakan pagi dan malam.",
      price: 320000,
      stock: 20,
      imageUrl: img("1571781926291-c477ebfd024b"),
      categoryId: catMap["pelembap-krim"],
    },
    {
      name: "Water Burst Lightweight Moisturizer",
      slug: "water-burst-lightweight-moisturizer",
      description: "Pelembap ringan dengan teknologi water-burst yang memberikan sensasi dingin dan segar saat diaplikasikan. Formula oil-free cocok untuk iklim tropis.",
      ingredients: "Water, Glycerin, Sodium PCA, Hyaluronic Acid, Aloe Vera, Green Tea Extract, Niacinamide, Allantoin, Panthenol",
      skinType: "Berminyak, Kombinasi, Normal",
      howToUse: "Gunakan setelah toner dan serum. Tepuk-tepuk ke seluruh wajah hingga meresap. Ideal untuk penggunaan pagi hari.",
      price: 165000,
      stock: 60,
      imageUrl: img("1616394584738-fc6e612e71b9"),
      categoryId: catMap["pelembap-krim"],
    },
    {
      name: "Nutri-Glow Face Butter",
      slug: "nutri-glow-face-butter",
      description: "Face butter ultra-nourishing dengan shea butter, argan oil, dan rosehip oil untuk kulit sangat kering dan kusam. Memberikan nutrisi mendalam dan kilau sehat yang natural.",
      ingredients: "Butyrospermum Parkii (Shea) Butter, Argania Spinosa Kernel Oil, Rosa Canina Fruit Oil, Glycerin, Squalane, Vitamin E, Coenzyme Q10, Retinyl Palmitate",
      skinType: "Sangat Kering, Kering",
      howToUse: "Hangatkan sedikit produk di telapak tangan, aplikasikan ke wajah dengan gerakan memijat ke atas. Gunakan malam hari untuk hasil terbaik.",
      price: 245000,
      stock: 30,
      imageUrl: img("1583209814683-c023dd293cc6"),
      categoryId: catMap["pelembap-krim"],
    },

    // ===========================
    // TABIR SURYA (6 produk)
    // ===========================
    {
      name: "Invisible Shield Sunscreen SPF50 PA+++",
      slug: "invisible-shield-sunscreen-spf50-pa",
      description: "Sunscreen chemical ringan dengan SPF50 PA+++ yang tidak meninggalkan white cast. Formula invisible cocok digunakan di bawah makeup untuk perlindungan harian.",
      ingredients: "Water, Ethylhexyl Methoxycinnamate, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Glycerin, Niacinamide, Hyaluronic Acid, Aloe Vera",
      skinType: "Berminyak, Kombinasi, Normal",
      howToUse: "Aplikasikan secukupnya (2mg/cm²) ke seluruh wajah dan leher 15 menit sebelum terpapar sinar matahari. Reaplikasikan setiap 2-3 jam.",
      price: 185000,
      stock: 45,
      imageUrl: img("1590031971-a1e963a8f5b5"),
      categoryId: catMap["tabir-surya"],
    },
    {
      name: "Glow Protect Serum Sunscreen SPF30",
      slug: "glow-protect-serum-sunscreen-spf30",
      description: "Sunscreen bertekstur serum ringan dengan kandungan brightening untuk perlindungan UV sekaligus merawat dan mencerahkan kulit. Finish dewy yang cantik.",
      ingredients: "Water, Zinc Oxide, Titanium Dioxide, Glycerin, Niacinamide, Vitamin C Derivative, Hyaluronic Acid, Polyglutamic Acid, Centella Asiatica",
      skinType: "Semua Jenis Kulit",
      howToUse: "Gunakan sebagai langkah terakhir skincare pagi. Aplikasikan ke wajah dan leher dengan menepuk-tepuk hingga rata.",
      price: 210000,
      stock: 35,
      imageUrl: img("1612817288484-6f916006741a"),
      categoryId: catMap["tabir-surya"],
    },
    {
      name: "Mineral Sun Filter SPF50+",
      slug: "mineral-sun-filter-spf50-plus",
      description: "Sunscreen mineral dengan zinc oxide dan titanium dioxide untuk perlindungan broad spectrum SPF50+. Formulasi gentle cocok untuk kulit sensitif dan baru melakukan prosedur.",
      ingredients: "Zinc Oxide 12%, Titanium Dioxide 5%, Water, Glycerin, Aloe Vera, Centella Asiatica, Allantoin, Panthenol, Ceramide NP",
      skinType: "Sensitif, Kering, Semua Jenis Kulit",
      howToUse: "Shake sebelum digunakan. Aplikasikan secukupnya 15 menit sebelum aktivitas outdoor. Reaplikasikan secara teratur.",
      price: 225000,
      stock: 30,
      imageUrl: img("1556229010-6272de23c10b"),
      categoryId: catMap["tabir-surya"],
    },
    {
      name: "Daily UV Veil SPF50 PA++++",
      slug: "daily-uv-veil-spf50-pa-4",
      description: "Sunscreen premium dengan rating PA++++ untuk perlindungan UVA terlengkap. Tekstur veil ultra-ringan yang hampir tidak terasa di kulit dengan hasil akhir matte natural.",
      ingredients: "Water, Uvinul A Plus, Tinosorb S, Uvinul T 150, Glycerin, Dimethicone, Niacinamide, Silica, Hyaluronic Acid",
      skinType: "Berminyak, Kombinasi",
      howToUse: "Kocok botol sebelum digunakan. Gunakan sebagai langkah terakhir skincare. Untuk perlindungan optimal, reaplikasikan setiap 2 jam.",
      price: 245000,
      stock: 40,
      imageUrl: img("1590031971-a1e963a8f5b5"),
      categoryId: catMap["tabir-surya"],
    },
    {
      name: "Tinted Skin Protection SPF40",
      slug: "tinted-skin-protection-spf40",
      description: "Sunscreen tinted dengan SPF40 yang memberikan perlindungan UV sekaligus meratakan warna kulit. Hadir dalam 3 shade universal yang cocok untuk berbagai warna kulit.",
      ingredients: "Water, Iron Oxides, Zinc Oxide, Titanium Dioxide, Glycerin, Niacinamide, Hyaluronic Acid, Vitamin E, Allantoin",
      skinType: "Semua Jenis Kulit",
      howToUse: "Oleskan secara merata ke seluruh wajah setelah skincare routine. Dapat digunakan sebagai pengganti foundation ringan.",
      price: 195000,
      stock: 25,
      imageUrl: img("1612817288484-6f916006741a"),
      categoryId: catMap["tabir-surya"],
    },
    {
      name: "Portable Sunscreen Stick SPF50",
      slug: "portable-sunscreen-stick-spf50",
      description: "Sunscreen dalam bentuk stick praktis untuk reaplikasi di siang hari tanpa mengotori tangan. SPF50 dengan formula water-resistant cocok untuk aktivitas luar ruangan.",
      ingredients: "Ethylhexyl Methoxycinnamate, Zinc Oxide, Butylene Glycol, Dimethicone, Microcrystalline Wax, Candelilla Cera, Vitamin E",
      skinType: "Semua Jenis Kulit",
      howToUse: "Oleskan langsung ke kulit wajah atau area yang terpapar sinar matahari. Ideal untuk reaplikasi di atas makeup.",
      price: 115000,
      stock: 50,
      imageUrl: img("1527799820374-dcf8d9d4a388"),
      categoryId: catMap["tabir-surya"],
    },

    // ===========================
    // MASKER WAJAH (6 produk)
    // ===========================
    {
      name: "Radiance Glow Sheet Mask",
      slug: "radiance-glow-sheet-mask",
      description: "Sheet mask perawatan intensif dengan essence kaya vitamin C dan niacinamide untuk wajah lebih cerah dan bercahaya dalam sekali pemakaian.",
      ingredients: "Water, Glycerin, Niacinamide, Ascorbyl Glucoside, Hyaluronic Acid, Centella Asiatica, Panthenol, Allantoin",
      skinType: "Semua Jenis Kulit",
      howToUse: "Bersihkan wajah, gunakan toner, lalu tempelkan sheet mask selama 15-20 menit. Lepaskan dan tepuk sisa essence hingga meresap. Gunakan 2-3x seminggu.",
      price: 35000,
      stock: 100,
      imageUrl: img("1571781926291-c477ebfd024b"),
      categoryId: catMap["masker-wajah"],
    },
    {
      name: "Charcoal Purifying Clay Mask",
      slug: "charcoal-purifying-clay-mask",
      description: "Clay mask dengan activated charcoal dan kaolin clay yang efektif menyedot kotoran dari pori-pori, mengontrol minyak berlebih, dan memberikan kulit tampak lebih halus.",
      ingredients: "Kaolin, Bentonite, Activated Charcoal, Glycerin, Tea Tree Oil, Salicylic Acid 0.5%, Aloe Vera, Allantoin",
      skinType: "Berminyak, Kombinasi, Berjerawat",
      howToUse: "Aplikasikan lapisan tipis ke wajah yang bersih, hindari area mata dan bibir. Tunggu 10-15 menit hingga mengering. Bilas dengan air hangat.",
      price: 125000,
      stock: 40,
      imageUrl: img("1567721913486-6585f037b77b"),
      categoryId: catMap["masker-wajah"],
    },
    {
      name: "Honey Glow Sleeping Mask",
      slug: "honey-glow-sleeping-mask",
      description: "Sleeping mask dengan madu Manuka dan royal jelly yang menutrisi dan memperbarui kulit sepanjang malam. Bangun dengan kulit terasa lebih lembut, cerah, dan terhidrasi.",
      ingredients: "Water, Honey Extract, Royal Jelly Extract, Glycerin, Hyaluronic Acid, Niacinamide, Panthenol, Squalane, Allantoin",
      skinType: "Kering, Normal, Kombinasi",
      howToUse: "Gunakan sebagai langkah terakhir skincare malam. Oleskan lapisan tipis ke seluruh wajah dan biarkan semalaman. Bilas keesokan paginya.",
      price: 155000,
      stock: 35,
      imageUrl: img("1574182245530-967d9b3831af"),
      categoryId: catMap["masker-wajah"],
    },
    {
      name: "AHA Brightening Peel-Off Mask",
      slug: "aha-brightening-peel-off-mask",
      description: "Peel-off mask dengan AHA yang mengeksfoliasi dan mencerahkan kulit. Setelah dikelupas, kulit tampak lebih cerah, halus, dan pori-pori tampak mengecil.",
      ingredients: "Water, Glycolic Acid 3%, Polyvinyl Alcohol, Niacinamide, Vitamin C Derivative, Hyaluronic Acid, Glycerin, Allantoin",
      skinType: "Normal, Kombinasi, Berminyak",
      howToUse: "Aplikasikan lapisan merata ke wajah bersih, hindari area rambut, alis, dan mata. Tunggu 15-20 menit hingga kering sempurna, kelupas dari bawah ke atas.",
      price: 145000,
      stock: 30,
      imageUrl: img("1556228578-0d85751bab32"),
      categoryId: catMap["masker-wajah"],
    },
    {
      name: "Rose Petal Hydrogel Mask",
      slug: "rose-petal-hydrogel-mask",
      description: "Hydrogel mask premium bertekstur lembut seperti jelly yang memberikan hidrasi intensif dan menenangkan kulit iritasi. Dilengkapi ekstrak kelopak mawar dan kolagen.",
      ingredients: "Water, Sodium Polyacrylate, Rose Water, Hydrolyzed Collagen, Hyaluronic Acid, Niacinamide, Panthenol, Rosa Damascena Flower Extract",
      skinType: "Semua Jenis Kulit",
      howToUse: "Tempelkan hydrogel mask ke wajah yang bersih selama 20-30 menit. Lepaskan dan tepuk sisa essence. Dapat disimpan di kulkas untuk efek cooling.",
      price: 55000,
      stock: 80,
      imageUrl: img("1598440947619-2c35fc9aa908"),
      categoryId: catMap["masker-wajah"],
    },
    {
      name: "Green Tea Soothing Clay Mask",
      slug: "green-tea-soothing-clay-mask",
      description: "Clay mask yang menenangkan dengan kandungan green tea tinggi antioksidan. Membersihkan pori-pori sekaligus meredakan kemerahan dan inflamasi pada kulit sensitif.",
      ingredients: "Kaolin, Camellia Sinensis Leaf Extract 5%, Glycerin, Panthenol, Allantoin, Centella Asiatica, Aloe Vera, Chamomile Extract",
      skinType: "Sensitif, Kombinasi, Normal",
      howToUse: "Oleskan ke wajah bersih selama 10-15 menit. Bilas dengan air dingin untuk meningkatkan efek menenangkan.",
      price: 98000,
      stock: 50,
      imageUrl: img("1608248543803-ba4f8c70ae0b"),
      categoryId: catMap["masker-wajah"],
    },

    // ===========================
    // PERAWATAN MATA (5 produk)
    // ===========================
    {
      name: "Caffeine De-Puff Eye Serum",
      slug: "caffeine-de-puff-eye-serum",
      description: "Serum mata dengan kandungan kafein tinggi untuk mengurangi kantung mata dan mata bengkak secara cepat. Diperkaya peptide untuk memudarkan lingkaran gelap.",
      ingredients: "Water, Caffeine 5%, Palmitoyl Pentapeptide-4, Hyaluronic Acid, Glycerin, Niacinamide, Vitamin K, Allantoin, Panthenol",
      skinType: "Semua Jenis Kulit",
      howToUse: "Ketuk-ketuk lembut sejumlah kecil produk di sekitar area mata menggunakan jari manis. Gunakan pagi dan malam hari.",
      price: 195000,
      stock: 30,
      imageUrl: img("1522335789203-aabd1fc54bc9"),
      categoryId: catMap["perawatan-mata"],
    },
    {
      name: "Retinol Eye Renewal Cream",
      slug: "retinol-eye-renewal-cream",
      description: "Krim mata dengan retinol 0.1% yang diformulasikan khusus untuk area sensitif sekitar mata. Mengurangi kerutan halus dan garis ekspresi secara bertahap.",
      ingredients: "Water, Retinyl Palmitate 0.1%, Peptide Complex, Shea Butter, Squalane, Hyaluronic Acid, Ceramide NP, Vitamin E, Allantoin",
      skinType: "Normal, Kering, Semua Jenis Kulit",
      howToUse: "Gunakan malam hari saja. Aplikasikan sejumlah kecil menggunakan jari manis dengan gerakan menepuk ringan. Mulai 2x seminggu.",
      price: 265000,
      stock: 20,
      imageUrl: img("1574182245530-967d9b3831af"),
      categoryId: catMap["perawatan-mata"],
    },
    {
      name: "Brightening Under Eye Patch",
      slug: "brightening-under-eye-patch",
      description: "Under eye patch hydrogel yang mencerahkan lingkaran gelap dan mengencangkan area di bawah mata. Mengandung gold collagen dan vitamin C untuk hasil optimal.",
      ingredients: "Water, Hydrolyzed Collagen, Gold Extract, Vitamin C Derivative, Caffeine, Hyaluronic Acid, Niacinamide, Panthenol",
      skinType: "Semua Jenis Kulit",
      howToUse: "Tempelkan patch di bawah mata selama 15-20 menit. Gunakan 2-3x seminggu untuk hasil terbaik.",
      price: 75000,
      stock: 60,
      imageUrl: img("1522335789203-aabd1fc54bc9"),
      categoryId: catMap["perawatan-mata"],
    },
    {
      name: "Cooling Eye Gel Treatment",
      slug: "cooling-eye-gel-treatment",
      description: "Eye gel bertekstur ringan dengan sensasi cooling aloe vera dan cucumber untuk menyegarkan dan mengurangi kelelahan mata. Ideal untuk penggunaan setelah seharian beraktivitas.",
      ingredients: "Aloe Barbadensis Leaf Juice, Cucumber Extract, Glycerin, Caffeine, Hyaluronic Acid, Panthenol, Allantoin, Peptide Complex",
      skinType: "Semua Jenis Kulit",
      howToUse: "Simpan di kulkas untuk efek cooling lebih baik. Aplikasikan sejumlah kecil di sekitar area mata. Gunakan pagi dan siang hari.",
      price: 175000,
      stock: 35,
      imageUrl: img("1571781926291-c477ebfd024b"),
      categoryId: catMap["perawatan-mata"],
    },
    {
      name: "Age-Defying Eye Complex",
      slug: "age-defying-eye-complex",
      description: "Krim mata anti-aging premium dengan kompleks peptide aktif dan retinoid untuk melawan semua tanda penuaan di sekitar mata secara komprehensif.",
      ingredients: "Water, Acetyl Hexapeptide-3, Palmitoyl Tripeptide-1, Retinyl Palmitate, Shea Butter, Squalane, Hyaluronic Acid, Vitamin C, Ceramide NP",
      skinType: "Normal, Kering",
      howToUse: "Aplikasikan setiap malam menggunakan jari manis. Tepuk-tepuk lembut di sekitar orbital bone hingga meresap. Hindari kontak langsung dengan mata.",
      price: 320000,
      stock: 15,
      imageUrl: img("1556760544-74068565f05c"),
      categoryId: catMap["perawatan-mata"],
    },

    // ===========================
    // PERAWATAN BIBIR (5 produk)
    // ===========================
    {
      name: "Rose Butter Nourishing Lip Mask",
      slug: "rose-butter-nourishing-lip-mask",
      description: "Lip mask overnight dengan shea butter dan rose oil untuk merawat bibir kering dan pecah-pecah. Bangun dengan bibir terasa lembut, kenyal, dan terhidrasi.",
      ingredients: "Butyrospermum Parkii (Shea) Butter, Rosa Canina Fruit Oil, Glycerin, Vitamin E, Beeswax, Hyaluronic Acid, Rose Extract",
      skinType: "Semua Jenis Kulit",
      howToUse: "Aplikasikan lapisan tebal ke bibir sebelum tidur. Dapat digunakan juga sebagai lip treatment siang hari.",
      price: 85000,
      stock: 50,
      imageUrl: img("1543779871-82d14e37d2ab"),
      categoryId: catMap["perawatan-bibir"],
    },
    {
      name: "Vitamin E Lip Renewal Serum",
      slug: "vitamin-e-lip-renewal-serum",
      description: "Serum bibir cair dengan konsentrasi vitamin E dan kolagen tinggi untuk merawat dan meregenerasi bibir yang kusam, kering, atau sering terkelupas.",
      ingredients: "Tocopheryl Acetate, Hydrolyzed Collagen, Rosa Canina Oil, Glycerin, Hyaluronic Acid, Panthenol, Peptide Complex",
      skinType: "Semua Jenis Kulit",
      howToUse: "Oleskan 1-2 tetes ke bibir menggunakan aplikator dropper. Tepuk-tepuk lembut hingga meresap. Gunakan pagi dan malam.",
      price: 95000,
      stock: 40,
      imageUrl: img("1543779871-82d14e37d2ab"),
      categoryId: catMap["perawatan-bibir"],
    },
    {
      name: "Honey Glow Exfoliating Lip Scrub",
      slug: "honey-glow-exfoliating-lip-scrub",
      description: "Scrub bibir dengan butiran gula halus dan madu untuk mengangkat sel kulit mati pada bibir. Meninggalkan bibir terasa lebih halus dan siap menyerap lip treatment.",
      ingredients: "Sucrose, Honey, Jojoba Beads, Sweet Almond Oil, Vitamin E, Shea Butter, Vanilla Extract",
      skinType: "Semua Jenis Kulit",
      howToUse: "Oleskan sejumlah kecil scrub ke bibir, gosok lembut dengan gerakan melingkar selama 1 menit, bilas atau jilat. Gunakan 2x seminggu.",
      price: 65000,
      stock: 60,
      imageUrl: img("1527799820374-dcf8d9d4a388"),
      categoryId: catMap["perawatan-bibir"],
    },
    {
      name: "Plumping & Hydrating Lip Treatment",
      slug: "plumping-hydrating-lip-treatment",
      description: "Lip treatment dengan efek plumping alami dari peptide dan hyaluronic acid. Memberikan tampilan bibir lebih bervolume dan terhidrasi tanpa prosedur invasif.",
      ingredients: "Water, Hyaluronic Acid, Peptide Complex, Palmitoyl Tripeptide-38, Glycerin, Vitamin E, Castor Oil, Wax",
      skinType: "Semua Jenis Kulit",
      howToUse: "Oleskan ke bibir kapanpun bibir terasa kering. Gunakan setelah lip scrub untuk penyerapan optimal.",
      price: 110000,
      stock: 35,
      imageUrl: img("1583209814683-c023dd293cc6"),
      categoryId: catMap["perawatan-bibir"],
    },
    {
      name: "SPF15 Daily Protect Lip Balm",
      slug: "spf15-daily-protect-lip-balm",
      description: "Lip balm pelindung harian dengan SPF15 untuk melindungi bibir dari paparan sinar matahari yang menyebabkan bibir gelap dan kering. Formula tahan lama sepanjang hari.",
      ingredients: "Ethylhexyl Methoxycinnamate, Titanium Dioxide, Beeswax, Shea Butter, Vitamin E, Jojoba Oil, Aloe Vera, Vanilla",
      skinType: "Semua Jenis Kulit",
      howToUse: "Oleskan ke bibir setiap pagi sebelum beraktivitas. Reaplikasikan setelah makan atau minum.",
      price: 45000,
      stock: 80,
      imageUrl: img("1556229010-6272de23c10b"),
      categoryId: catMap["perawatan-bibir"],
    },

    // ===========================
    // EKSFOLIATOR (5 produk)
    // ===========================
    {
      name: "Sugar Glow Face Scrub",
      slug: "sugar-glow-face-scrub",
      description: "Scrub wajah fisik dengan butiran gula alami yang lembut untuk mengangkat sel kulit mati dan merangsang sirkulasi. Cocoa butter dan jojoba oil meninggalkan kulit lembut.",
      ingredients: "Sucrose, Jojoba Beads, Theobroma Cacao (Cocoa) Seed Butter, Sweet Almond Oil, Glycerin, Vitamin E, Citric Acid",
      skinType: "Normal, Kombinasi",
      howToUse: "Oleskan ke kulit lembap dengan gerakan melingkar kecil selama 1-2 menit. Bilas bersih. Gunakan 1-2x seminggu. Hindari kulit yang sedang meradang.",
      price: 135000,
      stock: 45,
      imageUrl: img("1513161455079-7dc1de15ef3e"),
      categoryId: catMap["eksfoliator"],
    },
    {
      name: "AHA/BHA Exfoliating Solution",
      slug: "aha-bha-exfoliating-solution",
      description: "Eksfolian cair dengan kombinasi AHA 10% dan BHA 2% untuk eksfoliasi chemical yang efektif. Mengangkat sel kulit mati dan membersihkan pori-pori secara mendalam.",
      ingredients: "Water, Glycolic Acid 7%, Lactic Acid 3%, Salicylic Acid 2%, Panthenol, Aloe Vera, Hyaluronic Acid, Allantoin",
      skinType: "Normal, Berminyak, Kombinasi",
      howToUse: "Gunakan malam hari. Oleskan ke wajah bersih menggunakan kapas atau jari. Jangan bilas. Mulai 2x seminggu. Selalu pakai sunscreen di pagi hari.",
      price: 225000,
      stock: 25,
      imageUrl: img("1598440947619-2c35fc9aa908"),
      categoryId: catMap["eksfoliator"],
    },
    {
      name: "Enzyme Brightening Exfoliating Powder",
      slug: "enzyme-brightening-exfoliating-powder",
      description: "Bubuk eksfoliasi enzyme papain dan bromelain yang bekerja lembut tanpa abrasif fisik. Ideal untuk kulit sensitif yang tidak dapat menggunakan scrub konvensional.",
      ingredients: "Oryza Sativa (Rice) Starch, Papain, Bromelain, Niacinamide, Kojic Acid, Glycerin, Allantoin",
      skinType: "Sensitif, Normal, Kering",
      howToUse: "Campurkan sejumput bubuk dengan sedikit air atau cleanser, aplikasikan ke wajah dengan gerakan melingkar lembut, bilas. Gunakan 1-2x seminggu.",
      price: 185000,
      stock: 30,
      imageUrl: img("1527799820374-dcf8d9d4a388"),
      categoryId: catMap["eksfoliator"],
    },
    {
      name: "Gentle Peeling Gel Exfoliant",
      slug: "gentle-peeling-gel-exfoliant",
      description: "Peeling gel lembut yang mengangkat sel kulit mati melalui proses rolling tanpa iritasi. Teknologi non-abrasive cocok untuk penggunaan rutin tanpa mengiritasi kulit.",
      ingredients: "Water, Carbomer, Glycerin, Cellulose, Niacinamide, Panthenol, Aloe Vera, Allantoin, Citric Acid",
      skinType: "Semua Jenis Kulit",
      howToUse: "Aplikasikan ke kulit kering yang bersih, gosok perlahan dengan jari - kulit mati akan menggelinding. Bilas dengan air bersih. Gunakan 1-2x seminggu.",
      price: 115000,
      stock: 50,
      imageUrl: img("1513161455079-7dc1de15ef3e"),
      categoryId: catMap["eksfoliator"],
    },
    {
      name: "Glycolic Acid Glow Tonic",
      slug: "glycolic-acid-glow-tonic",
      description: "Tonic eksfoliasi dengan Glycolic Acid 7% untuk mempercepat pergantian sel kulit. Memberikan efek radiant yang visible dengan pemakaian rutin.",
      ingredients: "Water, Glycolic Acid 7%, Aloe Barbadensis Leaf Juice, Glycerin, Panthenol, Sodium PCA, Chamomile Extract, Allantoin",
      skinType: "Normal, Berminyak",
      howToUse: "Gunakan 3-4x seminggu malam hari. Oleskan ke wajah menggunakan kapas setelah membersihkan wajah. Hindari kontak dengan mata. Wajib pakai sunscreen.",
      price: 245000,
      stock: 20,
      imageUrl: img("1556228578-0d85751bab32"),
      categoryId: catMap["eksfoliator"],
    },

    // ===========================
    // PERAWATAN JERAWAT (6 produk)
    // ===========================
    {
      name: "Salicylic Acid 2% Spot Treatment",
      slug: "salicylic-acid-2-spot-treatment",
      description: "Spot treatment dengan Salicylic Acid 2% yang bekerja langsung pada jerawat aktif. Mengurangi kemerahan, bengkak, dan mempercepat penyembuhan jerawat dalam 24-48 jam.",
      ingredients: "Water, Salicylic Acid 2%, Niacinamide, Zinc PCA, Tea Tree Oil, Allantoin, Glycerin, Panthenol",
      skinType: "Berjerawat, Berminyak",
      howToUse: "Oleskan langsung ke jerawat aktif menggunakan cotton swab atau jari bersih. Gunakan setelah toner, sebelum pelembap. Dapat digunakan pagi dan malam.",
      price: 115000,
      stock: 55,
      imageUrl: img("1556228720-195026d525f7"),
      categoryId: catMap["perawatan-jerawat"],
    },
    {
      name: "Tea Tree Clear Skin Serum",
      slug: "tea-tree-clear-skin-serum",
      description: "Serum antibakteri dengan Tea Tree Oil 2% dan niacinamide untuk mengatasi jerawat, kemerahan, dan kulit berminyak berlebih secara komprehensif.",
      ingredients: "Water, Melaleuca Alternifolia (Tea Tree) Leaf Oil 2%, Niacinamide 5%, Zinc PCA, Salicylic Acid, Centella Asiatica, Glycerin, Allantoin",
      skinType: "Berjerawat, Berminyak, Kombinasi",
      howToUse: "Aplikasikan 2-3 tetes ke seluruh wajah atau hanya area bermasalah setelah toner. Gunakan pagi dan malam.",
      price: 145000,
      stock: 45,
      imageUrl: img("1583209814683-c023dd293cc6"),
      categoryId: catMap["perawatan-jerawat"],
    },
    {
      name: "BHA Blemish Control Toner",
      slug: "bha-blemish-control-toner",
      description: "Toner BHA dengan Salicylic Acid 1% untuk membersihkan pori-pori tersumbat dan mencegah pembentukan komedo serta jerawat baru. Kulit lebih bersih dan halus.",
      ingredients: "Water, Salicylic Acid 1%, Glycerin, Niacinamide, Witch Hazel, Tea Tree Oil, Aloe Vera, Panthenol, Allantoin",
      skinType: "Berjerawat, Berminyak",
      howToUse: "Gunakan setelah membersihkan wajah. Oleskan ke wajah menggunakan kapas dengan arah berlawanan dari bawah ke atas. Gunakan malam hari.",
      price: 125000,
      stock: 50,
      imageUrl: img("1574182245530-967d9b3831af"),
      categoryId: catMap["perawatan-jerawat"],
    },
    {
      name: "Acne Healing Invisible Patch",
      slug: "acne-healing-invisible-patch",
      description: "Plester jerawat tidak terlihat (hydrocolloid) yang menyerap cairan jerawat dan melindungi dari bakteri. Isi 36 patch dalam berbagai ukuran untuk jerawat di mana saja.",
      ingredients: "Hydrocolloid, Polyurethane Film, Acrylic Adhesive, Tea Tree Extract, Salicylic Acid",
      skinType: "Berjerawat, Semua Jenis Kulit",
      howToUse: "Bersihkan dan keringkan kulit. Tempelkan patch langsung ke jerawat yang sudah matang. Diamkan minimal 6-8 jam atau semalaman. Satu patch satu jerawat.",
      price: 55000,
      stock: 80,
      imageUrl: img("1556228720-195026d525f7"),
      categoryId: catMap["perawatan-jerawat"],
    },
    {
      name: "Oil Control Mattifying Gel",
      slug: "oil-control-mattifying-gel",
      description: "Gel kontrol minyak yang memberikan tampilan matte tahan lama hingga 8 jam. Formula ringan dengan silika dan niacinamide meminimalkan tampilan pori-pori.",
      ingredients: "Water, Dimethicone, Silica, Niacinamide, Zinc PCA, Glycerin, Panthenol, Allantoin, Tea Tree Oil",
      skinType: "Berminyak, Kombinasi",
      howToUse: "Gunakan setelah pelembap atau sebelum makeup. Oleskan tipis ke area T-zone atau seluruh wajah. Dapat digunakan sebagai primer makeup.",
      price: 135000,
      stock: 40,
      imageUrl: img("1598440947619-2c35fc9aa908"),
      categoryId: catMap["perawatan-jerawat"],
    },
    {
      name: "Pore Minimizing Clear Serum",
      slug: "pore-minimizing-clear-serum",
      description: "Serum khusus untuk pori-pori besar dengan kombinasi niacinamide 10%, BHA, dan retinol ringan. Pori-pori tampak lebih kecil dan kulit lebih halus secara bertahap.",
      ingredients: "Water, Niacinamide 10%, Salicylic Acid 0.5%, Retinyl Palmitate, Glycerin, Zinc PCA, Hyaluronic Acid, Panthenol",
      skinType: "Berminyak, Kombinasi, Berjerawat",
      howToUse: "Gunakan 2-3 tetes setelah toner. Dapat digunakan pagi (tanpa retinol aktif) dan malam. Pakai sunscreen di pagi hari.",
      price: 165000,
      stock: 35,
      imageUrl: img("1616394584738-fc6e612e71b9"),
      categoryId: catMap["perawatan-jerawat"],
    },
  ];

  let productCount = 0;
  for (const product of products) {
    await prisma.product.create({ data: product });
    productCount++;
  }

  console.log(`✅ ${productCount} produk berhasil dibuat`);

  // ============================================================
  // UPDATE GAMBAR PRODUK — URL gambar dari ImgBB (Pinterest images)
  // Setiap produk mendapat URL gambar yang unik dan sesuai kategori
  // ============================================================
  const IMAGE_MAP: Record<string, string> = {
    // PEMBERSIH WAJAH
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
    // TONER & ESSENCE
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
    // SERUM & AMPOULE
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
    // PELEMBAP & KRIM
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
    // TABIR SURYA
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
    // MASKER WAJAH
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
    // PERAWATAN MATA
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
    // PERAWATAN BIBIR
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
    // EKSFOLIATOR
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
    // PERAWATAN JERAWAT
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

  const allProds = await prisma.product.findMany({ select: { id: true, slug: true } });
  for (const p of allProds) {
    const newUrl = IMAGE_MAP[p.slug];
    if (newUrl) {
      await prisma.product.update({ where: { id: p.id }, data: { imageUrl: newUrl } });
    }
  }
  console.log(`✅ Gambar unik diterapkan ke ${Object.keys(IMAGE_MAP).length} produk`);
  console.log("");
  console.log("📊 RINGKASAN SEED:");
  console.log(`   Users   : 2 akun`);
  console.log(`   Kategori: ${categoryData.length} kategori`);
  console.log(`   Produk  : ${productCount} produk`);
  console.log("");
  console.log("🔐 Akun test:");
  console.log("   User  : user@lumiereskin.com (Team 1) / Lumiere123!");
  console.log("   Admin : admin@lumiereskin.com / Admin123!");
  console.log("");
  console.log("🌱 Seeding selesai!");
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
