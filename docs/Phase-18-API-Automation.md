# Phase 18 — Otomatisasi Pengujian RESTful API
## LUMIÈRE SKIN: Web Application Toko Skincare
### BAB VII: Otomatisasi Pengujian RESTful API

---

## Tools dan Framework

| Komponen | Teknologi |
|----------|-----------|
| Koleksi API | Postman Collection v2.1 (JSON) |
| CLI Runner | Newman v6.2.2 (sudah terinstall global) |
| Report | newman-reporter-htmlextra v1.23.1 (sudah terinstall global) |
| Environment | Postman Environment JSON |
| Base URL | `http://localhost:3000` |

### Cara Menjalankan

```bash
# Pastikan aplikasi berjalan dulu
npm run dev

# Di terminal lain, jalankan Newman:
npm run test:api

# Laporan HTML tersimpan di:
tests/api/reports/report.html
```

---

## Struktur Koleksi

```
tests/api/
├── lumiere-skin.postman_collection.json   ← Koleksi 15 requests
├── lumiere-skin.postman_environment.json  ← Environment variables
└── reports/
    └── report.html                        ← Laporan HTML (htmlextra)
```

### Alur Eksekusi

```
0 — Setup (3 requests)
  S-01: POST /api/auth/login         → simpan {{token}}
  S-02: GET  /api/categories         → simpan {{categoryId}}
  S-03: GET  /api/products?limit=1   → simpan {{testProductId}}

TC-API Products (9 requests = TC-API-01 s/d TC-API-09)
TC-API Orders   (3 requests = TC-API-10 s/d TC-API-12)
```

---

## Environment Variables

| Variable | Nilai Awal | Diisi Saat |
|----------|-----------|-----------|
| `baseUrl` | `http://localhost:3000` | Statis |
| `userEmail` | `user@lumiereskin.com` | Statis |
| `userPassword` | `Lumiere123!` | Statis |
| `token` | (kosong) | Setelah S-01 login |
| `categoryId` | (kosong) | Setelah S-02 |
| `testProductId` | (kosong) | Setelah S-03 |
| `createdProductId` | (kosong) | Setelah TC-API-04 |
| `orderId` | (kosong) | Setelah TC-API-10 |

---

## 12 Test Cases API

### TC-API-01: GET All Products

| Aspek | Detail |
|-------|--------|
| Method | GET |
| Endpoint | `/api/products` |
| Auth | Tidak |
| Status Expected | 200 |
| Jenis | POSITIF |

**Validasi:**
- Status code = 200
- Response time < 10000ms
- Content-Type: application/json
- `success` = true
- `data.products` adalah array tidak kosong
- `data.total` > 0
- Setiap produk: `id, name, price, stock, imageUrl, category`
- `price` > 0 (number), `stock` >= 0 (number)
- JSON Schema valid

---

### TC-API-02: GET Product by Valid ID

| Aspek | Detail |
|-------|--------|
| Method | GET |
| Endpoint | `/api/products/:id` |
| Auth | Tidak |
| Status Expected | 200 |
| Jenis | POSITIF |

**Validasi:** Status 200, product detail dengan semua field, price > 0

---

### TC-API-03: GET Product — ID Tidak Ditemukan

| Aspek | Detail |
|-------|--------|
| Method | GET |
| Endpoint | `/api/products/produk-tidak-ada-id-xyz-999` |
| Auth | Tidak |
| Status Expected | 404 |
| Jenis | NEGATIF |

**Validasi:** Status 404, `success=false`, `error=NOT_FOUND`

---

### TC-API-04: POST Create Product — Payload Valid

| Aspek | Detail |
|-------|--------|
| Method | POST |
| Endpoint | `/api/products` |
| Auth | Ya (Bearer token) |
| Status Expected | 201 |
| Jenis | POSITIF |

**Payload:**
```json
{
  "name": "Test Product TC-API-04 Vitamin Glow",
  "price": 150000,
  "stock": 25,
  "categoryId": "{{categoryId}}",
  "imageUrl": "https://i.ibb.co/...",
  "description": "Test product"
}
```
**Validasi:** Status 201, `data.product.id` tersimpan ke env, data sesuai payload

---

### TC-API-05: POST Create Product — Tanpa Nama

| Aspek | Detail |
|-------|--------|
| Method | POST |
| Status Expected | 400 |
| Jenis | NEGATIF |

**Validasi:** Status 400, `error=VALIDATION_ERROR`, pesan menyebut "nama"

---

### TC-API-06: POST Create Product — Harga Negatif

| Aspek | Detail |
|-------|--------|
| Method | POST |
| Status Expected | 400 |
| Jenis | NEGATIF |

**Payload:** `"price": -50000`
**Validasi:** Status 400, pesan menyebut "harga", tidak ada `data.product`

