# tests/bdd/features/checkout.feature
#
# ╔══════════════════════════════════════════════════════════════╗
# ║  FEATURE: Checkout dan Status Pesanan                       ║
# ║  Phase 16 — Behavior-Driven Development (BDD)               ║
# ║  LUMIÈRE SKIN — Web Application Toko Skincare               ║
# ╚══════════════════════════════════════════════════════════════╝
#
# Skenario:
#   1. Checkout berhasil dengan data valid       (POSITIF)
#   2. Checkout gagal - belum login              (NEGATIF)
#   3. Checkout gagal - keranjang kosong         (NEGATIF)
#   4. Validasi nama penerima - angka            (NEGATIF, BOUNDARY)
#   5. Validasi telepon - boundary               (BOUNDARY)
#   6. Transisi status DRAFT→CONFIRMED           (STATUS TRANSITION, POSITIF)
#   7. Transisi status tidak valid COMPLETED     (STATUS TRANSITION, NEGATIF)

Feature: Proses Checkout dan Manajemen Status Pesanan
  Sebagai pengguna yang sudah login di LUMIÈRE SKIN
  Saya ingin dapat melakukan checkout dan mengelola status pesanan
  Agar produk skincare yang saya pesan dapat dikirim ke alamat yang benar

  # ── SKENARIO 1: POSITIF — Checkout berhasil ───────────────────
  Scenario: Checkout berhasil dengan semua data pengiriman yang valid
    Given saya sudah login sebagai pengguna LUMIÈRE SKIN
    And keranjang belanja saya berisi 2 produk
    When saya mengisi data pengiriman:
      | Nama Penerima     | Sarah Putri                              |
      | Alamat Pengiriman | Jl. Sultan Alauddin No. 259, Makassar    |
      | Nomor Telepon     | 081234567890                             |
    Then data checkout berhasil divalidasi
    And pesanan baru akan memiliki status "DRAFT"

  # ── SKENARIO 2: NEGATIF — Checkout tanpa login ────────────────
  Scenario: Checkout gagal karena pengguna belum login
    Given saya belum login ke aplikasi
    And keranjang belanja berisi 1 produk
    When saya mencoba melakukan checkout
    Then sistem menolak proses checkout
    And sistem meminta saya untuk login terlebih dahulu

  # ── SKENARIO 3: NEGATIF — Keranjang kosong ────────────────────
  Scenario: Checkout gagal karena keranjang belanja kosong
    Given saya sudah login sebagai pengguna LUMIÈRE SKIN
    And keranjang belanja saya kosong
    When saya mencoba melakukan checkout
    Then sistem menolak proses checkout
    And sistem menampilkan pesan "keranjang" tidak boleh kosong

  # ── SKENARIO 4: NEGATIF + BOUNDARY — Nama dengan angka ───────
  Scenario: Checkout gagal karena nama penerima mengandung angka
    Given saya sudah login sebagai pengguna LUMIÈRE SKIN
    And keranjang belanja saya berisi 1 produk
    When saya mengisi nama penerima "Sarah123"
    Then validasi nama penerima gagal
    And pesan error nama mengandung "angka"

  # ── SKENARIO 5: BOUNDARY — Validasi panjang nomor telepon ─────
  Scenario Outline: Validasi nomor telepon dengan berbagai panjang digit
    Given saya sudah login sebagai pengguna LUMIÈRE SKIN
    When saya mengisi nomor telepon "<nomor>"
    Then hasil validasi telepon adalah "<hasil>"

    Examples:
      | nomor             | hasil   |
      | 081234567         | gagal   |
      | 0812345678        | valid   |
      | 081234567890      | valid   |
      | 0812345678901     | valid   |
      | 08123456789012    | gagal   |
      | +6281234567890    | valid   |
      | 021-123456        | gagal   |

  # ── SKENARIO 6: STATUS TRANSITION POSITIF ─────────────────────
  Scenario: Perubahan status pesanan dari DRAFT menjadi CONFIRMED
    Given terdapat pesanan dengan status "DRAFT"
    When dilakukan perubahan status pesanan menjadi "CONFIRMED"
    Then perubahan status berhasil diterima
    And status pesanan sekarang adalah "CONFIRMED"

  # ── SKENARIO 7: STATUS TRANSITION NEGATIF ─────────────────────
  Scenario: Perubahan status pesanan ditolak dari COMPLETED ke CANCELLED
    Given terdapat pesanan dengan status "COMPLETED"
    When dilakukan perubahan status pesanan menjadi "CANCELLED"
    Then perubahan status ditolak oleh sistem
    And sistem menampilkan pesan bahwa pesanan sudah selesai tidak dapat diubah
