# Phase 13 — State Transition Testing
## LUMIÈRE SKIN: Web Application Toko Skincare
### BAB III: Advanced Test Design

---

## Pemilihan Proses Bisnis

Dua proses bisnis dipilih untuk State Transition Testing:

| # | Proses Bisnis | Alasan Dipilih |
|---|---------------|----------------|
| 1 | **Order Status Management** | State machine paling kritis — 4 status, 6 transisi valid, langsung terhubung ke BR-14 s/d BR-20 |
| 2 | **User Authentication (Login)** | State machine dengan 2 state — mencakup login sukses, gagal, dan logout |

---

## PROSES BISNIS 1: Order Status Management

### 1. Identifikasi State

| Kode | Status | Deskripsi |
|------|--------|-----------|
| S1 | **DRAFT** | Status awal saat pesanan baru dibuat. Menunggu konfirmasi. |
| S2 | **CONFIRMED** | Pesanan telah dikonfirmasi dan sedang diproses. |
| S3 | **COMPLETED** | Pesanan telah selesai dan diterima penerima. **Status final.** |
| S4 | **CANCELLED** | Pesanan dibatalkan. **Status final.** |

### 2. Identifikasi Event

| Kode | Event | Pemicu |
|------|-------|--------|
| E1 | `confirm` | Admin/user mengkonfirmasi pesanan |
| E2 | `complete` | Admin/user menandai pesanan selesai |
| E3 | `cancel` | Admin/user membatalkan pesanan |
| E4 | `invalid` | Transisi yang tidak diizinkan |

### 3. Diagram Transisi Status

```
                    E1: confirm
         ┌────────────────────────────────────────┐
         │                                        │
    ──► S1:DRAFT                           S2:CONFIRMED
         │                                        │
         │ E3: cancel                             │ E2: complete
         │                                        │
         ▼                                        ▼
    S4:CANCELLED (FINAL) ◄──────── S3:COMPLETED (FINAL)
              ▲              E3: cancel
              │
              └──────── S2:CONFIRMED dapat dibatalkan (E3)

  ╔══════════════════════════════════════════════╗
  ║  STATUS FINAL: COMPLETED & CANCELLED         ║
  ║  Tidak dapat diubah ke status apapun         ║
  ╚══════════════════════════════════════════════╝
```

### 4. Tabel Transisi Status (State Transition Table)

| Current Status | Target: DRAFT | Target: CONFIRMED | Target: COMPLETED | Target: CANCELLED |
|----------------|:-------------:|:-----------------:|:-----------------:|:-----------------:|
| **DRAFT**      | ✗ (sama)      | ✅ **Valid**       | ✗ (loncat)        | ✅ **Valid**       |
| **CONFIRMED**  | ✗ (mundur)    | ✗ (sama)          | ✅ **Valid**       | ✅ **Valid**       |
| **COMPLETED**  | ✗ BR-19       | ✗ BR-19           | ✗ (sama)          | ✗ BR-19           |
| **CANCELLED**  | ✗ BR-20       | ✗ BR-20           | ✗ BR-20           | ✗ (sama)          |

**Keterangan:** ✅ = transisi valid | ✗ = transisi tidak valid

### 5. Transisi Valid (6 transisi)

| ID | Current → Target | Business Rule | Keterangan |
|----|-----------------|---------------|------------|
| TV-01 | DRAFT → CONFIRMED | BR-15 | Pesanan dikonfirmasi |
| TV-02 | DRAFT → CANCELLED | BR-16 | Pesanan dibatalkan sebelum konfirmasi |
| TV-03 | CONFIRMED → COMPLETED | BR-17 | Pesanan selesai |
| TV-04 | CONFIRMED → CANCELLED | BR-18 | Pesanan dibatalkan setelah konfirmasi |

### 6. Transisi Tidak Valid (12 transisi)

| ID | Current → Target | Business Rule | Alasan Penolakan |
|----|-----------------|---------------|-----------------|
| TI-01 | DRAFT → COMPLETED | - | Loncat langsung ke COMPLETED tanpa CONFIRMED |
| TI-02 | DRAFT → DRAFT | - | Status tidak berubah |
| TI-03 | CONFIRMED → DRAFT | - | Tidak bisa mundur ke status sebelumnya |
| TI-04 | CONFIRMED → CONFIRMED | - | Status tidak berubah |
| TI-05 | COMPLETED → DRAFT | BR-19 | COMPLETED adalah status final |
| TI-06 | COMPLETED → CONFIRMED | BR-19 | COMPLETED adalah status final |
| TI-07 | COMPLETED → CANCELLED | BR-19 | COMPLETED adalah status final |
| TI-08 | COMPLETED → COMPLETED | BR-19 | Status tidak berubah + final |
| TI-09 | CANCELLED → DRAFT | BR-20 | CANCELLED tidak bisa diaktifkan kembali |
| TI-10 | CANCELLED → CONFIRMED | BR-20 | CANCELLED tidak bisa diaktifkan kembali |
| TI-11 | CANCELLED → COMPLETED | BR-20 | CANCELLED tidak bisa diaktifkan kembali |
| TI-12 | CANCELLED → CANCELLED | BR-20 | Status tidak berubah + final |

