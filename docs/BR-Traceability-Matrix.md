# Business Rules Traceability Matrix — LUMIÈRE SKIN
## UTS Advanced Software Testing and Quality Assurance
## Status: FINAL (Phase 20 — Quality Evaluation)

---

## Tabel Traceability: Business Rules → Implementasi → Test

| Kode BR | Deskripsi Business Rule | Lokasi Implementasi | Pengujian | Status |
|---------|------------------------|--------------------|-----------|----|
| **BR-01** | Nama produk wajib diisi (min 3, max 200 kar) | `lib/validations/product.ts` `validateProductName()` | `tests/unit/product.test.ts` (19 tests) + CC Phase 14 | ✅ Verified |
| **BR-02** | Harga produk harus lebih besar dari nol | `lib/validations/product.ts` `validateProductPrice()` | `tests/unit/product.test.ts` (13 tests) + CC Phase 14 | ✅ Verified |
| **BR-03** | Stok produk tidak boleh bernilai negatif | `lib/validations/product.ts` `validateProductStock()` | `tests/unit/product.test.ts` (9 tests) | ✅ Verified |
| **BR-04** | Harga = Float, Stok = Integer | `lib/validations/product.ts` `validateProductStock()` | `tests/unit/product.test.ts` (9 tests) | ✅ Verified |
| **BR-05** | Jumlah minimal pembelian = 1 unit | `lib/validations/cart.ts` `validateCartQuantity()` | `tests/unit/cart.test.ts` (4 tests) + CC Phase 14 | ✅ Verified |
| **BR-06** | Jumlah maksimal pembelian = 10 unit per produk | `lib/validations/cart.ts` `CART_MAX_QUANTITY` | `tests/unit/cart.test.ts` (5 tests) + TC-UI-15 | ✅ Verified |
| **BR-07** | Jumlah tidak boleh melebihi stok tersedia | `lib/validations/cart.ts` `validateCartQuantity()` | `tests/unit/cart.test.ts` (5 tests) + TC-API-11 | ✅ Verified |
| **BR-08** | Jumlah harus bilangan bulat positif | `lib/validations/cart.ts` `validateCartQuantity()` | `tests/unit/cart.test.ts` (8 tests) | ✅ Verified |
| **BR-09** | Pengguna harus login untuk checkout | `app/checkout/page.tsx` guard | `tests/unit/order.test.ts` (1 test) + TC-UI-19 + BDD S2 | ✅ Verified |
| **BR-10** | Keranjang tidak boleh kosong saat checkout | `app/api/orders/route.ts`, `app/checkout/page.tsx` | `tests/unit/order.test.ts` (1 test) + TC-UI-20 + BDD S3 | ✅ Verified |
| **BR-11** | Nama penerima wajib diisi | `lib/validations/order.ts` + `lib/validations/checkout.ts` | `tests/unit/order.test.ts` (2 tests) + TC-UI-18 + BDD S4 | ✅ Verified |
| **BR-12** | Alamat pengiriman wajib diisi | `lib/validations/order.ts` `validateCheckout()` | `tests/unit/order.test.ts` (1 test) + TC-UI-17 | ✅ Verified |
| **BR-13** | Nomor telepon wajib diisi (format valid) | `lib/validations/checkout.ts` `validateIndonesianPhone()` | `tests/unit/order.test.ts` (3 tests) + `tdd-checkout-validation.test.ts` + BDD S5 | ✅ Verified |
| **BR-14** | Pesanan baru selalu berstatus DRAFT | `app/api/orders/route.ts` `status: "DRAFT"` | `scripts/verify-order-flow.ts` + TC-API-10 + BDD S1 | ✅ Verified |
| **BR-15** | DRAFT → CONFIRMED (valid) | `lib/validations/order.ts` `validateStatusTransition()` | `state-transition.test.ts` + `verify-order-flow.ts` + BDD S6 | ✅ Verified |
| **BR-16** | DRAFT → CANCELLED (valid) | `lib/validations/order.ts` `validateStatusTransition()` | `state-transition.test.ts` + `verify-order-flow.ts` | ✅ Verified |
| **BR-17** | CONFIRMED → COMPLETED (valid) | `lib/validations/order.ts` `validateStatusTransition()` | `state-transition.test.ts` + `verify-order-flow.ts` | ✅ Verified |
| **BR-18** | CONFIRMED → CANCELLED (valid) | `lib/validations/order.ts` `validateStatusTransition()` | `state-transition.test.ts` + `verify-order-flow.ts` | ✅ Verified |
| **BR-19** | COMPLETED tidak dapat diubah status apapun | `lib/validations/order.ts` `validateStatusTransition()` | `state-transition.test.ts` (4 tests) + TC-API-12 + BDD S7 | ✅ Verified |
| **BR-20** | CANCELLED tidak dapat diaktifkan kembali | `lib/validations/order.ts` `validateStatusTransition()` | `state-transition.test.ts` (4 tests) + `verify-order-flow.ts` | ✅ Verified |

