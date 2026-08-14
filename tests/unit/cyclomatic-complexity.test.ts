/**
 * tests/unit/cyclomatic-complexity.test.ts
 *
 * ╔══════════════════════════════════════════════════════════════╗
 * ║    PHASE 14 — CYCLOMATIC COMPLEXITY & WHITE-BOX TESTING     ║
 * ║  Advanced Software Testing and Quality Assurance — UTS      ║
 * ║  LUMIÈRE SKIN Web Application Toko Skincare                 ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Fungsi yang Dianalisis:
 * ─────────────────────────────────────────────────────────────────
 * 1. validateCartQuantity()  — lib/validations/cart.ts
 *    Decisions: D1..D6 → V(G) = 6 + 1 = 7
 *    Independent Paths: P1..P7
 *
 * 2. validateStatusTransition() — lib/validations/order.ts
 *    Decisions: D1..D7 → V(G) = 7 + 1 = 8
 *    Independent Paths: P1..P8
 *
 * Total Test Cases: 28 (14 per fungsi, satu per independent path + extra)
 */

import {
  validateCartQuantity,
  CART_MIN_QUANTITY,
  CART_MAX_QUANTITY,
} from "@/lib/validations/cart";

import {
  validateStatusTransition,
  type OrderStatus,
} from "@/lib/validations/order";

// ════════════════════════════════════════════════════════════════
// FUNGSI 1: validateCartQuantity()
// ════════════════════════════════════════════════════════════════
//
// SOURCE CODE (lib/validations/cart.ts, baris 27-73):
//
//   function validateCartQuantity(quantity: unknown, availableStock: number) {
//     if (typeof quantity !== "number" && typeof quantity !== "string")  D1
//       return { valid: false, error: "Jumlah harus berupa angka" };
//     const numQty = Number(quantity);
//     if (isNaN(numQty))                                                 D2
//       return { valid: false, error: "Jumlah harus berupa angka..." };
//     if (!Number.isInteger(numQty))                                     D3
//       return { valid: false, error: "Jumlah tidak boleh pecahan" };
//     if (numQty <= 0)                                                   D4
//       return { valid: false, error: "Jumlah minimal 1 unit" };
//     if (numQty > CART_MAX_QUANTITY)                                    D5
//       return { valid: false, error: "Jumlah maksimal 10 unit" };
//     if (numQty > availableStock)                                       D6
//       return { valid: false, error: "Jumlah melebihi stok" };
//     return { valid: true, error: null };
//   }
//
// ┌──────────────────────────────────────────────────────────────┐
// │  CONTROL FLOW GRAPH — validateCartQuantity()                  │
// │                                                              │
// │  START → [D1: type check]                                    │
// │             │ true → [return: TYPE ERROR] → END              │
// │             │ false                                          │
// │          ↓                                                   │
// │         [D2: isNaN check]                                    │
// │             │ true → [return: NaN ERROR] → END               │
// │             │ false                                          │
// │          ↓                                                   │
// │         [D3: integer check]                                  │
// │             │ true → [return: FRACTION ERROR] → END          │
// │             │ false                                          │
// │          ↓                                                   │
// │         [D4: minimum check (≤ 0)]                            │
// │             │ true → [return: MIN ERROR] → END               │
// │             │ false                                          │
// │          ↓                                                   │
// │         [D5: maximum check (> 10)]                           │
// │             │ true → [return: MAX ERROR] → END               │
// │             │ false                                          │
// │          ↓                                                   │
// │         [D6: stock check (> stock)]                          │
// │             │ true → [return: STOCK ERROR] → END             │
// │             │ false                                          │
// │          ↓                                                   │
// │         [return: VALID] → END                                │
// └──────────────────────────────────────────────────────────────┘
//
// V(G) = E - N + 2P = (13-8+2) = 7
//   Edges(E)    = 13
//   Nodes(N)    = 8
//   Components(P) = 1
// OR simpler: V(G) = number of decisions + 1 = 6 + 1 = 7
//
// ─── 7 INDEPENDENT PATHS ─────────────────────────────────────
//
//   Path | D1 | D2 | D3 | D4 | D5 | D6 | Result
//   P1   |  F |  F |  F |  F |  F |  F | VALID
//   P2   |  T |  - |  - |  - |  - |  - | TYPE ERROR
//   P3   |  F |  T |  - |  - |  - |  - | NaN ERROR
//   P4   |  F |  F |  T |  - |  - |  - | FRACTION ERROR
//   P5   |  F |  F |  F |  T |  - |  - | MIN ERROR
//   P6   |  F |  F |  F |  F |  T |  - | MAX ERROR
//   P7   |  F |  F |  F |  F |  F |  T | STOCK ERROR

