/**
 * tests/unit/tdd-checkout-validation.test.ts
 *
 * ╔══════════════════════════════════════════════════════════════╗
 * ║    PHASE 15 — TEST-DRIVEN DEVELOPMENT (TDD)                 ║
 * ║  Advanced Software Testing and Quality Assurance — UTS      ║
 * ║  LUMIÈRE SKIN Web Application Toko Skincare                 ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Fungsi yang dikembangkan dengan TDD:
 * 1. validateRecipientName()  — validasi nama penerima checkout
 * 2. validateIndonesianPhone() — validasi nomor telepon Indonesia
 *
 * Setiap fungsi melalui siklus: RED → GREEN → REFACTOR
 *
 * File ini DITULIS LEBIH DULU sebelum implementasi (TDD approach).
 */

import {
  validateRecipientName,
  validateIndonesianPhone,
  type CheckoutFieldResult,
} from "@/lib/validations/checkout";

// ════════════════════════════════════════════════════════════════
// TDD FUNGSI 1: validateRecipientName()
// ════════════════════════════════════════════════════════════════
//
// Business Rules:
// BR-RN01: Name harus berupa string
// BR-RN02: Name tidak boleh kosong atau hanya whitespace
// BR-RN03: Name minimal 2 karakter (setelah di-trim)
// BR-RN04: Name maksimal 100 karakter
// BR-RN05: Name tidak boleh mengandung angka
// BR-RN06: Name tidak boleh mengandung karakter khusus
//           (hanya huruf, spasi, apostrophe, hyphen diizinkan)

