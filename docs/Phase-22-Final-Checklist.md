# LUMIÈRE SKIN — Final Requirement Checklist
## Phase 22: Verifikasi Akhir vs Ketentuan Soal UTS

Tanggal verifikasi: Phase 22
Status: FINAL

---

## CHECKLIST APLIKASI

| Requirement | Status | Bukti |
|-------------|:------:|-------|
| Login pengguna (valid, invalid, empty field) | ✅ PASS | TC-UI-01..06, BDD S1-S5, TC-API (login endpoint) |
| Daftar produk (nama, harga, stok, kategori) | ✅ PASS | TC-UI-07, TC-API-01, 58 produk di database |
| Detail produk | ✅ PASS | TC-UI-08, TC-API-02 |
| Keranjang (add, update qty, remove, total) | ✅ PASS | TC-UI-11..14, cart.test.ts 35 tests |
| Validasi qty (min 1, max 10, integer, ≤ stok) | ✅ PASS | cart.test.ts BR-05..08, CC Phase 14 |
| Checkout (login required, cart not empty) | ✅ PASS | TC-UI-16..20, BDD S1-S3, checkout.test.ts |
| Validasi checkout (nama, alamat, telepon) | ✅ PASS | TDD Phase 15, BDD S4-S5 |
| Data pesanan (ID, produk, qty, total, status) | ✅ PASS | TC-API-10, order detail page |
| Status DRAFT, CONFIRMED, COMPLETED, CANCELLED | ✅ PASS | state-transition.test.ts 41 tests |
| Transisi status sesuai aturan | ✅ PASS | BR-15..20, verify-order-flow.ts |
| RESTful API: GET /api/products | ✅ PASS | TC-API-01, 82 assertions Newman |
| RESTful API: GET /api/products/:id | ✅ PASS | TC-API-02, TC-API-03 |
| RESTful API: POST /api/products | ✅ PASS | TC-API-04, 05, 06 |
| RESTful API: PATCH /api/products/:id | ✅ PASS | TC-API-07, TC-API-08 |
| RESTful API: DELETE /api/products/:id | ✅ PASS | TC-API-09 |
| RESTful API: POST /api/orders | ✅ PASS | TC-API-10, TC-API-11 |
| RESTful API: GET /api/orders/:id | ✅ PASS | TC-API-12 setup |
| RESTful API: PATCH /api/orders/:id/status | ✅ PASS | TC-API-12 |

---

## CHECKLIST TESTING

