/**
 * tests/unit/product.test.ts
 * Unit test untuk business rules validasi produk
 *
 * Mencakup:
 * BR-01: Nama produk wajib diisi (minimal 3 karakter)
 * BR-02: Harga produk harus lebih besar dari nol
 * BR-03: Stok produk tidak boleh bernilai negatif
 * BR-04: Harga bertipe Float, stok bertipe Integer
 *
 * Juga mencakup analisis Cyclomatic Complexity:
 * - validateProduct(): V(G) = 7 (6 branch points + 1)
 * - validateStatusTransition(): V(G) = 8 (7 branch points + 1)
 */

import {
  validateProductName,
  validateProductPrice,
  validateProductStock,
  validateProduct,
  type ProductInput,
  type ValidationResult,
} from "@/lib/validations/product";

// ─────────────────────────────────────────────────────────────
// validateProductName — BR-01
// ─────────────────────────────────────────────────────────────

describe("validateProductName — BR-01: Nama produk wajib diisi (min 3 kar)", () => {

  // Kasus tidak valid
  describe("Nilai Tidak Valid", () => {
    test("undefined harus ditolak", () => {
      expect(validateProductName(undefined)).not.toBeNull();
    });

    test("null harus ditolak", () => {
      expect(validateProductName(null)).not.toBeNull();
    });

    test("string kosong '' harus ditolak", () => {
      const result = validateProductName("");
      expect(result).not.toBeNull();
      expect(result).toContain("wajib");
    });

    test("hanya spasi harus ditolak", () => {
      const result = validateProductName("   ");
      expect(result).not.toBeNull();
      expect(result).toContain("spasi");
    });

    test("2 karakter (di bawah min 3) harus ditolak", () => {
      const result = validateProductName("AB");
      expect(result).not.toBeNull();
      expect(result).toContain("minimal");
    });

    test("bukan string (angka) harus ditolak", () => {
      expect(validateProductName(12345)).not.toBeNull();
    });

    test("bukan string (array) harus ditolak", () => {
      expect(validateProductName(["nama"])).not.toBeNull();
    });

    test("201 karakter (di atas max 200) harus ditolak", () => {
      const longName = "A".repeat(201);
      const result = validateProductName(longName);
      expect(result).not.toBeNull();
      expect(result).toContain("maksimal");
    });
  });

  // Kasus valid
  describe("Nilai Valid", () => {
    test("3 karakter (batas bawah) harus diterima", () => {
      expect(validateProductName("ABC")).toBeNull();
    });

    test("nama produk normal harus diterima", () => {
      expect(validateProductName("Vitamin C Brightening Serum")).toBeNull();
    });

    test("nama dengan angka harus diterima", () => {
      expect(validateProductName("Niacinamide 10% Serum")).toBeNull();
    });

    test("200 karakter (batas atas) harus diterima", () => {
      const maxName = "A".repeat(200);
      expect(validateProductName(maxName)).toBeNull();
    });

    test("nama dengan spasi di awal/akhir harus diterima (trimmed)", () => {
      // " ABC " trim menjadi "ABC" = 3 karakter = valid
      expect(validateProductName("  Valid Product  ")).toBeNull();
    });
  });

  // Boundary values
  describe("Boundary Values", () => {
    test("2 karakter — invalid (below min)", () => {
      expect(validateProductName("AB")).not.toBeNull();
    });
    test("3 karakter — valid (at min)", () => {
      expect(validateProductName("ABC")).toBeNull();
    });
    test("4 karakter — valid (above min)", () => {
      expect(validateProductName("ABCD")).toBeNull();
    });
    test("199 karakter — valid (below max)", () => {
      expect(validateProductName("A".repeat(199))).toBeNull();
    });
    test("200 karakter — valid (at max)", () => {
      expect(validateProductName("A".repeat(200))).toBeNull();
    });
    test("201 karakter — invalid (above max)", () => {
      expect(validateProductName("A".repeat(201))).not.toBeNull();
    });
  });
});

