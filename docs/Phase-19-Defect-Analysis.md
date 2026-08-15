# Phase 19 — Defect Analysis dan Retesting
## LUMIÈRE SKIN: Web Application Toko Skincare
### BAB VIII: Defect dan Evaluasi Kualitas

---

## Ringkasan Defect

| Total Defect | Diperbaiki | Pending | Retest Pass |
|:------------:|:----------:|:-------:|:-----------:|
| **8** | **8** | **0** | **35/35** |

---

## Daftar Defect (8 Defect)

| DEF-ID | Judul Defect | Severity | Priority | Status |
|--------|-------------|:--------:|:--------:|:------:|
| DEF-001 | Product detail page selalu 404 | Critical | High | ✅ Fixed |
| DEF-002 | 58 produk hanya 22 gambar unik | Medium | Medium | ✅ Fixed |
| DEF-003 | ImgBB images timeout/tidak tampil | Critical | High | ✅ Fixed |
| DEF-004 | Unsplash category images 404 | Low | Low | ✅ Fixed |
| DEF-005 | Navbar links filter kategori salah | High | High | ✅ Fixed |
| DEF-006 | Prisma P2024 connection pool timeout | Critical | High | ✅ Fixed |
| DEF-007 | TDD test gagal karena test data salah | Low | Medium | ✅ Fixed |
| DEF-008 | BDD ambiguous step definition | Medium | Medium | ✅ Fixed |

---

## Detail Setiap Defect

### DEF-001: Product Detail Page Selalu Menampilkan "Produk Tidak Ditemukan"

| Aspek | Detail |
|-------|--------|
| **Severity** | Critical |
| **Priority** | High |
| **Ditemukan di** | Phase 7/8 — UI Testing manual |
| **Dilaporkan** | User: "ketika saya mengklik salah satu produk, halaman langsung menampilkan Produk tidak ditemukan" |
| **Environment** | http://localhost:3000/products/:slug |

**Deskripsi:**
Setiap kali user mengklik produk dari halaman katalog, halaman detail selalu menampilkan "Produk tidak ditemukan" meskipun produk benar-benar ada di database.

**Root Cause Analysis:**
```
URL: /products/vitamin-c-brightening-serum
↓
app/products/[id]/page.tsx memanggil:
  fetch('/api/products/vitamin-c-brightening-serum')
↓
app/api/products/[id]/route.ts:
  prisma.product.findUnique({ where: { id: "vitamin-c-brightening-serum" } })
↓
MASALAH: findUnique({ where: { id } }) hanya mencari by CUID!
         "vitamin-c-brightening-serum" bukan CUID → null → 404
```

**Perbaikan yang Diterapkan:**
```typescript
// SEBELUM (broken):
prisma.product.findUnique({ where: { id } })

// SESUDAH (fixed):
prisma.product.findFirst({
  where: { OR: [{ id }, { slug: id }], isActive: true },
  include: { category: { select: { id: true, name: true, slug: true } } },
})
```

**Commit Perbaikan:** `be83978` (Phase 9 bugfix)

---

### DEF-002: 58 Produk Hanya Memiliki 22 Gambar Unik

| Aspek | Detail |
|-------|--------|
| **Severity** | Medium |
| **Priority** | Medium |
| **Ditemukan di** | Phase 8 — audit-images.js |
| **Dilaporkan** | User: "masih banyak produk yang memiliki gambar yang sama" |

**Root Cause Analysis:**
Seed file awal hanya memiliki 22 Unsplash photo ID yang direcycle untuk 58 produk. Beberapa produk menerima ID yang sama dengan crop berbeda, namun banyak yang masih menggunakan ID identik.

**Perbaikan:**
- Buat `prisma/update-images.ts` dengan 58 mapping unik (ImgBB URLs dari Pinterest)
- Verifikasi: `58 URL unik, 0 duplikat`

**Commit Perbaikan:** `38c1ea9` + `c6723ef`

---

### DEF-003: Gambar Produk ImgBB Timeout / Tidak Muncul

| Aspek | Detail |
|-------|--------|
| **Severity** | Critical |
| **Priority** | High |
| **Ditemukan di** | Phase 8 — browser + terminal logs |
| **Log Error** | `⨯ upstream image response timed out for https://i.ibb.co/...` |

**Root Cause Analysis:**
```
Browser request → Next.js server → fetch i.ibb.co → BLOCKED (server-to-server hotlink)
                                   ↑
                          ImgBB blocks this request with timeout
```

Next.js `<Image>` component secara default memproxy gambar melalui `/_next/image?url=...`. ImgBB memblokir request server-to-server (hotlink protection), mengakibatkan semua gambar produk timeout.

**Perbaikan:**
```typescript
// next.config.ts
images: {
  unoptimized: true, // Browser fetch langsung ke i.ibb.co (tidak diblokir)
}
```

**Commit Perbaikan:** `ad46189`

---

### DEF-004: Gambar Kategori Unsplash Mengembalikan 404

