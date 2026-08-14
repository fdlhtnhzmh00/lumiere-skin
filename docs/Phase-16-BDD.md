# Phase 16 — Behavior-Driven Development (BDD)
## LUMIÈRE SKIN: Web Application Toko Skincare
### BAB V: Implementasi Behavior-Driven Development

---

## Framework dan Tools

| Komponen | Teknologi |
|----------|-----------|
| Framework BDD | Cucumber.js v13 (`@cucumber/cucumber`) |
| Bahasa Spesifikasi | Gherkin (Bahasa Indonesia) |
| Bahasa Step Definition | TypeScript |
| Runtime TypeScript | ts-node (`tsconfig.bdd.json`) |
| Format Report | HTML + JSON (`tests/bdd/reports/`) |

---

## Feature Files yang Dibuat (2 file)

| # | File | Fitur | Skenario |
|---|------|-------|:--------:|
| 1 | `tests/bdd/features/login.feature` | Autentikasi Pengguna | 8 (termasuk Scenario Outline) |
| 2 | `tests/bdd/features/checkout.feature` | Checkout & Status Pesanan | 10 (termasuk Scenario Outline) |
| | **Total** | | **25 eksekusi** |

---

## Skenario BDD (Kategori & Coverage)

| Kategori | Skenario | Feature File |
|----------|---------|-------------|
| ✅ **POSITIF** | Login berhasil dengan email | login.feature |
| ✅ **POSITIF** | Login berhasil dengan username | login.feature |
| ✅ **POSITIF** | Checkout berhasil dengan data valid | checkout.feature |
| ✅ **POSITIF** | Transisi DRAFT → CONFIRMED berhasil | checkout.feature |
| ❌ **NEGATIF** | Login gagal — password salah | login.feature |
| ❌ **NEGATIF** | Login gagal — email kosong | login.feature |
| ❌ **NEGATIF** | Login gagal — password kosong | login.feature |
| ❌ **NEGATIF** | Checkout gagal — belum login | checkout.feature |
| ❌ **NEGATIF** | Checkout gagal — keranjang kosong | checkout.feature |
| ❌ **NEGATIF** | Checkout gagal — nama penerima pakai angka | checkout.feature |
| ❌ **NEGATIF** (STATUS) | Transisi COMPLETED → CANCELLED ditolak | checkout.feature |
| 📏 **BOUNDARY** | Validasi panjang nomor telepon (7 contoh) | checkout.feature |
| 📋 **OUTLINE** | Login berbagai kombinasi kredensial (7 row) | login.feature |

---

## Feature File 1: `login.feature`

```gherkin
Feature: Autentikasi Pengguna LUMIÈRE SKIN

  Background:
    Given aplikasi LUMIÈRE SKIN sedang berjalan
    And tersedia akun pengguna dengan email "user@lumiereskin.com"
          dan password "Lumiere123!"

  Scenario: Login berhasil menggunakan email yang terdaftar
  Scenario: Login berhasil menggunakan username
  Scenario: Login gagal karena password tidak sesuai
  Scenario: Login gagal karena field email kosong
  Scenario: Login gagal karena field password kosong

  Scenario Outline: Login dengan berbagai kombinasi kredensial
    Examples:
      | identifier              | password     | hasil          |
      | user@lumiereskin.com   | Lumiere123!  | valid          |
      | team1                   | Lumiere123!  | valid          |
      | admin@lumiereskin.com  | Admin123!    | valid          |
      | user@lumiereskin.com   | salah        | credentials_error |
      | userTidakAda@email.com  | Lumiere123!  | credentials_error |
      |                         | Lumiere123!  | validation_error  |
      | user@lumiereskin.com   |              | validation_error  |
```

---

## Feature File 2: `checkout.feature`

```gherkin
Feature: Proses Checkout dan Manajemen Status Pesanan

  Scenario: Checkout berhasil dengan semua data pengiriman yang valid
  Scenario: Checkout gagal karena pengguna belum login
  Scenario: Checkout gagal karena keranjang belanja kosong
  Scenario: Checkout gagal karena nama penerima mengandung angka

  Scenario Outline: Validasi nomor telepon dengan berbagai panjang digit
    Examples:
      | nomor             | hasil   |
      | 081234567         | gagal   |
      | 0812345678        | valid   |
      | 081234567890      | valid   |
      | 0812345678901     | valid   |
      | 08123456789012    | gagal   |
      | +6281234567890    | valid   |
      | 021-123456        | gagal   |

  Scenario: Perubahan status pesanan dari DRAFT menjadi CONFIRMED
  Scenario: Perubahan status pesanan ditolak dari COMPLETED ke CANCELLED
```

---

## Hasil Eksekusi BDD

```
> cross-env TS_NODE_PROJECT=tsconfig.bdd.json cucumber-js

..................................................................................................................

25 scenarios (25 passed)
114 steps (114 passed)
0m 0.63s
```

### Breakdown Per Feature

| Feature | Scenarios | Steps | Status |
|---------|:---------:|:-----:|:------:|
| login.feature | 11 | 53 | ✅ PASS |
| checkout.feature | 14 | 61 | ✅ PASS |
| **Total** | **25** | **114** | ✅ **25/25** |

---

## Traceability: Scenario → Business Rule

| Skenario | Business Rule |
|---------|--------------|
| Login berhasil | FR-01 |
| Login gagal — credentials | FR-01 |
| Login gagal — field kosong | BR-RN02 (input validation) |
| Checkout berhasil | BR-09, BR-10, BR-11, BR-12, BR-13 |
| Checkout tanpa login | BR-09 |
| Checkout keranjang kosong | BR-10 |
| Nama dengan angka | BR-RN05 |
| Validasi telepon boundary | BR-PH04 |
| DRAFT → CONFIRMED | BR-15 |
| COMPLETED → CANCELLED ditolak | BR-19 |

---

*Dokumen ini dibuat pada Phase 16 — Behavior-Driven Development*
*Project: LUMIÈRE SKIN — UTS Advanced Software Testing 2025-2026*