// ─────────────────────────────────────────────────────────────
// validateProductPrice — BR-02
// ─────────────────────────────────────────────────────────────

describe("validateProductPrice — BR-02: Harga harus lebih besar dari nol", () => {

  describe("Nilai Tidak Valid", () => {
    test("undefined harus ditolak", () => {
      expect(validateProductPrice(undefined)).not.toBeNull();
    });

    test("null harus ditolak", () => {
      expect(validateProductPrice(null)).not.toBeNull();
    });

    test("string kosong harus ditolak", () => {
      expect(validateProductPrice("")).not.toBeNull();
    });

    test("0 (nol) harus ditolak", () => {
      const result = validateProductPrice(0);
      expect(result).not.toBeNull();
      expect(result).toContain("nol");
    });

    test("-1 (negatif) harus ditolak", () => {
      const result = validateProductPrice(-1);
      expect(result).not.toBeNull();
      expect(result).toContain("nol");
    });

    test("-100000 (negatif besar) harus ditolak", () => {
      expect(validateProductPrice(-100000)).not.toBeNull();
    });

    test("teks non-numerik harus ditolak", () => {
      const result = validateProductPrice("mahal");
      expect(result).not.toBeNull();
      expect(result).toContain("angka");
    });

    test("NaN harus ditolak", () => {
      expect(validateProductPrice(NaN)).not.toBeNull();
    });
  });

  describe("Nilai Valid", () => {
    test("0.01 (nilai terkecil > 0) harus diterima", () => {
      expect(validateProductPrice(0.01)).toBeNull();
    });

    test("1000 (bilangan bulat) harus diterima", () => {
      expect(validateProductPrice(1000)).toBeNull();
    });

    test("145000 (harga realistis produk) harus diterima", () => {
      expect(validateProductPrice(145000)).toBeNull();
    });

    test("295000.5 (float) harus diterima", () => {
      expect(validateProductPrice(295000.5)).toBeNull();
    });

    test("'145000' (string angka) harus diterima", () => {
      expect(validateProductPrice("145000")).toBeNull();
    });
  });

  describe("Boundary Values", () => {
    test("0 — invalid (below min)", () => {
      expect(validateProductPrice(0)).not.toBeNull();
    });
    test("0.01 — valid (minimal positif)", () => {
      expect(validateProductPrice(0.01)).toBeNull();
    });
    test("-0.01 — invalid (sedikit di bawah 0)", () => {
      expect(validateProductPrice(-0.01)).not.toBeNull();
    });
  });
});

// ─────────────────────────────────────────────────────────────
// validateProductStock — BR-03 & BR-04
// ─────────────────────────────────────────────────────────────

describe("validateProductStock — BR-03: Stok tidak boleh negatif, BR-04: harus Integer", () => {

  describe("Nilai Tidak Valid", () => {
    test("undefined harus ditolak", () => {
      expect(validateProductStock(undefined)).not.toBeNull();
    });

    test("null harus ditolak", () => {
      expect(validateProductStock(null)).not.toBeNull();
    });

    test("string kosong harus ditolak", () => {
      expect(validateProductStock("")).not.toBeNull();
    });

    test("-1 (negatif) harus ditolak (BR-03)", () => {
      const result = validateProductStock(-1);
      expect(result).not.toBeNull();
      expect(result).toContain("negatif");
    });

    test("-100 (negatif besar) harus ditolak", () => {
      expect(validateProductStock(-100)).not.toBeNull();
    });

    test("1.5 (desimal) harus ditolak (BR-04)", () => {
      const result = validateProductStock(1.5);
      expect(result).not.toBeNull();
      expect(result).toContain("bulat");
    });

    test("0.5 (desimal < 1) harus ditolak", () => {
      expect(validateProductStock(0.5)).not.toBeNull();
    });

    test("teks non-numerik harus ditolak", () => {
      const result = validateProductStock("banyak");
      expect(result).not.toBeNull();
      expect(result).toContain("angka");
    });
  });

  describe("Nilai Valid", () => {
    test("0 (stok habis) harus diterima", () => {
      // Stok 0 valid — artinya produk sedang habis, bukan error
      expect(validateProductStock(0)).toBeNull();
    });

    test("1 harus diterima", () => {
      expect(validateProductStock(1)).toBeNull();
    });

    test("50 (stok normal) harus diterima", () => {
      expect(validateProductStock(50)).toBeNull();
    });

    test("100 harus diterima", () => {
      expect(validateProductStock(100)).toBeNull();
    });

    test("'30' (string angka bulat) harus diterima", () => {
      expect(validateProductStock("30")).toBeNull();
    });
  });

  describe("Boundary Values", () => {
    test("-1 — invalid (below zero)", () => {
      expect(validateProductStock(-1)).not.toBeNull();
    });
    test("0 — valid (at zero)", () => {
      expect(validateProductStock(0)).toBeNull();
    });
    test("1 — valid (above zero)", () => {
      expect(validateProductStock(1)).toBeNull();
    });
  });
});