| Aspek | Detail |
|-------|--------|
| **Severity** | Low |
| **Priority** | Low |
| **Ditemukan di** | Phase 8 — terminal error logs |
| **Log Error** | `⨯ upstream image response failed for https://images.unsplash.com/photo-xxx 404` |

**Root Cause Analysis:**
Gambar kategori masih menggunakan Unsplash photo ID lama dari fase awal development. Beberapa foto di Unsplash telah dihapus oleh pemiliknya (photographer menghapus/memprivatisasi foto).

**Perbaikan:**
- Buat `scripts/fix-category-images.ts` yang meng-set imageUrl semua kategori ke `null`
- CategoryCard memiliki fallback gradient CSS yang ditampilkan saat imageUrl null
- Selanjutnya: kategori mendapat gambar baru via ImgBB (redesign Phase 13)

**Commit Perbaikan:** `ad46189`

---

### DEF-005: Navbar "Best Sellers" dan "Skincare" Menampilkan Filter Salah

| Aspek | Detail |
|-------|--------|
| **Severity** | High |
| **Priority** | High |
| **Ditemukan di** | User testing setelah redesign |
| **Dilaporkan** | User: "ketika mengklik Best Seller atau Skincare, menampilkan semua produk serum dan moisturizer" |

**Root Cause Analysis:**
```typescript
// SEBELUM (broken):
const NAV_LINKS = [
  { href: "/products?category=serum-ampoule", label: "Best Sellers" },  // hanya serum!
  { href: "/products?category=pelembap-krim", label: "Skincare" },      // hanya moisturizer!
];
```

Saat redesign, dua nav links secara tidak tepat hardcoded ke filter kategori spesifik. "Best Sellers" seharusnya menampilkan semua produk, begitu juga "Skincare".

**Perbaikan:**
```typescript
// SESUDAH (fixed):
const NAV_LINKS = [
  { href: "/products", label: "Best Sellers", primary: false },
  { href: "/products", label: "Skincare",     primary: false },
];
```

**Commit Perbaikan:** `9996172`

---

### DEF-006: Prisma P2024 — Connection Pool Timeout

| Aspek | Detail |
|-------|--------|
| **Severity** | Critical |
| **Priority** | High |
| **Ditemukan di** | User testing — homepage loading |
| **Error Code** | `P2024: Timed out fetching a new connection from the connection pool` |

**Root Cause Analysis:**
1. Neon free tier: batas 17 koneksi aktif
2. Next.js dev server hot reload membuat banyak Prisma client instances
3. `log: ["query", "warn"]` menambah I/O overhead yang memicu lebih banyak koneksi
4. Default `pool_timeout = 10 detik` terlalu singkat untuk cold start Neon

**Perbaikan yang Diterapkan:**

*lib/db.ts:*
```typescript
// SEBELUM: log: ["query", "error", "warn"] -- terlalu banyak overhead
// SESUDAH: log: ["error"] -- minimal, mengurangi tekanan koneksi
```

*.env + .env.local:*
```
# SESUDAH: parameter baru ditambahkan
DATABASE_URL="...?&pool_timeout=30&connection_limit=5"
```

**Commit Perbaikan:** `9996172`

---

### DEF-007: TDD Test V-05 Gagal karena Test Data Mengandung Angka

| Aspek | Detail |
|-------|--------|
| **Severity** | Low |
| **Priority** | Medium |
| **Ditemukan di** | Phase 15 — GREEN stage |
| **Jumlah Test Gagal** | 1 test (dari 47) |

**Root Cause Analysis:**
```typescript
// Test V-05 menggunakan:
validateRecipientName("  Team 1  ")  // "Team 1" mengandung "1" (angka!)

// BR-RN05 menyatakan:
// Nama penerima TIDAK BOLEH mengandung angka
// ↓
// Test GAGAL: expected true, received false
```

Test tidak konsisten dengan Business Rule yang baru ditambahkan (BR-RN05).

**Perbaikan:**
```typescript
// SEBELUM (inconsistent):
validateRecipientName("  Team 1  ")  // fail karena "1"

// SESUDAH (fixed):
validateRecipientName("  Sarah Putri  ")  // pass (tidak ada angka)
```

**Commit Perbaikan:** Phase 15 TDD commit

---

### DEF-008: BDD Scenarios Ambiguous karena Duplikat Step Definition

| Aspek | Detail |
|-------|--------|
| **Severity** | Medium |
| **Priority** | Medium |
| **Ditemukan di** | Phase 16 — Cucumber execution |
| **Output Error** | `25 scenarios (23 passed, 2 ambiguous)` |

**Root Cause Analysis:**
```
Step "pesan error mengandung {string}" didefinisikan di:
  1. tests/bdd/step-definitions/login.steps.ts    (menggunakan LoginWorld)
  2. tests/bdd/step-definitions/checkout.steps.ts (menggunakan CheckoutWorld)

→ Cucumber tidak bisa menentukan mana yang digunakan → Ambiguous!
```

