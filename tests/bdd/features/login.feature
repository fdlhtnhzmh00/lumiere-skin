# tests/bdd/features/login.feature
#
# ╔══════════════════════════════════════════════════════════════╗
# ║  FEATURE: Autentikasi Pengguna (User Authentication)        ║
# ║  Phase 16 — Behavior-Driven Development (BDD)               ║
# ║  LUMIÈRE SKIN — Web Application Toko Skincare               ║
# ╚══════════════════════════════════════════════════════════════╝
#
# Skenario:
#   1. Login berhasil dengan email valid        (POSITIF)
#   2. Login berhasil dengan username valid     (POSITIF)
#   3. Login gagal dengan password salah        (NEGATIF)
#   4. Login gagal dengan field email kosong    (NEGATIF)
#   5. Login gagal dengan field password kosong (NEGATIF, BOUNDARY)
#   6. Scenario Outline: kombinasi kredensial   (OUTLINE + EXAMPLES)

Feature: Autentikasi Pengguna LUMIÈRE SKIN
  Sebagai pengguna toko skincare LUMIÈRE SKIN
  Saya ingin dapat login ke aplikasi menggunakan email atau username
  Agar saya bisa mengakses fitur keranjang belanja, checkout, dan riwayat pesanan

  Background:
    Given aplikasi LUMIÈRE SKIN sedang berjalan
    And tersedia akun pengguna dengan email "user@lumiereskin.com" dan password "Lumiere123!"

  # ── SKENARIO 1: POSITIF — Login berhasil dengan email ─────────
  Scenario: Login berhasil menggunakan email yang terdaftar
    Given saya berada di halaman login
    When saya memasukkan email "user@lumiereskin.com" dan password "Lumiere123!"
    Then sistem memvalidasi kredensial dengan sukses
    And status autentikasi berubah menjadi "terautentikasi"

  # ── SKENARIO 2: POSITIF — Login berhasil dengan username ──────
  Scenario: Login berhasil menggunakan username
    Given saya berada di halaman login
    When saya memasukkan username "team1" dan password "Lumiere123!"
    Then sistem memvalidasi kredensial dengan sukses
    And status autentikasi berubah menjadi "terautentikasi"

  # ── SKENARIO 3: NEGATIF — Password salah ──────────────────────
  Scenario: Login gagal karena password tidak sesuai
    Given saya berada di halaman login
    When saya memasukkan email "user@lumiereskin.com" dan password "passwordsalah"
    Then sistem menolak login
    And pesan error mengandung "salah"

  # ── SKENARIO 4: NEGATIF — Email/username kosong ───────────────
  Scenario: Login gagal karena field email kosong
    Given saya berada di halaman login
    When saya memasukkan email "" dan password "Lumiere123!"
    Then validasi form gagal
    And pesan validasi mengandung "wajib"

  # ── SKENARIO 5: NEGATIF + BOUNDARY — Password kosong ─────────
  Scenario: Login gagal karena field password kosong
    Given saya berada di halaman login
    When saya memasukkan email "user@lumiereskin.com" dan password ""
    Then validasi form gagal
    And pesan validasi mengandung "wajib"

  # ── SKENARIO 6: SCENARIO OUTLINE — Berbagai kombinasi ─────────
  Scenario Outline: Login dengan berbagai kombinasi kredensial
    Given saya berada di halaman login
    When saya memasukkan identifier "<identifier>" dan password "<password>"
    Then hasil validasi adalah "<hasil>"

    Examples:
      | identifier              | password     | hasil          |
      | user@lumiereskin.com   | Lumiere123!  | valid          |
      | team1                   | Lumiere123!  | valid          |
      | admin@lumiereskin.com  | Admin123!    | valid          |
      | user@lumiereskin.com   | salah        | credentials_error |
      | userTidakAda@email.com  | Lumiere123!  | credentials_error |
      |                         | Lumiere123!  | validation_error  |
      | user@lumiereskin.com   |              | validation_error  |
