/**
 * tests/unit/state-transition.test.ts
 *
 * ╔══════════════════════════════════════════════════════════════╗
 * ║         PHASE 13 — STATE TRANSITION TESTING                 ║
 * ║  Advanced Software Testing and Quality Assurance — UTS      ║
 * ║  LUMIÈRE SKIN Web Application Toko Skincare                 ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Proses Bisnis yang Diuji:
 * ─────────────────────────
 * 1. Order Status Management (4 state, 5 event, 6 valid transition)
 * 2. User Authentication    (2 state, 5 event, 5 valid transition)
 *
 * Total Test Cases: 41
 *   - Order Status : 28 test cases
 *   - Authentication: 13 test cases
 */

import {
  validateStatusTransition,
  VALID_ORDER_STATUSES,
  isValidOrderStatus,
  type OrderStatus,
} from "@/lib/validations/order";

import {
  transitionAuthState,
  validateLoginCredentials,
  generateTransitionTable,
  type AuthState,
  type AuthEvent,
} from "@/lib/state-machines/auth-state";

// ════════════════════════════════════════════════════════════════
// PROSES BISNIS 1: ORDER STATUS MANAGEMENT
// ════════════════════════════════════════════════════════════════
//
// State Diagram:
//
//           ┌──────────── CONFIRMED ────────────┐
//           │                                   │
//     ──► DRAFT ◄──────────                  COMPLETED (final)
//           │           tidak ada               │
//           └──────────── CANCELLED ────────────┘
//                        (final)
//
// States: DRAFT(S1), CONFIRMED(S2), COMPLETED(S3), CANCELLED(S4)
// Events:
//   E1: confirm   (DRAFT → CONFIRMED)
//   E2: complete  (CONFIRMED → COMPLETED)
//   E3: cancel    (DRAFT/CONFIRMED → CANCELLED)
//   E4: invalid   (any unsupported transition)
//
// Business Rules:
//   BR-14: Pesanan baru = DRAFT
//   BR-15: DRAFT → CONFIRMED (valid)
//   BR-16: DRAFT → CANCELLED (valid)
//   BR-17: CONFIRMED → COMPLETED (valid)
//   BR-18: CONFIRMED → CANCELLED (valid)
//   BR-19: COMPLETED → * (tidak valid)
//   BR-20: CANCELLED → * (tidak valid)

