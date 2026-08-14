/**
 * lib/validations/checkout.ts
 *
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  TDD PHASE — REFACTORED IMPLEMENTATION                      ║
 * ║  Kode sudah direfactor: lebih bersih, lebih modular,        ║
 * ║  error messages lebih informatif, konstanta diekstrak,      ║
 * ║  dan regex pattern lebih eksplisit.                         ║
 * ║  Semua test TETAP PASS setelah refactoring.                 ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Perubahan dari GREEN ke REFACTOR:
 * 1. Ekstrak konstanta batas (MIN_NAME_LENGTH, MAX_NAME_LENGTH, dll.)
 * 2. Ekstrak helper function `extractDigitsOnly()` agar DRY
 * 3. Ganti regex inline dengan named constants yang lebih readable
 * 4. Perbaiki struktur guard clause agar lebih linear
 * 5. Tambahkan JSDoc yang lebih lengkap
 * 6. Perjelas pengecekan format +628 vs 08 menggunakan helper
 */

export interface CheckoutFieldResult {
  valid: boolean;
  error: string | null;
}

// ─── Konstanta Validasi Nama ──────────────────────────────────
const NAME_MIN_LENGTH  = 2;
const NAME_MAX_LENGTH  = 100;

/** Karakter yang diizinkan dalam nama: huruf (termasuk diakritik), spasi, apostrophe, hyphen */
const VALID_NAME_REGEX = /^[a-zA-Z\u00C0-\u024F\s'\-]+$/;

/** Angka dalam nama — tidak diizinkan */
const DIGIT_IN_NAME_REGEX = /[0-9]/;

// ─── Konstanta Validasi Telepon ───────────────────────────────
const PHONE_MIN_DIGITS = 10;
const PHONE_MAX_DIGITS = 13;

/** Karakter yang diizinkan dalam nomor telepon */
const VALID_PHONE_CHARS_REGEX = /^[0-9+\-\s()]+$/;

/** Hanya mengambil digit dari string */
function extractDigitsOnly(phone: string): string {
  return phone.replace(/[\s\-()]/g, "");
}

/** Cek apakah nomor menggunakan format lokal Indonesia (08xx) */
function isIndonesianLocalFormat(digits: string): boolean {
  return digits.startsWith("08");
}

/** Cek apakah nomor menggunakan format internasional Indonesia (+628xx) */
function isIndonesianInternationalFormat(phone: string): boolean {
  return phone.trim().startsWith("+628");
}

// ─── Fungsi Utama ─────────────────────────────────────────────

/**
 * Validasi nama penerima paket pada proses checkout.
 *
 * @param name - Nilai yang akan divalidasi (bisa tipe apapun)
 * @returns CheckoutFieldResult { valid, error }
 *
 * Business Rules:
 * @see BR-RN01 Harus berupa string
 * @see BR-RN02 Tidak boleh kosong atau hanya whitespace
 * @see BR-RN03 Minimal 2 karakter setelah di-trim
 * @see BR-RN04 Maksimal 100 karakter
 * @see BR-RN05 Tidak boleh mengandung angka
 * @see BR-RN06 Hanya huruf, spasi, apostrophe ('), hyphen (-) yang diizinkan
 */
export function validateRecipientName(name: unknown): CheckoutFieldResult {
  // BR-RN01: tipe data
  if (typeof name !== "string") {
    return { valid: false, error: "Nama penerima harus berupa teks" };
  }

  const trimmed = name.trim();

  // BR-RN02: tidak kosong
  if (trimmed.length === 0) {
    return { valid: false, error: "Nama penerima tidak boleh kosong" };
  }

  // BR-RN03: panjang minimum
  if (trimmed.length < NAME_MIN_LENGTH) {
    return {
      valid: false,
      error: `Nama penerima minimal ${NAME_MIN_LENGTH} karakter`,
    };
  }

  // BR-RN04: panjang maksimum
  if (trimmed.length > NAME_MAX_LENGTH) {
    return {
      valid: false,
      error: `Nama penerima maksimal ${NAME_MAX_LENGTH} karakter`,
    };
  }

  // BR-RN05: tidak boleh mengandung angka
  if (DIGIT_IN_NAME_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: "Nama penerima tidak boleh mengandung angka",
    };
  }

  // BR-RN06: hanya karakter nama yang diizinkan
  if (!VALID_NAME_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: "Nama penerima hanya boleh berisi huruf, spasi, apostrophe ('), dan tanda hubung (-)",
    };
  }

  return { valid: true, error: null };
}

/**
 * Validasi nomor telepon Indonesia pada proses checkout.
 *
 * @param phone - Nilai yang akan divalidasi (bisa tipe apapun)
 * @returns CheckoutFieldResult { valid, error }
 *
 * Business Rules:
 * @see BR-PH01 Harus berupa string
 * @see BR-PH02 Tidak boleh kosong
 * @see BR-PH03 Harus dimulai dengan '08' atau '+628' (format Indonesia)
 * @see BR-PH04 Panjang digit lokal 10-13 digit
 * @see BR-PH05 Hanya boleh berisi digit, +, -, spasi, tanda kurung
 */
export function validateIndonesianPhone(phone: unknown): CheckoutFieldResult {
  // BR-PH01: tipe data
  if (typeof phone !== "string") {
    return { valid: false, error: "Nomor telepon harus berupa teks" };
  }

  const trimmed = phone.trim();

  // BR-PH02: tidak kosong
  if (trimmed.length === 0) {
    return { valid: false, error: "Nomor telepon tidak boleh kosong" };
  }

  // BR-PH05: karakter yang diizinkan
  if (!VALID_PHONE_CHARS_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: "Nomor telepon hanya boleh berisi digit dan karakter +, -, spasi, tanda kurung",
    };
  }

  // Ekstrak digit untuk validasi lanjutan
  const digits = extractDigitsOnly(trimmed);

  // BR-PH03: format Indonesia (lokal 08xx atau internasional +628xx)
  const validFormat =
    isIndonesianLocalFormat(digits) ||
    isIndonesianInternationalFormat(trimmed);

  if (!validFormat) {
    return {
      valid: false,
      error: "Nomor telepon harus dimulai dengan 08 atau +628 (format telepon Indonesia)",
    };
  }

  // BR-PH04: panjang digit — hilangkan kode negara jika ada
  const localDigits = isIndonesianInternationalFormat(trimmed)
    ? digits.slice(2)  // hilangkan "62" dari "+628..."
    : digits;          // sudah dalam format "08..."

  if (localDigits.length < PHONE_MIN_DIGITS || localDigits.length > PHONE_MAX_DIGITS) {
    return {
      valid: false,
      error: `Panjang nomor telepon harus ${PHONE_MIN_DIGITS}-${PHONE_MAX_DIGITS} digit`,
    };
  }

  return { valid: true, error: null };
}

// ─── Validasi Kredensial Login ────────────────────────────────

export interface LoginCredentials {
  identifier: string;  // email atau username
  password:   string;
}

/**
 * Validasi format kredensial login (client-side format check).
 * Tidak melakukan autentikasi terhadap database — hanya cek format input.
 *
 * Business Rules:
 * - identifier (email/username) tidak boleh kosong atau hanya whitespace
 * - password tidak boleh kosong
 */
export function validateLoginCredentials(
  credentials: LoginCredentials
): CheckoutFieldResult {
  if (!credentials.identifier || credentials.identifier.trim() === "") {
    return { valid: false, error: "Email atau username wajib diisi" };
  }
  if (!credentials.password || credentials.password === "") {
    return { valid: false, error: "Password wajib diisi" };
  }
  return { valid: true, error: null };
}