describe("FUNGSI 1 — validateCartQuantity() | V(G) = 7", () => {

  // ─── Informasi Fungsi ────────────────────────────────────────
  describe("Metadata Fungsi", () => {
    test("CART_MIN_QUANTITY = 1", () => expect(CART_MIN_QUANTITY).toBe(1));
    test("CART_MAX_QUANTITY = 10", () => expect(CART_MAX_QUANTITY).toBe(10));
  });

  // ─── P1: Path Terpanjang (Happy Path) ───────────────────────
  // D1=F, D2=F, D3=F, D4=F, D5=F, D6=F → VALID
  describe("P1: Happy Path — semua kondisi terpenuhi (D1=F,D2=F,D3=F,D4=F,D5=F,D6=F)", () => {
    test("P1-a: qty=1 (minimum valid), stock=50 → VALID", () => {
      const r = validateCartQuantity(1, 50);
      expect(r.valid).toBe(true);
      expect(r.error).toBeNull();
    });

    test("P1-b: qty=5 (median), stock=10 → VALID", () => {
      const r = validateCartQuantity(5, 10);
      expect(r.valid).toBe(true);
      expect(r.error).toBeNull();
    });

    test("P1-c: qty=10 (maximum valid), stock=50 → VALID", () => {
      const r = validateCartQuantity(10, 50);
      expect(r.valid).toBe(true);
      expect(r.error).toBeNull();
    });

    test("P1-d: qty='3' (string numerik), stock=20 → VALID (D1=F karena string)", () => {
      const r = validateCartQuantity("3", 20);
      expect(r.valid).toBe(true);
      expect(r.error).toBeNull();
    });
  });

  // ─── P2: D1=T → TYPE ERROR ──────────────────────────────────
  // quantity bukan number dan bukan string
  describe("P2: D1=true — input bukan number/string → TYPE ERROR", () => {
    test("P2-a: qty=null → TYPE ERROR (D1=T karena bukan number/string)", () => {
      const r = validateCartQuantity(null, 50);
      expect(r.valid).toBe(false);
      expect(r.error).toContain("angka");
    });

    test("P2-b: qty=undefined → TYPE ERROR", () => {
      const r = validateCartQuantity(undefined, 50);
      expect(r.valid).toBe(false);
    });

    test("P2-c: qty=true (boolean) → TYPE ERROR", () => {
      const r = validateCartQuantity(true, 50);
      expect(r.valid).toBe(false);
    });

    test("P2-d: qty=[] (array) → TYPE ERROR", () => {
      const r = validateCartQuantity([], 50);
      expect(r.valid).toBe(false);
    });
  });

  // ─── P3: D1=F, D2=T → NaN ERROR ─────────────────────────────
  // quantity adalah string non-numerik
  describe("P3: D2=true — string non-numerik → NaN ERROR", () => {
    test("P3-a: qty='abc' → NaN ERROR (D1=F, D2=T)", () => {
      const r = validateCartQuantity("abc", 50);
      expect(r.valid).toBe(false);
      expect(r.error).toContain("angka");
    });

    test("P3-b: qty='satu' → NaN ERROR", () => {
      const r = validateCartQuantity("satu", 50);
      expect(r.valid).toBe(false);
    });

    test("P3-c: qty='' (string kosong) → NaN ERROR", () => {
      const r = validateCartQuantity("", 50);
      expect(r.valid).toBe(false);
    });
  });

  // ─── P4: D1=F, D2=F, D3=T → FRACTION ERROR ──────────────────
  // quantity adalah angka pecahan
  describe("P4: D3=true — pecahan (non-integer) → FRACTION ERROR", () => {
    test("P4-a: qty=2.5 → FRACTION ERROR (D1=F, D2=F, D3=T)", () => {
      const r = validateCartQuantity(2.5, 50);
      expect(r.valid).toBe(false);
      expect(r.error).toContain("pecahan");
    });

    test("P4-b: qty=1.1 → FRACTION ERROR", () => {
      const r = validateCartQuantity(1.1, 50);
      expect(r.valid).toBe(false);
    });

    test("P4-c: qty='2.5' (string pecahan) → FRACTION ERROR", () => {
      const r = validateCartQuantity("2.5", 50);
      expect(r.valid).toBe(false);
    });
  });

  // ─── P5: D1=F, D2=F, D3=F, D4=T → MINIMUM ERROR ─────────────
  // quantity <= 0
  describe("P5: D4=true — qty ≤ 0 → MINIMUM ERROR", () => {
    test("P5-a: qty=0 → MIN ERROR (D1=F, D2=F, D3=F, D4=T)", () => {
      const r = validateCartQuantity(0, 50);
      expect(r.valid).toBe(false);
      expect(r.error).toContain("minimal");
    });

    test("P5-b: qty=-1 → MIN ERROR", () => {
      const r = validateCartQuantity(-1, 50);
      expect(r.valid).toBe(false);
    });

    test("P5-c: qty=-10 → MIN ERROR", () => {
      const r = validateCartQuantity(-10, 50);
      expect(r.valid).toBe(false);
    });

    // Boundary: tepat di batas
    test("P5-boundary: qty=0 (at boundary) → invalid", () => {
      expect(validateCartQuantity(0, 50).valid).toBe(false);
    });
    test("P5-boundary+1: qty=1 (above boundary) → valid", () => {
      expect(validateCartQuantity(1, 50).valid).toBe(true);
    });
  });

  // ─── P6: D1=F, D2=F, D3=F, D4=F, D5=T → MAXIMUM ERROR ──────
  // quantity > CART_MAX_QUANTITY (> 10)
  describe("P6: D5=true — qty > 10 → MAXIMUM ERROR", () => {
    test("P6-a: qty=11 → MAX ERROR (D1=F, D2=F, D3=F, D4=F, D5=T)", () => {
      const r = validateCartQuantity(11, 50);
      expect(r.valid).toBe(false);
      expect(r.error).toContain("maksimal");
    });

    test("P6-b: qty=20 → MAX ERROR", () => {
      const r = validateCartQuantity(20, 50);
      expect(r.valid).toBe(false);
    });

    // Boundary: tepat di batas maksimum
    test("P6-boundary: qty=10 (at max) → valid", () => {
      expect(validateCartQuantity(10, 50).valid).toBe(true);
    });
    test("P6-boundary+1: qty=11 (above max) → invalid", () => {
      expect(validateCartQuantity(11, 50).valid).toBe(false);
    });
  });

  // ─── P7: D1=F..D5=F, D6=T → STOCK ERROR ─────────────────────
  // quantity dalam range valid tapi melebihi stok
  describe("P7: D6=true — qty > stock → STOCK ERROR", () => {
    test("P7-a: qty=4, stock=3 → STOCK ERROR (D1=F..D5=F, D6=T)", () => {
      const r = validateCartQuantity(4, 3);
      expect(r.valid).toBe(false);
      expect(r.error).toContain("stok");
    });

    test("P7-b: qty=10, stock=5 → STOCK ERROR", () => {
      const r = validateCartQuantity(10, 5);
      expect(r.valid).toBe(false);
    });

    test("P7-c: qty=1, stock=0 → STOCK ERROR (stok habis)", () => {
      const r = validateCartQuantity(1, 0);
      expect(r.valid).toBe(false);
    });

    // Boundary: stock = qty (tepat sama)
    test("P7-boundary: qty=5, stock=5 (exactly equal) → valid", () => {
      expect(validateCartQuantity(5, 5).valid).toBe(true);
    });
    test("P7-boundary+1: qty=6, stock=5 (one over) → invalid", () => {
      expect(validateCartQuantity(6, 5).valid).toBe(false);
    });
  });

  // ─── Verifikasi V(G) = 7 (jumlah path = jumlah V(G)) ─────────
  describe("Verifikasi V(G) = 7 (7 independent paths)", () => {
    test("Total independent paths yang dapat diuji = 7", () => {
      // Setiap path mewakili jalur berbeda di Control Flow Graph
      // P1 (valid), P2 (type), P3 (NaN), P4 (fraction), P5 (min), P6 (max), P7 (stock)
      const testedPaths = [
        validateCartQuantity(5, 50).valid,       // P1: valid
        validateCartQuantity(null, 50).valid,    // P2: type error
        validateCartQuantity("abc", 50).valid,   // P3: NaN
        validateCartQuantity(2.5, 50).valid,     // P4: fraction
        validateCartQuantity(0, 50).valid,       // P5: minimum
        validateCartQuantity(11, 50).valid,      // P6: maximum
        validateCartQuantity(4, 3).valid,        // P7: stock
      ];
      const uniqueResults = [true, false, false, false, false, false, false];
      expect(testedPaths).toEqual(uniqueResults);
      expect(testedPaths).toHaveLength(7); // V(G) = 7
    });
  });
});