### 7. Test Cases Order Status

| TC-ID | Current | Target | Expected | Actual | Status |
|-------|---------|--------|----------|--------|--------|
| TC-01 | DRAFT | CONFIRMED | PASS (valid) | PASS | ✅ |
| TC-02 | DRAFT | CANCELLED | PASS (valid) | PASS | ✅ |
| TC-03 | CONFIRMED | COMPLETED | PASS (valid) | PASS | ✅ |
| TC-04 | CONFIRMED | CANCELLED | PASS (valid) | PASS | ✅ |
| TC-05 | DRAFT | COMPLETED | FAIL (invalid) | FAIL | ✅ |
| TC-06 | DRAFT | DRAFT | FAIL (invalid) | FAIL | ✅ |
| TC-07 | CONFIRMED | DRAFT | FAIL (invalid) | FAIL | ✅ |
| TC-08 | CONFIRMED | CONFIRMED | FAIL (invalid) | FAIL | ✅ |
| TC-09 | COMPLETED | DRAFT | FAIL (BR-19) | FAIL | ✅ |
| TC-10 | COMPLETED | CONFIRMED | FAIL (BR-19) | FAIL | ✅ |
| TC-11 | COMPLETED | CANCELLED | FAIL (BR-19) | FAIL | ✅ |
| TC-12 | COMPLETED | COMPLETED | FAIL (BR-19) | FAIL | ✅ |
| TC-13 | COMPLETED | any | Error message ada | Error ada | ✅ |
| TC-14 | CANCELLED | DRAFT | FAIL (BR-20) | FAIL | ✅ |
| TC-15 | CANCELLED | CONFIRMED | FAIL (BR-20) | FAIL | ✅ |
| TC-16 | CANCELLED | COMPLETED | FAIL (BR-20) | FAIL | ✅ |
| TC-17 | CANCELLED | CANCELLED | FAIL (BR-20) | FAIL | ✅ |
| TC-18 | CANCELLED | any | Error message ada | Error ada | ✅ |
| TC-23 | DRAFT→CONFIRMED→COMPLETED | alur penuh | semua valid | semua valid | ✅ |
| TC-24 | DRAFT→CANCELLED | alur pembatalan awal | valid | valid | ✅ |
| TC-25 | CONFIRMED→CANCELLED | pembatalan pasca konfirmasi | valid | valid | ✅ |
| TC-26 | DRAFT→COMPLETED | loncat | ditolak | ditolak | ✅ |
| TC-27 | COMPLETED→* | semua target | semua ditolak | semua ditolak | ✅ |
| TC-28 | CANCELLED→* | semua target | semua ditolak | semua ditolak | ✅ |

---

## PROSES BISNIS 2: User Authentication (Login State)

### 1. Identifikasi State

| Kode | State | Deskripsi |
|------|-------|-----------|
| S1 | **UNAUTHENTICATED** | Pengguna belum login. Tidak ada token JWT valid. |
| S2 | **AUTHENTICATED** | Pengguna sudah login. Token JWT valid tersimpan. |

### 2. Identifikasi Event

| Kode | Event | Pemicu |
|------|-------|--------|
| E1 | `LOGIN_SUCCESS` | Credentials valid, token JWT diterbitkan |
| E2 | `LOGIN_FAILURE_INVALID` | Credentials salah (email/password tidak cocok) |
| E3 | `LOGIN_FAILURE_EMPTY` | Field email atau password kosong |
| E4 | `LOGOUT` | User sengaja klik tombol "Sign Out" |
| E5 | `TOKEN_EXPIRED` | JWT kedaluwarsa, auto-logout dilakukan |

### 3. Diagram Transisi Status

```
                    E1: LOGIN_SUCCESS
    ┌────────────────────────────────────────────┐
    │                                            │
    ▼                                            │
  S1: UNAUTHENTICATED ────────────────────► S2: AUTHENTICATED
    ▲           │                               │
    │     E2/E3 │ (stays S1)                    │ E4: LOGOUT
    │           ▼                               │ E5: TOKEN_EXPIRED
    └───────────────────────────────────────────┘

  S1 + E4 = BLOCKED (tidak bisa logout tanpa login)
  S2 + E1 = BLOCKED (tidak bisa login jika sudah authenticated)
```

### 4. Tabel Transisi Authentication