---

### TC-API-07: PATCH Update Product — Valid

| Aspek | Detail |
|-------|--------|
| Method | PATCH |
| Status Expected | 200 |
| Jenis | POSITIF |

**Payload:** `{"price": 175000, "stock": 30}`
**Validasi:** Status 200, data terupdate sesuai payload

---

### TC-API-08: PATCH Update Product — 404

| Aspek | Detail |
|-------|--------|
| Method | PATCH |
| Status Expected | 404 |
| Jenis | NEGATIF |

**Validasi:** Status 404, `error=NOT_FOUND`

---

### TC-API-09: DELETE Product

| Aspek | Detail |
|-------|--------|
| Method | DELETE |
| Status Expected | 200 |
| Jenis | POSITIF |

**Validasi:** Status 200, `success=true`, message ada

---

### TC-API-10: POST Create Order — Data Valid

| Aspek | Detail |
|-------|--------|
| Method | POST |
| Endpoint | `/api/orders` |
| Status Expected | 201 |
| Jenis | POSITIF |

**Validasi:**
- Status 201
- `data.order.status = "DRAFT"` (BR-14)
- `data.order.orderNumber` dimulai dengan "LS-"
- Field: id, orderNumber, status, totalPrice, recipientName, shippingAddress, phoneNumber, items
- `totalPrice > 0`, items tidak kosong

---

### TC-API-11: POST Create Order — Stok Tidak Mencukupi

| Aspek | Detail |
|-------|--------|
| Method | POST |
| Status Expected | 422 |
| Jenis | NEGATIF |

**Payload:** `quantity: 999` (melebihi stok apapun)
**Validasi:** Status 422, `success=false`, error terkait stok

---

### TC-API-12: PATCH Order Status — Transisi Tidak Valid

| Aspek | Detail |
|-------|--------|
| Method | PATCH |
| Endpoint | `/api/orders/:id/status` |
| Status Expected | 422 |
| Jenis | NEGATIF |

**Payload:** `{"status": "COMPLETED"}` (dari DRAFT, loncat CONFIRMED)
**Validasi:** Status 422, `error=INVALID_STATUS_TRANSITION`, pesan menyebut "DRAFT"

---

## Validasi yang Diterapkan

| Jenis Validasi | Diterapkan Di |
|---------------|-------------|
| Status code | Semua 12 TC |
| Response body | Semua 12 TC |
| Content type | Semua 12 TC |
| Response time (<10s) | Semua 12 TC |
| Required fields | TC-01, 02, 04, 10 |
| Data types | TC-01, 02, 10 |
| JSON Schema | TC-01 |
| Error messages | TC-03, 05, 06, 08, 11, 12 |
| Error codes | TC-03, 05, 06, 08, 12 |
| Request payload match | TC-04, 07, 10 |
| Skenario positif | TC-01, 02, 04, 07, 09, 10 |
| Skenario negatif | TC-03, 05, 06, 08, 11, 12 |

---

## Hasil Eksekusi Newman

```
┌─────────────────────────┬────────────────────┬───────────────────┐
│                         │           executed │            failed │
├─────────────────────────┼────────────────────┼───────────────────┤
│              iterations │                  1 │                 0 │
├─────────────────────────┼────────────────────┼───────────────────┤
│                requests │                 15 │                 0 │
├─────────────────────────┼────────────────────┼───────────────────┤
│            test-scripts │                 15 │                 0 │
├─────────────────────────┼────────────────────┼───────────────────┤
│              assertions │                 82 │                 0 │
├─────────────────────────┴────────────────────┴───────────────────┤
│ total run duration: 26.9s                                        │
├──────────────────────────────────────────────────────────────────┤
│ average response time: 1699ms [min: 27ms, max: 5s]               │
└──────────────────────────────────────────────────────────────────┘

HASIL: 82/82 ASSERTIONS PASSED — 0 FAILURES
```

**Coverage per TC:**

| TC | Assertions | Status |
|----|:----------:|:------:|
| TC-API-01 | 9 | ✅ |
| TC-API-02 | 6 | ✅ |
| TC-API-03 | 5 | ✅ |
| TC-API-04 | 7 | ✅ |
| TC-API-05 | 6 | ✅ |
| TC-API-06 | 6 | ✅ |
| TC-API-07 | 6 | ✅ |
| TC-API-08 | 5 | ✅ |
| TC-API-09 | 5 | ✅ |
| TC-API-10 | 9 | ✅ |
| TC-API-11 | 6 | ✅ |
| TC-API-12 | 7 | ✅ |
| **TOTAL** | **82** | ✅ |

---

*Dokumen ini dibuat pada Phase 18 — Otomatisasi Pengujian RESTful API*
*Project: LUMIÈRE SKIN — UTS Advanced Software Testing 2025-2026*
