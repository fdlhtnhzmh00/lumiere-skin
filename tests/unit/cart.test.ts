/**
 * tests/unit/cart.test.ts
 * Unit test untuk business rules keranjang belanja
 *
 * Mencakup:
 * BR-05: Jumlah minimal pembelian 1 unit
 * BR-06: Jumlah maksimal pembelian 10 unit
 * BR-07: Jumlah tidak boleh melebihi stok tersedia
 * BR-08: Jumlah harus bilangan bulat positif
 */

import {
  validateCartQuantity,
  validateCartNotEmpty,
  calculateCartTotal,
  CART_MIN_QUANTITY,
  CART_MAX_QUANTITY,
} from "@/lib/validations/cart";

// ─── Konstanta ────────────────────────────────────────────────
const STOCK_SUFFICIENT = 50; // stok lebih dari cukup
const STOCK_LIMITED    = 3;  // stok terbatas
const STOCK_EMPTY      = 0;  // stok habis

// ─── BR-05: Jumlah minimal pembelian 1 unit ───────────────────
describe("BR-05: Jumlah minimal pembelian 1 unit", () => {
  test("qty=0 harus ditolak", () => {
    const result = validateCartQuantity(0, STOCK_SUFFICIENT);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("minimal");
  });

  test("qty=-1 (negatif) harus ditolak", () => {
    const result = validateCartQuantity(-1, STOCK_SUFFICIENT);
    expect(result.valid).toBe(false);
  });

  test("qty=-5 harus ditolak", () => {
    const result = validateCartQuantity(-5, STOCK_SUFFICIENT);
    expect(result.valid).toBe(false);
  });

  test("qty=1 (batas bawah) harus diterima", () => {
    const result = validateCartQuantity(1, STOCK_SUFFICIENT);
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });
});

// ─── BR-06: Jumlah maksimal pembelian 10 unit ─────────────────
describe("BR-06: Jumlah maksimal pembelian 10 unit per produk", () => {
  test("qty=10 (batas atas) harus diterima", () => {
    const result = validateCartQuantity(10, STOCK_SUFFICIENT);
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  test("qty=11 harus ditolak", () => {
    const result = validateCartQuantity(11, STOCK_SUFFICIENT);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("maksimal");
  });

  test("qty=100 harus ditolak", () => {
    const result = validateCartQuantity(100, STOCK_SUFFICIENT);
    expect(result.valid).toBe(false);
  });

  test("CART_MAX_QUANTITY harus bernilai 10", () => {
    expect(CART_MAX_QUANTITY).toBe(10);
  });

  test("CART_MIN_QUANTITY harus bernilai 1", () => {
    expect(CART_MIN_QUANTITY).toBe(1);
  });
});

// ─── BR-07: Tidak boleh melebihi stok tersedia ────────────────
describe("BR-07: Jumlah tidak boleh melebihi stok tersedia", () => {
  test("qty = stok (tepat stok) harus diterima", () => {
    const result = validateCartQuantity(STOCK_LIMITED, STOCK_LIMITED);
    expect(result.valid).toBe(true);
  });

  test("qty > stok harus ditolak", () => {
    const result = validateCartQuantity(STOCK_LIMITED + 1, STOCK_LIMITED);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("stok");
  });

  test("stok=0, qty=1 harus ditolak (stok habis)", () => {
    const result = validateCartQuantity(1, STOCK_EMPTY);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("stok");
  });

  test("stok=5, qty=5 harus diterima", () => {
    expect(validateCartQuantity(5, 5).valid).toBe(true);
  });

  test("stok=5, qty=6 harus ditolak (meski < max 10)", () => {
    const result = validateCartQuantity(6, 5);
    expect(result.valid).toBe(false);
  });
});

// ─── BR-08: Bilangan bulat positif ───────────────────────────
describe("BR-08: Jumlah harus bilangan bulat positif (tidak pecahan/teks/negatif)", () => {
  test("2.5 (pecahan) harus ditolak", () => {
    const result = validateCartQuantity(2.5, STOCK_SUFFICIENT);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("pecahan");
  });

  test("1.1 (pecahan) harus ditolak", () => {
    const result = validateCartQuantity(1.1, STOCK_SUFFICIENT);
    expect(result.valid).toBe(false);
  });

  test("'abc' (teks non-numerik) harus ditolak", () => {
    const result = validateCartQuantity("abc", STOCK_SUFFICIENT);
    expect(result.valid).toBe(false);
  });

  test("'1.5' (teks pecahan) harus ditolak", () => {
    const result = validateCartQuantity("1.5", STOCK_SUFFICIENT);
    expect(result.valid).toBe(false);
  });

  test("null harus ditolak", () => {
    const result = validateCartQuantity(null, STOCK_SUFFICIENT);
    expect(result.valid).toBe(false);
  });

  test("undefined harus ditolak", () => {
    const result = validateCartQuantity(undefined, STOCK_SUFFICIENT);
    expect(result.valid).toBe(false);
  });

  test("'2' (string angka bulat) harus diterima", () => {
    const result = validateCartQuantity("2", STOCK_SUFFICIENT);
    expect(result.valid).toBe(true);
  });

  test("true (boolean) harus ditolak", () => {
    const result = validateCartQuantity(true, STOCK_SUFFICIENT);
    expect(result.valid).toBe(false);
  });
});

// ─── Boundary Value Testing ───────────────────────────────────
describe("Boundary Values", () => {
  test("qty=0 (below min) — invalid", () => {
    expect(validateCartQuantity(0, STOCK_SUFFICIENT).valid).toBe(false);
  });

  test("qty=1 (at min) — valid", () => {
    expect(validateCartQuantity(1, STOCK_SUFFICIENT).valid).toBe(true);
  });

  test("qty=2 (above min) — valid", () => {
    expect(validateCartQuantity(2, STOCK_SUFFICIENT).valid).toBe(true);
  });

  test("qty=9 (below max) — valid", () => {
    expect(validateCartQuantity(9, STOCK_SUFFICIENT).valid).toBe(true);
  });

  test("qty=10 (at max) — valid", () => {
    expect(validateCartQuantity(10, STOCK_SUFFICIENT).valid).toBe(true);
  });

  test("qty=11 (above max) — invalid", () => {
    expect(validateCartQuantity(11, STOCK_SUFFICIENT).valid).toBe(false);
  });
});

// ─── validateCartNotEmpty ─────────────────────────────────────
describe("validateCartNotEmpty", () => {
  test("0 item harus ditolak", () => {
    const result = validateCartNotEmpty(0);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("kosong");
  });

  test("1 item harus diterima", () => {
    expect(validateCartNotEmpty(1).valid).toBe(true);
  });

  test("5 items harus diterima", () => {
    expect(validateCartNotEmpty(5).valid).toBe(true);
  });
});

// ─── calculateCartTotal ───────────────────────────────────────
describe("calculateCartTotal", () => {
  test("menghitung total dari beberapa item", () => {
    const items = [
      { price: 295000, quantity: 2 }, // 590.000
      { price: 185000, quantity: 1 }, // 185.000
    ];
    expect(calculateCartTotal(items)).toBe(775000);
  });

  test("array kosong = 0", () => {
    expect(calculateCartTotal([])).toBe(0);
  });

  test("satu item: 100000 * 3 = 300000", () => {
    expect(calculateCartTotal([{ price: 100000, quantity: 3 }])).toBe(300000);
  });

  test("quantity 1 = harga itu sendiri", () => {
    expect(calculateCartTotal([{ price: 145000, quantity: 1 }])).toBe(145000);
  });
});