| Current State | E1: LOGIN_SUCCESS | E2: FAILURE_INVALID | E3: FAILURE_EMPTY | E4: LOGOUT | E5: TOKEN_EXPIRED |
|--------------|:-----------------:|:-------------------:|:-----------------:|:----------:|:-----------------:|
| **UNAUTHENTICATED (S1)** | ✅ → S2 | ✗ → S1 (stays) | ✗ → S1 (stays) | ✗ Blocked | ✗ Blocked |
| **AUTHENTICATED (S2)** | ✗ Blocked | ✗ N/A | ✗ N/A | ✅ → S1 | ✅ → S1 |

### 5. Test Cases Authentication

| TC-ID | State | Event | Expected | Actual | Status |
|-------|-------|-------|----------|--------|--------|
| TC-29 | S1 | LOGIN_SUCCESS | → S2 (berhasil) | → S2 | ✅ |
| TC-30 | S1 | LOGIN_FAILURE_INVALID | → S1 (gagal, stays) | → S1 | ✅ |
| TC-31 | S1 | LOGIN_FAILURE_EMPTY | → S1 (gagal, stays) | → S1 | ✅ |
| TC-32 | S2 | LOGOUT | → S1 (berhasil) | → S1 | ✅ |
| TC-33 | S2 | TOKEN_EXPIRED | → S1 (auto-logout) | → S1 | ✅ |
| TC-34 | S1 | LOGOUT | Blocked (error) | Blocked | ✅ |
| TC-35 | S2 | LOGIN_SUCCESS | Blocked (error) | Blocked | ✅ |
| TC-36 | S1 | TOKEN_EXPIRED | Blocked (error) | Blocked | ✅ |
| TC-37 | S1 | LOGIN (empty identifier) | Validation error | Error | ✅ |
| TC-38 | S1 | LOGIN (empty password) | Validation error | Error | ✅ |
| TC-39 | S1 | LOGIN (valid input format) | Validation pass | Pass | ✅ |
| TC-40 | - | generateTransitionTable() | 10 kombinasi | 10 | ✅ |
| TC-41 | - | Row structure check | 5 properties | 5 | ✅ |

---

## Hasil Eksekusi Pengujian

### Ringkasan Eksekusi

```
Test File: tests/unit/state-transition.test.ts
──────────────────────────────────────────────
Test Suites  : 1 (PASS)
Total Tests  : 41
PASSED       : 41
FAILED       : 0
Execution    : ~2.8s
──────────────────────────────────────────────
```

### Breakdown per Proses Bisnis

| Proses Bisnis | TC Valid | TC Invalid | TC Boundary | Total | PASS |
|---------------|:--------:|:----------:|:-----------:|:-----:|:----:|
| Order Status | 10 | 14 | 4 | 28 | 28 ✅ |
| Authentication | 5 | 3 | 3 | 13 | 13 ✅ |
| **TOTAL** | **15** | **17** | **7** | **41** | **41 ✅** |

---

## Traceability: Business Rule → Test Case

| Business Rule | Keterangan | Test Case | Status |
|---------------|-----------|-----------|--------|
| BR-14 | Pesanan baru = DRAFT | TC-23 (alur sukses dimulai dari DRAFT) | ✅ |
| BR-15 | DRAFT → CONFIRMED valid | TC-01, TC-23 | ✅ |
| BR-16 | DRAFT → CANCELLED valid | TC-02, TC-24 | ✅ |
| BR-17 | CONFIRMED → COMPLETED valid | TC-03, TC-23 | ✅ |
| BR-18 | CONFIRMED → CANCELLED valid | TC-04, TC-25 | ✅ |
| BR-19 | COMPLETED tidak bisa diubah | TC-09, TC-10, TC-11, TC-12, TC-13, TC-27 | ✅ |
| BR-20 | CANCELLED tidak bisa diaktifkan | TC-14, TC-15, TC-16, TC-17, TC-18, TC-28 | ✅ |

---

## Analisis Hasil Pengujian

**Order Status Management:**
Semua 28 test case lulus. Fungsi `validateStatusTransition()` menerapkan seluruh aturan bisnis dengan benar. Status COMPLETED dan CANCELLED terbukti berfungsi sebagai status final yang tidak dapat diubah. Pesan error yang dihasilkan informatif dan menjelaskan alasan penolakan.

**User Authentication:**
Semua 13 test case lulus. Model state machine `transitionAuthState()` dengan benar menangani:
- Login berhasil: state berubah UNAUTHENTICATED → AUTHENTICATED
- Login gagal: state tetap UNAUTHENTICATED, error message ada
- Logout: state kembali UNAUTHENTICATED
- Token expired: auto-logout ke UNAUTHENTICATED
- Transisi yang diblokir: dicegah dengan error message

---

*Dokumen ini dibuat pada Phase 13 — State Transition Testing*
*Project: LUMIÈRE SKIN — UTS Advanced Software Testing 2025-2026*