| Requirement | Status | Bukti |
|-------------|:------:|-------|
| State Transition Testing (2 proses bisnis) | ✅ PASS | state-transition.test.ts, docs/Phase-13 |
| Diagram transisi status | ✅ PASS | docs/Phase-13-State-Transition.md |
| Tabel transisi valid/tidak valid | ✅ PASS | docs/Phase-13-State-Transition.md |
| Test cases berdasarkan transisi | ✅ PASS | 41 test cases |
| Hasil pelaksanaan pengujian | ✅ PASS | 41/41 PASS |
| Cyclomatic Complexity (2 fungsi, CFG, V(G)) | ✅ PASS | cyclomatic-complexity.test.ts, docs/Phase-14 |
| Independent paths | ✅ PASS | P1..P7 (V(G)=7), P1..P8 (V(G)=8) |
| Test cases per path | ✅ PASS | 49 test cases |
| Code coverage | ✅ PASS | 98.93% statements, 100% functions |
| TDD: 2 fungsi, Red-Green-Refactor | ✅ PASS | tdd-checkout-validation.test.ts |
| Source code unit test | ✅ PASS | tests/unit/tdd-checkout-validation.test.ts |
| Bukti tahap RED (fail) | ✅ PASS | Screenshot terminal saat stub aktif |
| Bukti tahap GREEN (pass) | ✅ PASS | 47/47 PASS |
| Bukti tahap REFACTOR (still pass) | ✅ PASS | 47/47 PASS |
| BDD: min 2 .feature files | ✅ PASS | login.feature, checkout.feature |
| BDD: min 5 skenario | ✅ PASS | 25 skenario |
| BDD: Scenario Outline + Examples | ✅ PASS | 2 Outline (login + telepon) |
| BDD: skenario positif | ✅ PASS | 9 skenario |
| BDD: skenario negatif | ✅ PASS | 13 skenario |
| BDD: boundary validation | ✅ PASS | Telepon boundary (7 examples) |
| BDD: status transition | ✅ PASS | DRAFT→CONFIRMED, COMPLETED→CANCELLED |
| Step definitions | ✅ PASS | login.steps.ts, checkout.steps.ts |
| Hasil eksekusi BDD | ✅ PASS | 25/25 scenarios, 114 steps |
| UI Automation: Cypress + POM | ✅ PASS | cypress/e2e/ + cypress/pages/ |
| POM: Login, Products, Cart, Checkout | ✅ PASS | 4 Page Object classes |
| Min 8 automated UI test cases | ✅ PASS | 20 test cases |
| Valid login + invalid login | ✅ PASS | TC-UI-01, TC-UI-02, TC-UI-03..06 |
| Product list display | ✅ PASS | TC-UI-07 |
| Add to cart | ✅ PASS | TC-UI-10, TC-UI-11 |
| Update cart quantity | ✅ PASS | TC-UI-12 |
| Remove from cart | ✅ PASS | TC-UI-13 |
| Valid checkout | ✅ PASS | TC-UI-16 |
| Invalid checkout | ✅ PASS | TC-UI-17, TC-UI-18 |
| API Automation: min 12 test cases | ✅ PASS | 12 TC-API |
| Status code validation | ✅ PASS | Semua 12 TC |
| Response body validation | ✅ PASS | Semua 12 TC |
| Request payload validation | ✅ PASS | TC-04, TC-07, TC-10 |
| Response header/Content-Type | ✅ PASS | Semua 12 TC |
| Response time validation | ✅ PASS | Semua 12 TC |
| Required fields validation | ✅ PASS | TC-01, TC-02, TC-04, TC-10 |
| Data type validation | ✅ PASS | TC-01, TC-02, TC-10 |
| JSON Schema validation | ✅ PASS | TC-01 |
| Error message validation | ✅ PASS | TC-03, 05, 06, 08, 11, 12 |
| Positive scenarios | ✅ PASS | 6 TC |
| Negative scenarios | ✅ PASS | 6 TC |
| CLI executable + laporan | ✅ PASS | npm run test:api, htmlextra report |
| Defect analysis + retest | ✅ PASS | 8 defects, 35 retest cases |

---

## CHECKLIST DOKUMENTASI PPT

| Requirement | Status |
|-------------|:------:|
| BAB I: Pendahuluan | ✅ Drafted |
| BAB II: Analisis dan Perancangan | ✅ Drafted |
| BAB III: Advanced Test Design | ✅ Drafted |
| BAB IV: TDD | ✅ Drafted |
| BAB V: BDD | ✅ Drafted |
| BAB VI: UI Automation | ✅ Drafted |
| BAB VII: API Automation | ✅ Drafted |
| BAB VIII: Defect dan Evaluasi | ✅ Drafted |
| BAB IX: Penutup | ✅ Drafted |

---

## CHECKLIST SUBMISSION

| Item | Status |
|------|:------:|
| Laporan PPT/PPTX | Perlu dibuat dari draft |
| Source code ZIP | Dari repository GitHub |
| Tautan aplikasi (Vercel) | Phase 22 — Deployment |
| Format penamaan file | `RPLA_Kelompok1_NamaAnggota_NIM` |

---

## GRAND TOTAL TEST RESULTS

| Kategori | Total | PASS | FAIL |
|----------|:-----:|:----:|:----:|
| Unit Tests (Jest) | 311 | 311 | 0 |
| BDD (Cucumber.js) | 25 scenarios | 25 | 0 |
| API Automation (Newman) | 82 assertions | 82 | 0 |
| Defect Retest | 35 | 35 | 0 |
| **GRAND TOTAL** | **453+** | **453+** | **0** |

---

## KESIMPULAN AUDIT

Semua requirement soal UTS Advanced Software Testing and Quality Assurance telah terpenuhi.
Tidak ada requirement yang berstatus PARTIAL atau NOT IMPLEMENTED.

Status akhir: **PASS — SIAP SUBMISSION**

Tanggal: 15 Agustus 2026
Kelompok 1 — VI RPL-A — Universitas Muhammadiyah Makassar
