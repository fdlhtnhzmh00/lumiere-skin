# Phase 15 — Test-Driven Development (TDD)
## LUMIÈRE SKIN: Web Application Toko Skincare
### BAB IV: Implementasi Test-Driven Development

---

## Pendekatan TDD yang Diterapkan

Dua fungsi dikembangkan menggunakan siklus **Red → Green → Refactor**:

| # | Fungsi | File | Siklus TDD | Test Cases |
|---|--------|------|-----------|:----------:|
| 1 | `validateRecipientName()` | `lib/validations/checkout.ts` | RED → GREEN → REFACTOR | 24 |
| 2 | `validateIndonesianPhone()` | `lib/validations/checkout.ts` | RED → GREEN → REFACTOR | 23 |

---

## FUNGSI 1: `validateRecipientName()`

### Business Rules

| Kode | Aturan Bisnis |
|------|--------------|
| BR-RN01 | Harus berupa tipe data `string` |
| BR-RN02 | Tidak boleh kosong atau hanya whitespace |
| BR-RN03 | Minimal **2 karakter** setelah di-trim |
| BR-RN04 | Maksimal **100 karakter** |
| BR-RN05 | Tidak boleh mengandung angka |
| BR-RN06 | Hanya huruf, spasi, apostrophe (`'`), dan hyphen (`-`) yang diizinkan |

---

### TAHAP RED — Tulis Test Terlebih Dahulu

**File yang dibuat pertama:** `tests/unit/tdd-checkout-validation.test.ts`

Stub implementasi yang dibuat (sengaja salah untuk menghasilkan RED):
```typescript
// lib/validations/checkout.ts (STUB — RED STAGE)
export function validateRecipientName(name: unknown): CheckoutFieldResult {
  // TODO: Implementasi belum ada (RED stage)
  return { valid: false, error: "Not implemented" };
}
```

**Hasil eksekusi RED:**
```
FAIL tests/unit/tdd-checkout-validation.test.ts
  Tests: 20 failed, 27 passed, 47 total

  ✕ V-01: Nama lengkap normal harus diterima
    Expected: true
    Received: false  ← stub mengembalikan false untuk semua input

  ✕ V-02: Nama dengan 2 karakter harus diterima
    Expected: true
    Received: false
  ... (18 failures lainnya)
```

---

### TAHAP GREEN — Implementasi Minimum

```typescript
// lib/validations/checkout.ts (GREEN STAGE — minimum code)
export function validateRecipientName(name: unknown): CheckoutFieldResult {
  if (typeof name !== "string")
    return { valid: false, error: "Harus berupa teks" };
  const trimmed = name.trim();
  if (trimmed.length === 0)
    return { valid: false, error: "Tidak boleh kosong" };
  if (trimmed.length < 2)
    return { valid: false, error: "Minimal 2 karakter" };
  if (trimmed.length > 100)
    return { valid: false, error: "Maksimal 100 karakter" };
  if (/[0-9]/.test(trimmed))
    return { valid: false, error: "Tidak boleh mengandung angka" };
  if (!/^[a-zA-Z\u00C0-\u024F\s'\-]+$/.test(trimmed))
    return { valid: false, error: "Karakter tidak valid" };
  return { valid: true, error: null };
}
```

**Hasil eksekusi GREEN:**
```
PASS tests/unit/tdd-checkout-validation.test.ts
  Tests: 47 passed, 47 total  ← semua PASS
```

---

### TAHAP REFACTOR — Perbaiki Struktur Kode

**Perubahan dari GREEN ke REFACTOR:**
1. Ekstrak konstanta: `NAME_MIN_LENGTH = 2`, `NAME_MAX_LENGTH = 100`
2. Beri nama pada regex: `VALID_NAME_REGEX`, `DIGIT_IN_NAME_REGEX`
3. Tambahkan JSDoc yang lengkap dengan referensi Business Rules
4. Perbaiki error messages menjadi lebih informatif dan konsisten