describe("PROSES BISNIS 1 — Order Status Management", () => {

  // ── TC-01 sampai TC-04: TRANSISI VALID ──────────────────────
  describe("TC-01..04: Transisi Valid (Expected: PASS)", () => {

    test("TC-01: DRAFT → CONFIRMED harus valid (BR-15)", () => {
      const result = validateStatusTransition("DRAFT", "CONFIRMED");
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test("TC-02: DRAFT → CANCELLED harus valid (BR-16)", () => {
      const result = validateStatusTransition("DRAFT", "CANCELLED");
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test("TC-03: CONFIRMED → COMPLETED harus valid (BR-17)", () => {
      const result = validateStatusTransition("CONFIRMED", "COMPLETED");
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test("TC-04: CONFIRMED → CANCELLED harus valid (BR-18)", () => {
      const result = validateStatusTransition("CONFIRMED", "CANCELLED");
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  // ── TC-05 sampai TC-08: TRANSISI TIDAK VALID DARI DRAFT ─────
  describe("TC-05..08: Transisi Tidak Valid dari DRAFT", () => {

    test("TC-05: DRAFT → COMPLETED harus ditolak (loncat status)", () => {
      const result = validateStatusTransition("DRAFT", "COMPLETED");
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
      expect(result.error).toContain("DRAFT");
    });

    test("TC-06: DRAFT → DRAFT harus ditolak (status sama)", () => {
      const result = validateStatusTransition("DRAFT", "DRAFT");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("DRAFT");
    });
  });

  // ── TC-07..10: TRANSISI TIDAK VALID DARI CONFIRMED ──────────
  describe("TC-07..10: Transisi Tidak Valid dari CONFIRMED", () => {

    test("TC-07: CONFIRMED → DRAFT harus ditolak (mundur)", () => {
      const result = validateStatusTransition("CONFIRMED", "DRAFT");
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test("TC-08: CONFIRMED → CONFIRMED harus ditolak (status sama)", () => {
      const result = validateStatusTransition("CONFIRMED", "CONFIRMED");
      expect(result.valid).toBe(false);
    });
  });

  // ── TC-09..14: STATUS COMPLETED = FINAL (BR-19) ─────────────
  describe("TC-09..14: Status COMPLETED tidak dapat diubah (BR-19)", () => {
    const invalidTargets: OrderStatus[] = ["DRAFT", "CONFIRMED", "CANCELLED"];

    invalidTargets.forEach((target, idx) => {
      test(`TC-${9 + idx}: COMPLETED → ${target} harus ditolak (BR-19)`, () => {
        const result = validateStatusTransition("COMPLETED", target);
        expect(result.valid).toBe(false);
        expect(result.error).toContain("selesai");
      });
    });

    test("TC-12: COMPLETED → COMPLETED harus ditolak (status sama)", () => {
      const result = validateStatusTransition("COMPLETED", "COMPLETED");
      expect(result.valid).toBe(false);
    });

    test("TC-13: Error message COMPLETED informatif", () => {
      const result = validateStatusTransition("COMPLETED", "CANCELLED");
      expect(result.error).toBeTruthy();
      expect(typeof result.error).toBe("string");
      expect(result.error!.length).toBeGreaterThan(5);
    });
  });

  // ── TC-14..19: STATUS CANCELLED = FINAL (BR-20) ─────────────
  describe("TC-14..19: Status CANCELLED tidak dapat diaktifkan kembali (BR-20)", () => {
    const invalidTargets: OrderStatus[] = ["DRAFT", "CONFIRMED", "COMPLETED"];

    invalidTargets.forEach((target, idx) => {
      test(`TC-${14 + idx}: CANCELLED → ${target} harus ditolak (BR-20)`, () => {
        const result = validateStatusTransition("CANCELLED", target);
        expect(result.valid).toBe(false);
        expect(result.error).toContain("dibatalkan");
      });
    });

    test("TC-17: CANCELLED → CANCELLED harus ditolak (status sama)", () => {
      const result = validateStatusTransition("CANCELLED", "CANCELLED");
      expect(result.valid).toBe(false);
    });

    test("TC-18: Error message CANCELLED informatif", () => {
      const result = validateStatusTransition("CANCELLED", "CONFIRMED");
      expect(result.error).toBeTruthy();
      expect(result.error!.length).toBeGreaterThan(5);
    });
  });

  // ── TC-19..22: VALIDASI ENUM STATUS ─────────────────────────
  describe("TC-19..22: Validasi enum OrderStatus", () => {

    test("TC-19: VALID_ORDER_STATUSES berisi 4 nilai", () => {
      expect(VALID_ORDER_STATUSES).toHaveLength(4);
    });

    test("TC-20: 'DRAFT' adalah status yang valid", () => {
      expect(isValidOrderStatus("DRAFT")).toBe(true);
    });

    test("TC-21: 'PENDING' bukan status yang valid (tidak dikenal)", () => {
      expect(isValidOrderStatus("PENDING")).toBe(false);
    });

    test("TC-22: String kosong bukan status yang valid", () => {
      expect(isValidOrderStatus("")).toBe(false);
    });
  });

  // ── Skenario End-to-End (Alur Lengkap) ──────────────────────
  describe("TC-23..28: Skenario Alur Lengkap", () => {

    test("TC-23: Alur sukses — DRAFT → CONFIRMED → COMPLETED", () => {
      expect(validateStatusTransition("DRAFT",     "CONFIRMED").valid).toBe(true);
      expect(validateStatusTransition("CONFIRMED", "COMPLETED").valid).toBe(true);
    });

    test("TC-24: Alur pembatalan awal — DRAFT → CANCELLED", () => {
      expect(validateStatusTransition("DRAFT", "CANCELLED").valid).toBe(true);
    });

    test("TC-25: Alur pembatalan setelah konfirmasi — CONFIRMED → CANCELLED", () => {
      expect(validateStatusTransition("CONFIRMED", "CANCELLED").valid).toBe(true);
    });

    test("TC-26: Tidak bisa loncat dari DRAFT ke COMPLETED (BR-15 enforced)", () => {
      expect(validateStatusTransition("DRAFT", "COMPLETED").valid).toBe(false);
    });

    test("TC-27: Tidak bisa mengaktifkan pesanan yang sudah COMPLETED (BR-19)", () => {
      const targets: OrderStatus[] = ["DRAFT", "CONFIRMED", "CANCELLED"];
      targets.forEach((t) => {
        expect(validateStatusTransition("COMPLETED", t).valid).toBe(false);
      });
    });

    test("TC-28: Tidak bisa mengaktifkan pesanan yang sudah CANCELLED (BR-20)", () => {
      const targets: OrderStatus[] = ["DRAFT", "CONFIRMED", "COMPLETED"];
      targets.forEach((t) => {
        expect(validateStatusTransition("CANCELLED", t).valid).toBe(false);
      });
    });
  });
});


// ════════════════════════════════════════════════════════════════
// PROSES BISNIS 2: USER AUTHENTICATION (LOGIN STATE)
// ════════════════════════════════════════════════════════════════
//
// State Diagram:
//
//    ┌─────────────────────────┐
//    │   UNAUTHENTICATED (S1)  │ ◄──── initial state
//    └─────────────────────────┘
//        │ E1: login_success
//        ▼
//    ┌─────────────────────────┐
//    │   AUTHENTICATED (S2)    │
//    └─────────────────────────┘
//        │ E4: logout
//        │ E5: token_expired
//        ▼
//    UNAUTHENTICATED (S1)
//
// Events:
//   E1: LOGIN_SUCCESS           (S1 → S2)
//   E2: LOGIN_FAILURE_INVALID   (S1 → S1, stays)
//   E3: LOGIN_FAILURE_EMPTY     (S1 → S1, stays)
//   E4: LOGOUT                  (S2 → S1)
//   E5: TOKEN_EXPIRED           (S2 → S1)

describe("PROSES BISNIS 2 — User Authentication (Login State)", () => {

  // ── TC-29..33: TRANSISI VALID ────────────────────────────────
  describe("TC-29..33: Transisi Valid (Expected: PASS)", () => {

    test("TC-29: S1 + LOGIN_SUCCESS → S2 (login berhasil)", () => {
      const result = transitionAuthState("UNAUTHENTICATED", "LOGIN_SUCCESS");
      expect(result.success).toBe(true);
      expect(result.nextState).toBe("AUTHENTICATED");
    });

    test("TC-30: S1 + LOGIN_FAILURE_INVALID → S1 (credentials salah, state tidak berubah)", () => {
      const result = transitionAuthState("UNAUTHENTICATED", "LOGIN_FAILURE_INVALID");
      expect(result.success).toBe(false);
      expect(result.nextState).toBe("UNAUTHENTICATED");
      expect(result.error).toBeTruthy();
    });

    test("TC-31: S1 + LOGIN_FAILURE_EMPTY → S1 (field kosong, state tidak berubah)", () => {
      const result = transitionAuthState("UNAUTHENTICATED", "LOGIN_FAILURE_EMPTY");
      expect(result.success).toBe(false);
      expect(result.nextState).toBe("UNAUTHENTICATED");
      expect(result.error).toBeTruthy();
    });

    test("TC-32: S2 + LOGOUT → S1 (logout berhasil)", () => {
      const result = transitionAuthState("AUTHENTICATED", "LOGOUT");
      expect(result.success).toBe(true);
      expect(result.nextState).toBe("UNAUTHENTICATED");
    });

    test("TC-33: S2 + TOKEN_EXPIRED → S1 (token kedaluwarsa, auto-logout)", () => {
      const result = transitionAuthState("AUTHENTICATED", "TOKEN_EXPIRED");
      expect(result.success).toBe(true);
      expect(result.nextState).toBe("UNAUTHENTICATED");
    });
  });

  // ── TC-34..36: TRANSISI TIDAK VALID / DIBLOKIR ──────────────
  describe("TC-34..36: Transisi Tidak Valid / Diblokir", () => {

    test("TC-34: S1 + LOGOUT → N/A (tidak bisa logout jika belum login)", () => {
      const result = transitionAuthState("UNAUTHENTICATED", "LOGOUT");
      expect(result.success).toBe(false);
      expect(result.nextState).toBe("UNAUTHENTICATED");
      expect(result.error).toBeTruthy();
    });

    test("TC-35: S2 + LOGIN_SUCCESS → N/A (tidak bisa login jika sudah authenticated)", () => {
      const result = transitionAuthState("AUTHENTICATED", "LOGIN_SUCCESS");
      expect(result.success).toBe(false);
      expect(result.nextState).toBe("AUTHENTICATED");
      expect(result.error).toBeTruthy();
    });

    test("TC-36: S1 + TOKEN_EXPIRED → N/A (tidak ada token untuk expired)", () => {
      const result = transitionAuthState("UNAUTHENTICATED", "TOKEN_EXPIRED");
      expect(result.success).toBe(false);
      expect(result.nextState).toBe("UNAUTHENTICATED");
      expect(result.error).toBeTruthy();
    });
  });

  // ── TC-37..39: VALIDASI CREDENTIALS (Boundary) ──────────────
  describe("TC-37..39: Validasi Credentials (Boundary Values)", () => {

    test("TC-37: Identifier kosong harus ditolak (BR-01 login)", () => {
      const result = validateLoginCredentials({ identifier: "", password: "Lumiere123!" });
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test("TC-38: Password kosong harus ditolak (BR-02 login)", () => {
      const result = validateLoginCredentials({ identifier: "user@lumiereskin.com", password: "" });
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test("TC-39: Identifier dan password terisi harus diterima (validasi lolos)", () => {
      const result = validateLoginCredentials({ identifier: "user@lumiereskin.com", password: "Lumiere123!" });
      expect(result.valid).toBe(true);
    });
  });

  // ── TC-40..41: COMPLETENESS — State Transition Table ─────────
  describe("TC-40..41: Kelengkapan State Transition Table", () => {

    test("TC-40: Tabel transisi auth mencakup 10 kombinasi (2 state × 5 event)", () => {
      const table = generateTransitionTable();
      expect(table).toHaveLength(10);
    });

    test("TC-41: Setiap baris tabel transisi memiliki currentState, event, valid, nextState", () => {
      const table = generateTransitionTable();
      table.forEach((row) => {
        expect(row).toHaveProperty("currentState");
        expect(row).toHaveProperty("event");
        expect(row).toHaveProperty("valid");
        expect(row).toHaveProperty("nextState");
        expect(row).toHaveProperty("description");
      });
    });
  });
});
