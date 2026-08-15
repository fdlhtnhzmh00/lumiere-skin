# Phase 17 — Otomatisasi Pengujian UI dengan Cypress + POM
## LUMIÈRE SKIN: Web Application Toko Skincare
### BAB VI: Otomatisasi Pengujian UI

---

## Tools dan Framework

| Komponen | Teknologi |
|----------|-----------|
| Framework Otomatisasi UI | Cypress v15.20.1 |
| Pola Desain | Page Object Model (POM) |
| Bahasa | TypeScript |
| Test Runner | Cypress CLI / Cypress Open |
| Report | Video (`.mp4`) + Screenshot (`.png`) |
| Base URL | `http://localhost:3000` |

### Cara Menjalankan Tests

```bash
# Opsi 1: Interactive mode (GUI)
npm run dev              # Terminal 1: jalankan aplikasi
npm run test:e2e:open    # Terminal 2: buka Cypress GUI

# Opsi 2: Headless mode (CI)
npm run test:e2e:ci      # Otomatis start server + jalankan semua tests

# Opsi 3: Manual headless
npm run dev              # Terminal 1
npm run test:e2e         # Terminal 2: Cypress headless
```

---

## Struktur Proyek Pengujian UI

```
cypress/
├── e2e/                          ← Test specs (terpisah dari Page Objects)
│   ├── login.cy.ts               ← TC-UI-01 s/d TC-UI-06
│   ├── products.cy.ts            ← TC-UI-07 s/d TC-UI-10
│   ├── cart.cy.ts                ← TC-UI-11 s/d TC-UI-15
│   └── checkout.cy.ts            ← TC-UI-16 s/d TC-UI-20
│
├── pages/                        ← Page Object Model classes
│   ├── LoginPage.ts              ← Enkapsulasi halaman /login
│   ├── ProductsPage.ts           ← Enkapsulasi halaman /products
│   ├── CartPage.ts               ← Enkapsulasi halaman /cart
│   └── CheckoutPage.ts           ← Enkapsulasi halaman /checkout
│
├── fixtures/
│   └── testData.json             ← Structured test data
│
├── support/
│   ├── commands.ts               ← Custom commands: login(), addToCart()
│   └── e2e.ts                    ← Entry point + global config
│
├── screenshots/                  ← Auto-generated saat test gagal
├── videos/                       ← Auto-generated saat test run
└── tsconfig.json                 ← TypeScript config untuk Cypress
```

---

## Penerapan Page Object Model

### Prinsip POM yang Diterapkan

| Prinsip | Implementasi |
|---------|-------------|
| **Separation of Concerns** | Selectors, actions, dan assertions terpisah dalam Page Object class |
| **Reusability** | Setiap method di Page Object dapat dipanggil dari test manapun |
| **Maintainability** | Jika selector berubah, cukup update di satu tempat (Page Object) |
| **Readability** | Test specs menggunakan method bernama, bukan raw selectors |
| **Method Chaining** | Setiap method mengembalikan `this` untuk fluent API |

### Contoh Penggunaan POM

```typescript
// Tanpa POM (fragile, hard to maintain):
cy.get('[data-testid="login-identifier"]').type('user@lumiereskin.com');
cy.get('[data-testid="login-password"]').type('Lumiere123!');
cy.get('[data-testid="login-submit"]').click();
cy.url().should('not.include', '/login');

// Dengan POM (readable, maintainable):
loginPage.visit()
  .loginWith(data.validUser.identifier, data.validUser.password)
  .shouldBeLoggedIn();
```

---

## Data Pengujian (testData.json)

```json
{
  "validUser":     { "identifier": "user@lumiereskin.com", "password": "Lumiere123!" },
  "invalidUser":   { "identifier": "invalid@example.com",  "password": "wrong" },
  "checkoutValid": {
    "recipientName":   "Sarah Putri",
    "shippingAddress": "Jl. Sultan Alauddin No. 259, Makassar",
    "phoneNumber":     "081234567890"
  },
  "testProduct": { "slug": "vitamin-c-brightening-serum" }
}
```

---

## Test Cases — 20 Test Cases

### Login (6 test cases)