// ════════════════════════════════════════════════════════════════
// FUNGSI 2: validateStatusTransition()
// ════════════════════════════════════════════════════════════════
//
// SOURCE CODE (lib/validations/order.ts, baris 58-112):
//
//   function validateStatusTransition(current, newStatus) {
//     if (current === newStatus)              D1 → SAME STATUS ERROR
//     if (current === "COMPLETED")            D2 → COMPLETED FINAL
//     if (current === "CANCELLED")            D3 → CANCELLED FINAL
//     if (current === "DRAFT") {             D4 → enter DRAFT branch
//       if (newStatus === "CONFIRMED"         D5 → DRAFT valid targets
//            || newStatus === "CANCELLED")
//         return valid;
//       return DRAFT invalid;
//     }
//     if (current === "CONFIRMED") {         D6 → enter CONFIRMED branch
//       if (newStatus === "COMPLETED"         D7 → CONFIRMED valid targets
//            || newStatus === "CANCELLED")
//         return valid;
//       return CONFIRMED invalid;
//     }
//     return fallback invalid;
//   }
//
// ┌──────────────────────────────────────────────────────────────┐
// │  CONTROL FLOW GRAPH — validateStatusTransition()             │
// │                                                              │
// │  START → [D1: same status?]                                  │
// │             │ true → [return: SAME ERROR] → END              │
// │             │ false                                          │
// │          ↓                                                   │
// │         [D2: current === COMPLETED?]                         │
// │             │ true → [return: COMPLETED FINAL] → END         │
// │             │ false                                          │
// │          ↓                                                   │
// │         [D3: current === CANCELLED?]                         │
// │             │ true → [return: CANCELLED FINAL] → END         │
// │             │ false                                          │
// │          ↓                                                   │
// │         [D4: current === DRAFT?]                             │
// │             │ true                                           │
// │             │   → [D5: new in {CONFIRMED,CANCELLED}?]        │
// │             │         │ true  → [return: VALID] → END        │
// │             │         │ false → [return: DRAFT INV.] → END   │
// │             │ false                                          │
// │          ↓                                                   │
// │         [D6: current === CONFIRMED?]                         │
// │             │ true                                           │
// │             │   → [D7: new in {COMPLETED,CANCELLED}?]        │
// │             │         │ true  → [return: VALID] → END        │
// │             │         │ false → [return: CONF INV.] → END    │
// │             │ false                                          │
// │          ↓                                                   │
// │         [return: FALLBACK ERROR] → END                       │
// └──────────────────────────────────────────────────────────────┘
//
// V(G) = number of decisions + 1 = 7 + 1 = 8
//
// ─── 8 INDEPENDENT PATHS ──────────────────────────────────────
//
//   Path | D1 | D2 | D3 | D4 | D5 | D6 | D7 | Result
//   P1   |  T |  - |  - |  - |  - |  - |  - | SAME STATUS ERROR
//   P2   |  F |  T |  - |  - |  - |  - |  - | COMPLETED FINAL
//   P3   |  F |  F |  T |  - |  - |  - |  - | CANCELLED FINAL
//   P4   |  F |  F |  F |  T |  T |  - |  - | DRAFT → VALID
//   P5   |  F |  F |  F |  T |  F |  - |  - | DRAFT → INVALID
//   P6   |  F |  F |  F |  F |  - |  T |  T | CONFIRMED → VALID
//   P7   |  F |  F |  F |  F |  - |  T |  F | CONFIRMED → INVALID
//   P8   |  F |  F |  F |  F |  - |  F |  - | FALLBACK (unreachable in practice)