```typescript
// lib/validations/checkout.ts (REFACTORED)

// Konstanta yang diekstrak
const NAME_MIN_LENGTH  = 2;
const NAME_MAX_LENGTH  = 100;
const VALID_NAME_REGEX = /^[a-zA-Z\u00C0-\u024F\s'\-]+$/;
const DIGIT_IN_NAME_REGEX = /[0-9]/;

/**
 * Validasi nama penerima paket pada proses checkout.
 * @see BR-RN01 - BR-RN06
 */
export function validateRecipientName(name: unknown): CheckoutFieldResult {
  if (typeof name !== "string")
    return { valid: false, error: "Nama penerima harus berupa teks" };
  const trimmed = name.trim();
  if (trimmed.length === 0)
    return { valid: false, error: "Nama penerima tidak boleh kosong" };
  if (trimmed.length < NAME_MIN_LENGTH)
    return { valid: false, error: `Nama penerima minimal ${NAME_MIN_LENGTH} karakter` };
  if (trimmed.length > NAME_MAX_LENGTH)
    return { valid: false, error: `Nama penerima maksimal ${NAME_MAX_LENGTH} karakter` };
  if (DIGIT_IN_NAME_REGEX.test(trimmed))
    return { valid: false, error: "Nama penerima tidak boleh mengandung angka" };
  if (!VALID_NAME_REGEX.test(trimmed))
    return { valid: false, error: "Nama penerima hanya boleh berisi huruf, spasi, apostrophe ('), dan tanda hubung (-)" };
  return { valid: true, error: null };
}
```

**Hasil eksekusi REFACTOR:**
```
PASS tests/unit/tdd-checkout-validation.test.ts
  Tests: 47 passed, 47 total  ← masih PASS setelah refactoring ✓
```

---

## FUNGSI 2: `validateIndonesianPhone()`

### Business Rules

| Kode | Aturan Bisnis |
|------|--------------|
| BR-PH01 | Harus berupa tipe data `string` |
| BR-PH02 | Tidak boleh kosong |
| BR-PH03 | Harus dimulai dengan `08` atau `+628` (format Indonesia) |
| BR-PH04 | Panjang nomor lokal 10-13 digit |
| BR-PH05 | Hanya boleh berisi digit, `+`, `-`, spasi, tanda kurung |

---

### RED → GREEN → REFACTOR (Ringkasan)

**RED:** Stub yang sama — mengembalikan `{ valid: false, error: "Not implemented" }` → tests FAIL

**GREEN:** Implementasi minimum:
```typescript
export function validateIndonesianPhone(phone: unknown): CheckoutFieldResult {
  if (typeof phone !== "string") return { valid: false, error: "Harus berupa teks" };
  const trimmed = phone.trim();
  if (trimmed.length === 0) return { valid: false, error: "Tidak boleh kosong" };
  if (!/^[0-9+\-\s()]+$/.test(trimmed)) return { valid: false, error: "Karakter tidak valid" };
  const digitsOnly = trimmed.replace(/[\s\-()]/g, "");
  if (!digitsOnly.startsWith("08") && !trimmed.startsWith("+628"))
    return { valid: false, error: "Harus format Indonesia" };
  const localDigits = trimmed.startsWith("+628") ? digitsOnly.slice(2) : digitsOnly;
  if (localDigits.length < 10 || localDigits.length > 13)
    return { valid: false, error: "Panjang 10-13 digit" };
  return { valid: true, error: null };
}
```

**REFACTOR:** Perubahan:
1. Ekstrak helper functions: `extractDigitsOnly()`, `isIndonesianLocalFormat()`, `isIndonesianInternationalFormat()`
2. Ekstrak konstanta: `PHONE_MIN_DIGITS = 10`, `PHONE_MAX_DIGITS = 13`
3. Named regex: `VALID_PHONE_CHARS_REGEX`
4. Error messages lebih informatif

---

## Test Cases yang Dijalankan

### Fungsi 1: `validateRecipientName()`