describe("TDD FUNGSI 1 — validateRecipientName()", () => {

  // ── Kasus Valid ───────────────────────────────────────────────
  describe("Kasus Valid", () => {

    test("V-01: Nama lengkap normal harus diterima", () => {
      const result = validateRecipientName("Sarah Putri");
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test("V-02: Nama dengan 2 karakter (batas bawah) harus diterima", () => {
      const result = validateRecipientName("Al");
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test("V-03: Nama dengan apostrophe (misal O'Brien) harus diterima", () => {
      const result = validateRecipientName("O'Brien");
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test("V-04: Nama dengan hyphen (misal Anna-Maria) harus diterima", () => {
      const result = validateRecipientName("Anna-Maria");
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test("V-05: Nama dengan spasi di awal/akhir harus diterima (auto-trim)", () => {
      const result = validateRecipientName("  Sarah Putri  ");
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test("V-06: Nama dengan 100 karakter (batas atas) harus diterima", () => {
      const longName = "A".repeat(50) + " " + "B".repeat(49); // 100 chars
      const result = validateRecipientName(longName);
      expect(result.valid).toBe(true);
    });
  });

  // ── Kasus Tidak Valid — BR-RN01 (tipe data) ───────────────────
  describe("Kasus Tidak Valid — BR-RN01: harus string", () => {

    test("IV-01: null harus ditolak (BR-RN01)", () => {
      const result = validateRecipientName(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test("IV-02: undefined harus ditolak (BR-RN01)", () => {
      const result = validateRecipientName(undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test("IV-03: angka (12345) harus ditolak (BR-RN01)", () => {
      const result = validateRecipientName(12345);
      expect(result.valid).toBe(false);
    });
  });

  // ── Kasus Tidak Valid — BR-RN02 (kosong) ──────────────────────
  describe("Kasus Tidak Valid — BR-RN02: tidak boleh kosong", () => {

    test("IV-04: string kosong harus ditolak (BR-RN02)", () => {
      const result = validateRecipientName("");
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test("IV-05: hanya spasi harus ditolak (BR-RN02)", () => {
      const result = validateRecipientName("   ");
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  // ── Kasus Tidak Valid — BR-RN03 (terlalu pendek) ─────────────
  describe("Kasus Tidak Valid — BR-RN03: minimal 2 karakter", () => {

    test("IV-06: 1 karakter harus ditolak (BR-RN03)", () => {
      const result = validateRecipientName("A");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("2");
    });

    test("IV-07: 1 karakter + spasi harus ditolak (setelah trim = 1 char)", () => {
      const result = validateRecipientName("A ");
      expect(result.valid).toBe(false);
    });
  });

  // ── Kasus Tidak Valid — BR-RN04 (terlalu panjang) ────────────
  describe("Kasus Tidak Valid — BR-RN04: maksimal 100 karakter", () => {

    test("IV-08: 101 karakter harus ditolak (BR-RN04)", () => {
      const result = validateRecipientName("A".repeat(101));
      expect(result.valid).toBe(false);
      expect(result.error).toContain("100");
    });
  });

  // ── Kasus Tidak Valid — BR-RN05 (mengandung angka) ───────────
  describe("Kasus Tidak Valid — BR-RN05: tidak boleh mengandung angka", () => {

    test("IV-09: Nama dengan angka harus ditolak (BR-RN05)", () => {
      const result = validateRecipientName("Sarah1234");
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test("IV-10: Nama hanya angka harus ditolak (BR-RN05)", () => {
      const result = validateRecipientName("12345");
      expect(result.valid).toBe(false);
    });
  });

  // ── Kasus Tidak Valid — BR-RN06 (karakter khusus) ────────────
  describe("Kasus Tidak Valid — BR-RN06: tidak boleh karakter khusus", () => {

    test("IV-11: Nama dengan '@' harus ditolak (BR-RN06)", () => {
      const result = validateRecipientName("Sarah@email");
      expect(result.valid).toBe(false);
    });

    test("IV-12: Nama dengan '!' harus ditolak (BR-RN06)", () => {
      const result = validateRecipientName("Sarah!");
      expect(result.valid).toBe(false);
    });

    test("IV-13: Nama dengan '#' harus ditolak (BR-RN06)", () => {
      const result = validateRecipientName("Sarah#Putri");
      expect(result.valid).toBe(false);
    });
  });

  // ── Boundary Value Analysis ────────────────────────────────────
  describe("Boundary Value Analysis", () => {

    test("BVA-01: 1 karakter (below min) → invalid", () => {
      expect(validateRecipientName("A").valid).toBe(false);
    });

    test("BVA-02: 2 karakter (at min) → valid", () => {
      expect(validateRecipientName("Al").valid).toBe(true);
    });

    test("BVA-03: 3 karakter (above min) → valid", () => {
      expect(validateRecipientName("Ali").valid).toBe(true);
    });

    test("BVA-04: 99 karakter (below max) → valid", () => {
      expect(validateRecipientName("A".repeat(99)).valid).toBe(true);
    });

    test("BVA-05: 100 karakter (at max) → valid", () => {
      expect(validateRecipientName("A".repeat(100)).valid).toBe(true);
    });

    test("BVA-06: 101 karakter (above max) → invalid", () => {
      expect(validateRecipientName("A".repeat(101)).valid).toBe(false);
    });
  });
});


// ════════════════════════════════════════════════════════════════
// TDD FUNGSI 2: validateIndonesianPhone()
// ════════════════════════════════════════════════════════════════
//
// Business Rules:
// BR-PH01: Phone harus berupa string
// BR-PH02: Phone tidak boleh kosong
// BR-PH03: Phone Indonesia harus dimulai dengan '08' atau '+628'
// BR-PH04: Panjang digit phone 10-13 digit (nomor lokal tanpa +62)
// BR-PH05: Phone hanya boleh berisi digit, +, -, spasi, tanda kurung

describe("TDD FUNGSI 2 — validateIndonesianPhone()", () => {

  // ── Kasus Valid ───────────────────────────────────────────────
  describe("Kasus Valid", () => {

    test("V-01: Format 08xx standar (10 digit) harus diterima", () => {
      const result = validateIndonesianPhone("081234567890");
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test("V-02: Format 08xx dengan 11 digit harus diterima", () => {
      const result = validateIndonesianPhone("08123456789");
      expect(result.valid).toBe(true);
    });

    test("V-03: Format +628xx harus diterima", () => {
      const result = validateIndonesianPhone("+6281234567890");
      expect(result.valid).toBe(true);
    });

    test("V-04: Format dengan spasi (08xx xxxx xxxx) harus diterima", () => {
      const result = validateIndonesianPhone("0812 3456 7890");
      expect(result.valid).toBe(true);
    });

    test("V-05: Format dengan tanda hubung (08xx-xxxx-xxxx) harus diterima", () => {
      const result = validateIndonesianPhone("0812-3456-7890");
      expect(result.valid).toBe(true);
    });
  });

  // ── Kasus Tidak Valid — BR-PH01 (tipe data) ───────────────────
  describe("Kasus Tidak Valid — BR-PH01: harus string", () => {

    test("IV-01: null harus ditolak (BR-PH01)", () => {
      const result = validateIndonesianPhone(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test("IV-02: undefined harus ditolak (BR-PH01)", () => {
      const result = validateIndonesianPhone(undefined);
      expect(result.valid).toBe(false);
    });

    test("IV-03: angka (81234567890) harus ditolak (BR-PH01)", () => {
      const result = validateIndonesianPhone(81234567890);
      expect(result.valid).toBe(false);
    });
  });

  // ── Kasus Tidak Valid — BR-PH02 (kosong) ──────────────────────
  describe("Kasus Tidak Valid — BR-PH02: tidak boleh kosong", () => {

    test("IV-04: string kosong harus ditolak (BR-PH02)", () => {
      const result = validateIndonesianPhone("");
      expect(result.valid).toBe(false);
    });

    test("IV-05: hanya spasi harus ditolak (BR-PH02)", () => {
      const result = validateIndonesianPhone("   ");
      expect(result.valid).toBe(false);
    });
  });

  // ── Kasus Tidak Valid — BR-PH03 (format Indonesia) ────────────
  describe("Kasus Tidak Valid — BR-PH03: harus format Indonesia", () => {

    test("IV-06: Nomor tanpa awalan 08 harus ditolak (BR-PH03)", () => {
      const result = validateIndonesianPhone("91234567890");
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test("IV-07: Nomor asing (misal +1 US) harus ditolak (BR-PH03)", () => {
      const result = validateIndonesianPhone("+12025551234");
      expect(result.valid).toBe(false);
    });

    test("IV-08: Nomor dimulai 021 (Jakarta landline) harus ditolak (BR-PH03)", () => {
      const result = validateIndonesianPhone("0211234567");
      expect(result.valid).toBe(false);
    });
  });

  // ── Kasus Tidak Valid — BR-PH04 (panjang) ─────────────────────
  describe("Kasus Tidak Valid — BR-PH04: 10-13 digit", () => {

    test("IV-09: Nomor terlalu pendek (< 10 digit) harus ditolak (BR-PH04)", () => {
      const result = validateIndonesianPhone("0812345");
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test("IV-10: Nomor terlalu panjang (> 13 digit) harus ditolak (BR-PH04)", () => {
      const result = validateIndonesianPhone("081234567890123");
      expect(result.valid).toBe(false);
    });
  });

  // ── Kasus Tidak Valid — BR-PH05 (karakter tidak valid) ────────
  describe("Kasus Tidak Valid — BR-PH05: karakter harus valid", () => {

    test("IV-11: Nomor dengan huruf harus ditolak (BR-PH05)", () => {
      const result = validateIndonesianPhone("081234ABCDE");
      expect(result.valid).toBe(false);
    });

    test("IV-12: Nomor dengan '@' harus ditolak (BR-PH05)", () => {
      const result = validateIndonesianPhone("0812@456789");
      expect(result.valid).toBe(false);
    });
  });

  // ── Boundary Value Analysis ────────────────────────────────────
  describe("Boundary Value Analysis", () => {

    test("BVA-01: 9 digit (below min 10) → invalid", () => {
      // "081234567" = 9 digit
      expect(validateIndonesianPhone("081234567").valid).toBe(false);
    });

    test("BVA-02: 10 digit (at min) → valid", () => {
      // "0812345678" = 10 digit
      expect(validateIndonesianPhone("0812345678").valid).toBe(true);
    });

    test("BVA-03: 12 digit (common length) → valid", () => {
      // "081234567890" = 12 digit
      expect(validateIndonesianPhone("081234567890").valid).toBe(true);
    });

    test("BVA-04: 13 digit (at max) → valid", () => {
      // "0812345678901" = 13 digit
      expect(validateIndonesianPhone("0812345678901").valid).toBe(true);
    });

    test("BVA-05: 14 digit (above max) → invalid", () => {
      // "08123456789012" = 14 digit
      expect(validateIndonesianPhone("08123456789012").valid).toBe(false);
    });
  });
});