// ─────────────────────────────────────────────────────────────
// validateProduct — Fungsi Gabungan (Cyclomatic Complexity)
// V(G) = 6 branch points + 1 = 7
// ─────────────────────────────────────────────────────────────

describe("validateProduct — Validasi Lengkap Produk (V(G) = 7)", () => {

  // Input produk valid lengkap
  const validInput: ProductInput = {
    name:        "Vitamin C Brightening Serum",
    price:       295000,
    stock:       35,
    description: "Serum vitamin C untuk kulit cerah",
    categoryId:  "cltest123",
    imageUrl:    "https://images.unsplash.com/photo-test",
  };

  // Path 1: Semua valid (happy path)
  test("P1: semua field valid — tidak ada error", () => {
    const result = validateProduct(validInput);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // Path 2: nama tidak valid
  test("P2: nama kosong — ada error nama", () => {
    const result = validateProduct({ ...validInput, name: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes("nama"))).toBe(true);
  });

  // Path 3: harga tidak valid
  test("P3: harga negatif — ada error harga", () => {
    const result = validateProduct({ ...validInput, price: -1 });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes("harga"))).toBe(true);
  });

  // Path 4: stok tidak valid
  test("P4: stok negatif — ada error stok", () => {
    const result = validateProduct({ ...validInput, stock: -5 });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes("stok"))).toBe(true);
  });

  // Path 5: deskripsi kosong
  test("P5: deskripsi kosong — ada error deskripsi", () => {
    const result = validateProduct({ ...validInput, description: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes("deskripsi"))).toBe(true);
  });

  // Path 6: categoryId kosong
  test("P6: categoryId kosong — ada error kategori", () => {
    const result = validateProduct({ ...validInput, categoryId: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes("kategori"))).toBe(true);
  });

  // Path 7: imageUrl kosong
  test("P7: imageUrl kosong — ada error gambar", () => {
    const result = validateProduct({ ...validInput, imageUrl: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes("gambar"))).toBe(true);
  });

  // Multiple errors
  test("semua field kosong/invalid — menghasilkan 6 error", () => {
    const result = validateProduct({
      name:        "",
      price:       -1,
      stock:       -1,
      description: "",
      categoryId:  "",
      imageUrl:    "",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(6);
  });

  test("nama dan harga valid, sisanya invalid — 4 error", () => {
    const result = validateProduct({
      name:        "Valid Product",
      price:       10000,
      stock:       -1,
      description: "",
      categoryId:  "",
      imageUrl:    "",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
  });

  test("fungsi mengembalikan tipe ValidationResult yang benar", () => {
    const result: ValidationResult = validateProduct(validInput);
    expect(result).toHaveProperty("valid");
    expect(result).toHaveProperty("errors");
    expect(Array.isArray(result.errors)).toBe(true);
  });
});