describe("FUNGSI 2 — validateStatusTransition() | V(G) = 8", () => {

  // ─── P1: D1=T → SAME STATUS ERROR ────────────────────────────
  describe("P1: D1=true — status sama → SAME STATUS ERROR", () => {
    test("P1-a: DRAFT → DRAFT (D1=T)", () => {
      const r = validateStatusTransition("DRAFT", "DRAFT");
      expect(r.valid).toBe(false);
      expect(r.error).toContain("DRAFT");
    });
    test("P1-b: CONFIRMED → CONFIRMED", () => {
      expect(validateStatusTransition("CONFIRMED", "CONFIRMED").valid).toBe(false);
    });
    test("P1-c: COMPLETED → COMPLETED", () => {
      expect(validateStatusTransition("COMPLETED", "COMPLETED").valid).toBe(false);
    });
    test("P1-d: CANCELLED → CANCELLED", () => {
      expect(validateStatusTransition("CANCELLED", "CANCELLED").valid).toBe(false);
    });
  });

  // ─── P2: D1=F, D2=T → COMPLETED FINAL ────────────────────────
  describe("P2: D2=true — current=COMPLETED → FINAL STATE ERROR (BR-19)", () => {
    test("P2-a: COMPLETED → DRAFT (D1=F, D2=T)", () => {
      const r = validateStatusTransition("COMPLETED", "DRAFT");
      expect(r.valid).toBe(false);
      expect(r.error).toContain("selesai");
    });
    test("P2-b: COMPLETED → CONFIRMED", () => {
      expect(validateStatusTransition("COMPLETED", "CONFIRMED").valid).toBe(false);
    });
    test("P2-c: COMPLETED → CANCELLED", () => {
      expect(validateStatusTransition("COMPLETED", "CANCELLED").valid).toBe(false);
    });
  });

  // ─── P3: D1=F, D2=F, D3=T → CANCELLED FINAL ─────────────────
  describe("P3: D3=true — current=CANCELLED → FINAL STATE ERROR (BR-20)", () => {
    test("P3-a: CANCELLED → DRAFT (D1=F, D2=F, D3=T)", () => {
      const r = validateStatusTransition("CANCELLED", "DRAFT");
      expect(r.valid).toBe(false);
      expect(r.error).toContain("dibatalkan");
    });
    test("P3-b: CANCELLED → CONFIRMED", () => {
      expect(validateStatusTransition("CANCELLED", "CONFIRMED").valid).toBe(false);
    });
    test("P3-c: CANCELLED → COMPLETED", () => {
      expect(validateStatusTransition("CANCELLED", "COMPLETED").valid).toBe(false);
    });
  });

  // ─── P4: D1=F, D2=F, D3=F, D4=T, D5=T → DRAFT VALID ─────────
  describe("P4: D4=T, D5=T — DRAFT → valid target (BR-15, BR-16)", () => {
    test("P4-a: DRAFT → CONFIRMED (D4=T, D5=T: CONFIRMED is valid)", () => {
      const r = validateStatusTransition("DRAFT", "CONFIRMED");
      expect(r.valid).toBe(true);
      expect(r.error).toBeNull();
    });
    test("P4-b: DRAFT → CANCELLED (D4=T, D5=T: CANCELLED is valid)", () => {
      const r = validateStatusTransition("DRAFT", "CANCELLED");
      expect(r.valid).toBe(true);
      expect(r.error).toBeNull();
    });
  });

  // ─── P5: D1=F, D2=F, D3=F, D4=T, D5=F → DRAFT INVALID ───────
  describe("P5: D4=T, D5=F — DRAFT → invalid target (loncat CONFIRMED)", () => {
    test("P5-a: DRAFT → COMPLETED (D4=T, D5=F: COMPLETED bukan target valid DRAFT)", () => {
      const r = validateStatusTransition("DRAFT", "COMPLETED");
      expect(r.valid).toBe(false);
      expect(r.error).toContain("DRAFT");
    });
  });

  // ─── P6: D4=F, D6=T, D7=T → CONFIRMED VALID ─────────────────
  describe("P6: D6=T, D7=T — CONFIRMED → valid target (BR-17, BR-18)", () => {
    test("P6-a: CONFIRMED → COMPLETED (D6=T, D7=T: COMPLETED is valid)", () => {
      const r = validateStatusTransition("CONFIRMED", "COMPLETED");
      expect(r.valid).toBe(true);
      expect(r.error).toBeNull();
    });
    test("P6-b: CONFIRMED → CANCELLED (D6=T, D7=T: CANCELLED is valid)", () => {
      const r = validateStatusTransition("CONFIRMED", "CANCELLED");
      expect(r.valid).toBe(true);
      expect(r.error).toBeNull();
    });
  });

  // ─── P7: D4=F, D6=T, D7=F → CONFIRMED INVALID ────────────────
  describe("P7: D6=T, D7=F — CONFIRMED → invalid target (mundur)", () => {
    test("P7-a: CONFIRMED → DRAFT (D6=T, D7=F: DRAFT bukan target valid CONFIRMED)", () => {
      const r = validateStatusTransition("CONFIRMED", "DRAFT");
      expect(r.valid).toBe(false);
      expect(r.error).toContain("CONFIRMED");
    });
  });

  // ─── P8: Fallback (secara teoritis unreachable) ────────────────
  describe("P8: Fallback path — tidak dapat dicapai dengan OrderStatus yang valid", () => {
    test("P8: fungsi mengembalikan hasil untuk semua 4 × 4 = 16 kombinasi status", () => {
      const statuses: OrderStatus[] = ["DRAFT", "CONFIRMED", "COMPLETED", "CANCELLED"];
      let totalValid = 0;
      let totalInvalid = 0;

      statuses.forEach((from) => {
        statuses.forEach((to) => {
          const r = validateStatusTransition(from, to);
          if (r.valid) totalValid++;
          else totalInvalid++;
        });
      });

      // 4 valid: DRAFT→CONFIRMED, DRAFT→CANCELLED, CONFIRMED→COMPLETED, CONFIRMED→CANCELLED
      expect(totalValid).toBe(4);
      // 12 invalid: semua kombinasi lainnya
      expect(totalInvalid).toBe(12);
      // Total = 16 = 4×4
      expect(totalValid + totalInvalid).toBe(16);
    });
  });

  // ─── Verifikasi V(G) = 8 (jumlah path = jumlah V(G)) ─────────
  describe("Verifikasi V(G) = 8 (8 independent paths)", () => {
    test("8 independent paths mencakup semua cabang fungsi", () => {
      // Setiap path menempuh rute unik di Control Flow Graph
      const pathResults = [
        validateStatusTransition("DRAFT",     "DRAFT").valid,      // P1: same
        validateStatusTransition("COMPLETED", "DRAFT").valid,      // P2: completed final
        validateStatusTransition("CANCELLED", "DRAFT").valid,      // P3: cancelled final
        validateStatusTransition("DRAFT",     "CONFIRMED").valid,  // P4: draft valid
        validateStatusTransition("DRAFT",     "COMPLETED").valid,  // P5: draft invalid
        validateStatusTransition("CONFIRMED", "COMPLETED").valid,  // P6: confirmed valid
        validateStatusTransition("CONFIRMED", "DRAFT").valid,      // P7: confirmed invalid
        // P8 unreachable: all 4 status values handled by D1-D6
      ];
      const expected = [false, false, false, true, false, true, false];
      expect(pathResults).toEqual(expected);
    });
  });
});