| TC-ID | Kategori | Input | Expected | Actual | Status |
|-------|----------|-------|----------|--------|--------|
| V-01 | Valid | "Sarah Putri" | valid=true | true | ✅ |
| V-02 | Valid | "Al" | valid=true | true | ✅ |
| V-03 | Valid | "O'Brien" | valid=true | true | ✅ |
| V-04 | Valid | "Anna-Maria" | valid=true | true | ✅ |
| V-05 | Valid | "  Sarah Putri  " | valid=true | true | ✅ |
| V-06 | Valid | "A"×100 | valid=true | true | ✅ |
| IV-01 | BR-RN01 | null | valid=false | false | ✅ |
| IV-02 | BR-RN01 | undefined | valid=false | false | ✅ |
| IV-03 | BR-RN01 | 12345 (angka) | valid=false | false | ✅ |
| IV-04 | BR-RN02 | "" | valid=false | false | ✅ |
| IV-05 | BR-RN02 | "   " | valid=false | false | ✅ |
| IV-06 | BR-RN03 | "A" | valid=false, error ∋ "2" | false | ✅ |
| IV-08 | BR-RN04 | "A"×101 | valid=false, error ∋ "100" | false | ✅ |
| IV-09 | BR-RN05 | "Sarah1234" | valid=false | false | ✅ |
| IV-11 | BR-RN06 | "Sarah@email" | valid=false | false | ✅ |
| BVA-01..06 | Boundary | 1,2,3,99,100,101 karakter | sesuai | sesuai | ✅ |

### Fungsi 2: `validateIndonesianPhone()`

| TC-ID | Kategori | Input | Expected | Actual | Status |
|-------|----------|-------|----------|--------|--------|
| V-01 | Valid | "081234567890" | valid=true | true | ✅ |
| V-02 | Valid | "08123456789" | valid=true | true | ✅ |
| V-03 | Valid | "+6281234567890" | valid=true | true | ✅ |
| V-04 | Valid | "0812 3456 7890" | valid=true | true | ✅ |
| V-05 | Valid | "0812-3456-7890" | valid=true | true | ✅ |
| IV-01..03 | BR-PH01 | null, undefined, number | valid=false | false | ✅ |
| IV-04..05 | BR-PH02 | "", "   " | valid=false | false | ✅ |
| IV-06..08 | BR-PH03 | non-Indonesia format | valid=false | false | ✅ |
| IV-09..10 | BR-PH04 | too short/long | valid=false | false | ✅ |
| IV-11..12 | BR-PH05 | chars with letters/@ | valid=false | false | ✅ |
| BVA-01..05 | Boundary | 9,10,12,13,14 digit | sesuai | sesuai | ✅ |

---

## Ringkasan Hasil TDD

| Tahap | Fungsi 1 | Fungsi 2 | Total |
|-------|:--------:|:--------:|:-----:|
| RED (FAIL) | 12 FAIL | 8 FAIL | 20 FAIL |
| GREEN (PASS) | 47 PASS | 47 PASS | 47 PASS |
| REFACTOR (PASS) | 47 PASS | 47 PASS | 47 PASS |

---

## Perubahan Kode: GREEN → REFACTOR

| Aspek | GREEN (Sebelum) | REFACTOR (Sesudah) |
|-------|----------------|-------------------|
| Konstanta | Hard-coded `2`, `100` | `NAME_MIN_LENGTH = 2`, `NAME_MAX_LENGTH = 100` |
| Regex | Inline anonymous | Named: `VALID_NAME_REGEX`, `DIGIT_IN_NAME_REGEX` |
| Logic | Satu blok panjang | Helper functions yang terpisah |
| Error messages | Singkat dan minimal | Informatif dan spesifik per BR |
| Dokumentasi | Tidak ada | JSDoc lengkap dengan referensi BR |

---

*Dokumen ini dibuat pada Phase 15 — Test-Driven Development*
*Project: LUMIÈRE SKIN — UTS Advanced Software Testing 2025-2026*