---

## State Transition Diagram (Teks)

```
             ┌─────────────┐
     ┌──────▶│    DRAFT    │──────────────────┐
     │        └──────┬──────┘                  │
     │               │ (valid: BR-15)           │ (valid: BR-16)
     │               ▼                          ▼
     │        ┌──────────────┐          ┌────────────────┐
     │        │  CONFIRMED   │          │   CANCELLED    │
     │        └──────┬───────┘          └────────────────┘
     │               │                       ▲
     │       (valid) │ (BR-17)               │ (valid: BR-18)
     │               │                       │
     │               ▼                       │
     │        ┌──────────────┐ ──────────────┘
     └────────│  COMPLETED   │
              └──────────────┘

  ✗ COMPLETED → * (tidak valid, BR-19)
  ✗ CANCELLED → * (tidak valid, BR-20)
  ✗ Loncat status (DRAFT → COMPLETED) tidak valid
```

---

## State Transition Table

| Current Status | Target Status | Valid? | Business Rule | Error Message |
|---------------|--------------|--------|--------------|---------------|
| DRAFT | CONFIRMED | ✅ Ya | BR-15 | - |
| DRAFT | CANCELLED | ✅ Ya | BR-16 | - |
| DRAFT | COMPLETED | ❌ Tidak | - | "Tidak dapat langsung ke COMPLETED" |
| DRAFT | DRAFT | ❌ Tidak | - | "Status sudah DRAFT" |
| CONFIRMED | COMPLETED | ✅ Ya | BR-17 | - |
| CONFIRMED | CANCELLED | ✅ Ya | BR-18 | - |
| CONFIRMED | DRAFT | ❌ Tidak | - | "Tidak dapat ke DRAFT" |
| CONFIRMED | CONFIRMED | ❌ Tidak | - | "Status sudah CONFIRMED" |
| COMPLETED | DRAFT | ❌ Tidak | BR-19 | "Pesanan selesai tidak dapat diubah" |
| COMPLETED | CONFIRMED | ❌ Tidak | BR-19 | "Pesanan selesai tidak dapat diubah" |
| COMPLETED | CANCELLED | ❌ Tidak | BR-19 | "Pesanan selesai tidak dapat diubah" |
| COMPLETED | COMPLETED | ❌ Tidak | BR-19 | "Status sudah COMPLETED" |
| CANCELLED | DRAFT | ❌ Tidak | BR-20 | "Pesanan dibatalkan tidak bisa diaktifkan" |
| CANCELLED | CONFIRMED | ❌ Tidak | BR-20 | "Pesanan dibatalkan tidak bisa diaktifkan" |
| CANCELLED | COMPLETED | ❌ Tidak | BR-20 | "Pesanan dibatalkan tidak bisa diaktifkan" |
| CANCELLED | CANCELLED | ❌ Tidak | BR-20 | "Status sudah CANCELLED" |

---

## Ringkasan Coverage Unit Test

| File Test | Test Suites | Tests | Status |
|-----------|------------|-------|--------|
| `tests/unit/cart.test.ts` | 6 suites | 35 tests | ✅ 35/35 PASS |
| `tests/unit/order.test.ts` | 3 suites | 43 tests | ✅ 43/43 PASS |
| `tests/unit/product.test.ts` | 4 suites | 61 tests | ✅ 61/61 PASS |
| **Total** | **13 suites** | **139 tests** | ✅ **139/139 PASS** |

---

## End-to-End Verification

| Script | Skenario | Hasil |
|--------|---------|-------|
| `scripts/verify-order-flow.ts` | 7 skenario, 14 assertions | ✅ 14/14 PASS |

---

*Dokumen ini digenerate pada: Phase 12 — Order Status and Business Rule Validation*
*Project: LUMIÈRE SKIN — UTS Advanced Software Testing 2025-2026*