| TC-ID | Skenario | Tipe | Selector Utama |
|-------|---------|------|---------------|
| TC-UI-01 | Login berhasil dengan email valid | POSITIF | `login-identifier`, `login-submit` |
| TC-UI-02 | Login berhasil dengan username | POSITIF | `login-identifier`, `login-submit` |
| TC-UI-03 | Login gagal — password salah | NEGATIF | `login-error` |
| TC-UI-04 | Login gagal — email tidak terdaftar | NEGATIF | `login-error` |
| TC-UI-05 | Login gagal — identifier kosong | NEGATIF | validation message |
| TC-UI-06 | Login gagal — password kosong | NEGATIF | validation message |

### Products (4 test cases)

| TC-ID | Skenario | Tipe |
|-------|---------|------|
| TC-UI-07 | Menampilkan daftar produk | POSITIF |
| TC-UI-08 | Melihat detail produk | POSITIF |
| TC-UI-09 | Filter produk berdasarkan kategori | POSITIF |
| TC-UI-10 | Tambah produk ke keranjang dari detail | POSITIF |

### Cart (5 test cases)

| TC-ID | Skenario | Tipe |
|-------|---------|------|
| TC-UI-11 | Produk berhasil ditambahkan ke keranjang | POSITIF |
| TC-UI-12 | Mengubah jumlah produk dalam keranjang | POSITIF |
| TC-UI-13 | Menghapus produk dari keranjang | POSITIF |
| TC-UI-14 | Empty state keranjang kosong | POSITIF |
| TC-UI-15 | Validasi quantity melebihi batas (>10) | NEGATIF |

### Checkout (5 test cases)

| TC-ID | Skenario | Tipe |
|-------|---------|------|
| TC-UI-16 | Checkout berhasil, pesanan DRAFT dibuat | POSITIF |
| TC-UI-17 | Checkout gagal — semua field kosong | NEGATIF |
| TC-UI-18 | Checkout gagal — nama penerima kosong | NEGATIF |
| TC-UI-19 | Checkout ditolak — belum login | NEGATIF |
| TC-UI-20 | Checkout ditolak — keranjang kosong | NEGATIF |

**Total: 20 test cases (memenuhi requirement minimum 8)**

---

## Custom Commands

```typescript
// cypress/support/commands.ts

cy.login(identifier, password)
// → Otomatis navigasi /login, isi form, submit, tunggu redirect

cy.addToCart(slug)
// → Navigasi ke /products/:slug, klik "Add to Cart", tunggu feedback

cy.clearAppState()
// → Hapus localStorage token, user, cart + clear cookies
```

---

## Assertions yang Digunakan

| Assertion | Penggunaan |
|-----------|-----------|
| `should('be.visible')` | Elemen terlihat di layar |
| `should('not.be.disabled')` | Tombol aktif/dapat diklik |
| `should('contain.text', ...)` | Teks mengandung substring tertentu |
| `should('include', ...)` | URL mengandung path tertentu |
| `should('have.length.greaterThan', ...)` | Elemen lebih dari N |
| `should('have.value', ...)` | Input memiliki nilai tertentu |
| `invoke('text')` | Ambil teks untuk perbandingan |

---

## Skenario Positif vs Negatif

| Kategori | Count | Test Cases |
|----------|:-----:|------------|
| POSITIF | 11 | TC-UI-01, 02, 07, 08, 09, 10, 11, 12, 13, 14, 16 |
| NEGATIF | 9 | TC-UI-03, 04, 05, 06, 15, 17, 18, 19, 20 |

---

## Cara Mengambil Screenshot/Evidence untuk PPT

```bash
# Setelah menjalankan tests, screenshot tersimpan di:
cypress/screenshots/

# Video tersimpan di:
cypress/videos/

# Untuk PPT, ambil screenshot:
1. Cypress GUI terbuka dengan daftar test files
2. Test running - progress indicator
3. Setiap test PASS (hijau)
4. Browser menampilkan aplikasi saat test berjalan
5. Terminal output "X passing (Y ms)"
```

---

*Dokumen ini dibuat pada Phase 17 — UI Automation dengan Cypress + POM*
*Project: LUMIÈRE SKIN — UTS Advanced Software Testing 2025-2026*