**Perbaikan:**
```typescript
// checkout.steps.ts — SEBELUM (duplikat):
Then("pesan error mengandung {string}", ...)

// checkout.steps.ts — SESUDAH (unik):
Then("pesan error nama mengandung {string}", ...)

// checkout.feature — SEBELUM:
And pesan error mengandung "angka"

// checkout.feature — SESUDAH:
And pesan error nama mengandung "angka"
```

**Commit Perbaikan:** Phase 16 BDD commit

---

## Klasifikasi Severity dan Priority

### Severity Distribution

| Severity | Count | DEF-IDs |
|----------|:-----:|---------|
| Critical | 3 | DEF-001, DEF-003, DEF-006 |
| High | 1 | DEF-005 |
| Medium | 2 | DEF-002, DEF-008 |
| Low | 2 | DEF-004, DEF-007 |

### Priority Distribution

| Priority | Count | DEF-IDs |
|----------|:-----:|---------|
| High | 4 | DEF-001, DEF-003, DEF-005, DEF-006 |
| Medium | 3 | DEF-002, DEF-007, DEF-008 |
| Low | 1 | DEF-004 |

---

## Rekomendasi Perbaikan (Future)

| Rekomendasi | Alasan |
|-------------|--------|
| Tambahkan integration tests untuk product slug lookup | Mencegah regresi DEF-001 |
| Validasi URL format gambar sebelum disimpan ke database | Mencegah regresi DEF-002/DEF-003 |
| Tambahkan Neon `pgbouncer=true` parameter | Optimasi koneksi DEF-006 |
| Gunakan `startsWith("//")` check untuk path alias | Keamanan callback URL |
| Buat eslint rule untuk detect duplicate step patterns | Mencegah regresi DEF-008 |

---

## Hasil Retest (Automated)

### Retest Summary

```
Test File: tests/unit/defect-retest.test.ts
──────────────────────────────────────────
Test Suites : 1 passed
Total Tests : 35 passed
FAILED      : 0
Duration    : ~12s
```

### Retest per Defect

| DEF-ID | Retest Cases | Hasil |
|--------|:-----------:|:-----:|
| DEF-001 | 4 | ✅ PASS |
| DEF-002 | 3 | ✅ PASS |
| DEF-003 | 3 | ✅ PASS |
| DEF-004 | 2 | ✅ PASS |
| DEF-005 | 4 | ✅ PASS |
| DEF-006 | 4 | ✅ PASS |
| DEF-007 | 4 | ✅ PASS |
| DEF-008 | 3 | ✅ PASS |
| Regression (8 test) | 8 | ✅ PASS |
| **Total** | **35** | ✅ **35/35** |

---

## Evaluasi Kualitas Aplikasi

### Test Coverage Summary

| Phase Testing | Tools | Tests | Status |
|--------------|-------|:-----:|:------:|
| Unit Tests (cart) | Jest | 35 | ✅ 35/35 |
| Unit Tests (order) | Jest | 43 | ✅ 43/43 |
| Unit Tests (product) | Jest | 61 | ✅ 61/61 |
| State Transition Testing | Jest | 41 | ✅ 41/41 |
| Cyclomatic Complexity | Jest | 49 | ✅ 49/49 |
| TDD Tests | Jest | 47 | ✅ 47/47 |
| Defect Retest | Jest | 35 | ✅ 35/35 |
| BDD | Cucumber.js | 25 scenarios | ✅ 25/25 |
| UI Automation | Cypress | 20 TC | (manual) |
| API Automation | Newman | 82 assertions | ✅ 82/82 |
| **Total Automated** | | **311 + 82** | ✅ |

### Penilaian Kualitas

| Dimensi | Nilai | Keterangan |
|---------|:-----:|-----------|
| **Fungsionalitas** | Baik | Semua FR-01 s/d FR-23 terverifikasi |
| **Keandalan** | Baik | Business rules BR-01 s/d BR-20 teruji |
| **Keamanan** | Sedang | JWT auth, bcrypt password, tidak ada hard-coded secrets |
| **Performa** | Baik | Response time < 5s, Neon connection pool dikonfigurasi |
| **Kemudahan Penggunaan** | Baik | UI responsif, error messages informatif |
| **Keterpeliharaan** | Baik | TypeScript, modular architecture, dokumentasi lengkap |

### Keterbatasan Pengujian

| Keterbatasan | Keterangan |
|-------------|-----------|
| UI Automation tidak dieksekusi otomatis | Cypress memerlukan browser GUI; server harus berjalan manual |
| Performance testing tidak dilakukan | Tidak ada load testing atau stress testing |
| Security testing terbatas | Tidak ada penetration testing atau OWASP scan |
| Cross-browser testing tidak dilakukan | Hanya diuji di browser default |
| Mobile responsiveness tidak diuji otomatis | Hanya visual check manual |

---

*Dokumen ini dibuat pada Phase 19 — Defect Analysis dan Retesting*
*Project: LUMIÈRE SKIN — UTS Advanced Software Testing 2025-2026*
