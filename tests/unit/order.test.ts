/**
 * tests/unit/order.test.ts
 * Unit test untuk business rules manajemen pesanan
 *
 * Mencakup:
 * - validateStatusTransition (BR-14 s/d BR-20) — State Transition Testing
 * - validateCheckout (BR-09 s/d BR-13)
 * - isValidOrderStatus (guard type validation)
 */

import {
  validateStatusTransition,
  validateCheckout,
  isValidOrderStatus,
  VALID_ORDER_STATUSES,
  type OrderStatus,
} from "@/lib/validations/order";

// ─────────────────────────────────────────────────────────────
// validateStatusTransition — State Transition Testing
// ─────────────────────────────────────────────────────────────

describe("validateStatusTransition — Transisi Status Pesanan", () => {

  // ── Transisi VALID ────────────────────────────────────────
  describe("Transisi Valid", () => {
    test("DRAFT → CONFIRMED harus valid (BR-15)", () => {
      const result = validateStatusTransition("DRAFT", "CONFIRMED");
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test("DRAFT → CANCELLED harus valid (BR-16)", () => {
      const result = validateStatusTransition("DRAFT", "CANCELLED");
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test("CONFIRMED → COMPLETED harus valid (BR-17)", () => {
      const result = validateStatusTransition("CONFIRMED", "COMPLETED");
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test("CONFIRMED → CANCELLED harus valid (BR-18)", () => {
      const result = validateStatusTransition("CONFIRMED", "CANCELLED");
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  // ── Transisi TIDAK VALID: dari COMPLETED ──────────────────
  describe("Transisi Tidak Valid: dari COMPLETED (BR-19)", () => {
    const invalidTargets: OrderStatus[] = ["DRAFT", "CONFIRMED", "CANCELLED"];

    invalidTargets.forEach((target) => {
      test(`COMPLETED → ${target} harus ditolak`, () => {
        const result = validateStatusTransition("COMPLETED", target);
        expect(result.valid).toBe(false);
        expect(result.error).toBeTruthy();
      });
    });

    test("COMPLETED → COMPLETED harus ditolak (status sama)", () => {
      const result = validateStatusTransition("COMPLETED", "COMPLETED");
      expect(result.valid).toBe(false);
    });
  });

  // ── Transisi TIDAK VALID: dari CANCELLED ─────────────────
  describe("Transisi Tidak Valid: dari CANCELLED (BR-20)", () => {
    const invalidTargets: OrderStatus[] = ["DRAFT", "CONFIRMED", "COMPLETED"];

    invalidTargets.forEach((target) => {
      test(`CANCELLED → ${target} harus ditolak`, () => {
        const result = validateStatusTransition("CANCELLED", target);
        expect(result.valid).toBe(false);
        expect(result.error).toBeTruthy();
      });
    });

    test("CANCELLED → CANCELLED harus ditolak (status sama)", () => {
      const result = validateStatusTransition("CANCELLED", "CANCELLED");
      expect(result.valid).toBe(false);
    });
  });

  // ── Transisi TIDAK VALID: loncat status ───────────────────
  describe("Transisi Tidak Valid: loncat atau mundur", () => {
    test("DRAFT → COMPLETED harus ditolak (loncat CONFIRMED)", () => {
      const result = validateStatusTransition("DRAFT", "COMPLETED");
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test("CONFIRMED → DRAFT harus ditolak (mundur)", () => {
      const result = validateStatusTransition("CONFIRMED", "DRAFT");
      expect(result.valid).toBe(false);
    });

    test("COMPLETED → DRAFT harus ditolak (mundur)", () => {
      const result = validateStatusTransition("COMPLETED", "DRAFT");
      expect(result.valid).toBe(false);
    });
  });

  // ── Status sama dengan saat ini ───────────────────────────
  describe("Status Tidak Berubah", () => {
    const statuses: OrderStatus[] = ["DRAFT", "CONFIRMED", "COMPLETED", "CANCELLED"];

    statuses.forEach((status) => {
      test(`${status} → ${status} (sama) harus ditolak`, () => {
        const result = validateStatusTransition(status, status);
        expect(result.valid).toBe(false);
      });
    });
  });

  // ── Pesan error informatif ────────────────────────────────
  describe("Pesan Error", () => {
    test("error dari COMPLETED harus menjelaskan tidak bisa diubah", () => {
      const result = validateStatusTransition("COMPLETED", "CANCELLED");
      expect(result.error).toBeTruthy();
      expect(typeof result.error).toBe("string");
    });

    test("error dari CANCELLED harus menjelaskan tidak bisa diaktifkan", () => {
      const result = validateStatusTransition("CANCELLED", "CONFIRMED");
      expect(result.error).toBeTruthy();
      expect(typeof result.error).toBe("string");
    });
  });
});

// ─────────────────────────────────────────────────────────────
// validateCheckout — Validasi Data Checkout
// ─────────────────────────────────────────────────────────────

describe("validateCheckout — Validasi Data Checkout", () => {

  // Data valid sebagai base
  const validInput = {
    isLoggedIn:      true,
    cartItemCount:   2,
    recipientName:   "Sarah Putri",
    shippingAddress: "Jl. Sultan Alauddin No. 259, Makassar",
    phoneNumber:     "081234567890",
  };

  test("semua data valid harus diterima", () => {
    const result = validateCheckout(validInput);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  // BR-09: Pengguna harus login
  test("isLoggedIn=false harus ditolak (BR-09)", () => {
    const result = validateCheckout({ ...validInput, isLoggedIn: false });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  // BR-10: Keranjang tidak boleh kosong
  test("keranjang kosong (count=0) harus ditolak (BR-10)", () => {
    const result = validateCheckout({ ...validInput, cartItemCount: 0 });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("kosong"))).toBe(true);
  });

  // BR-11: Nama penerima wajib diisi
  test("recipientName kosong harus ditolak (BR-11)", () => {
    const result = validateCheckout({ ...validInput, recipientName: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes("penerima"))).toBe(true);
  });

  test("recipientName hanya spasi harus ditolak", () => {
    const result = validateCheckout({ ...validInput, recipientName: "   " });
    expect(result.valid).toBe(false);
  });

  // BR-12: Alamat pengiriman wajib diisi
  test("shippingAddress kosong harus ditolak (BR-12)", () => {
    const result = validateCheckout({ ...validInput, shippingAddress: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes("alamat"))).toBe(true);
  });

  // BR-13: Nomor telepon wajib diisi
  test("phoneNumber kosong harus ditolak (BR-13)", () => {
    const result = validateCheckout({ ...validInput, phoneNumber: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.toLowerCase().includes("telepon"))).toBe(true);
  });

  test("phoneNumber format tidak valid harus ditolak", () => {
    const result = validateCheckout({ ...validInput, phoneNumber: "abc-xyz" });
    expect(result.valid).toBe(false);
  });

  test("phoneNumber terlalu pendek (<8 digit) harus ditolak", () => {
    const result = validateCheckout({ ...validInput, phoneNumber: "12345" });
    expect(result.valid).toBe(false);
  });

  // Multiple errors
  test("beberapa field kosong harus menghasilkan banyak error", () => {
    const result = validateCheckout({
      isLoggedIn:      true,
      cartItemCount:   1,
      recipientName:   "",
      shippingAddress: "",
      phoneNumber:     "",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });

  test("semua field kosong + tidak login menghasilkan semua error", () => {
    const result = validateCheckout({
      isLoggedIn:      false,
      cartItemCount:   0,
      recipientName:   "",
      shippingAddress: "",
      phoneNumber:     "",
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
  });
});

// ─────────────────────────────────────────────────────────────
// isValidOrderStatus — Type Guard
// ─────────────────────────────────────────────────────────────

describe("isValidOrderStatus — Type Guard", () => {
  test("'DRAFT' harus valid", () => {
    expect(isValidOrderStatus("DRAFT")).toBe(true);
  });

  test("'CONFIRMED' harus valid", () => {
    expect(isValidOrderStatus("CONFIRMED")).toBe(true);
  });

  test("'COMPLETED' harus valid", () => {
    expect(isValidOrderStatus("COMPLETED")).toBe(true);
  });

  test("'CANCELLED' harus valid", () => {
    expect(isValidOrderStatus("CANCELLED")).toBe(true);
  });

  test("'draft' (lowercase) harus tidak valid", () => {
    expect(isValidOrderStatus("draft")).toBe(false);
  });

  test("'PENDING' (tidak dikenal) harus tidak valid", () => {
    expect(isValidOrderStatus("PENDING")).toBe(false);
  });

  test("string kosong harus tidak valid", () => {
    expect(isValidOrderStatus("")).toBe(false);
  });

  test("null harus tidak valid", () => {
    expect(isValidOrderStatus(null)).toBe(false);
  });

  test("undefined harus tidak valid", () => {
    expect(isValidOrderStatus(undefined)).toBe(false);
  });

  test("angka harus tidak valid", () => {
    expect(isValidOrderStatus(1)).toBe(false);
  });

  test("VALID_ORDER_STATUSES mengandung 4 nilai", () => {
    expect(VALID_ORDER_STATUSES).toHaveLength(4);
    expect(VALID_ORDER_STATUSES).toContain("DRAFT");
    expect(VALID_ORDER_STATUSES).toContain("CONFIRMED");
    expect(VALID_ORDER_STATUSES).toContain("COMPLETED");
    expect(VALID_ORDER_STATUSES).toContain("CANCELLED");
  });
});
