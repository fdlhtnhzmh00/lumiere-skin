/**
 * tests/bdd/step-definitions/login.steps.ts
 *
 * Step definitions untuk Feature: Autentikasi Pengguna
 * Menghubungkan langkah-langkah Gherkin dengan kode pengujian.
 *
 * Pendekatan: Business Logic Testing
 * - Memvalidasi kredensial menggunakan fungsi validasi yang ada
 * - Mensimulasikan autentikasi terhadap akun demo yang diketahui
 * - Tidak memerlukan server yang berjalan
 */

import { Given, When, Then, Before, setWorldConstructor } from "@cucumber/cucumber";
import * as assert from "assert";
import { validateLoginCredentials } from "../../../lib/validations/checkout";

// ─── World: state yang dibagi antar step dalam satu skenario ──
class LoginWorld {
  appRunning: boolean           = false;
  availableUsers: Array<{ email: string; username: string; password: string }> = [];
  currentPage: string           = "";
  inputIdentifier: string       = "";
  inputPassword: string         = "";

  // Hasil validasi form (format check)
  formValidationResult?: { valid: boolean; error?: string };

  // Hasil simulasi autentikasi (credentials check)
  authResult?: { success: boolean; error?: string };
  isAuthenticated: boolean      = false;
}

setWorldConstructor(LoginWorld);

// ─── Kredensial demo yang valid (simulasi database) ───────────
const DEMO_USERS = [
  { email: "user@lumiereskin.com",  username: "team1",  password: "Lumiere123!" },
  { email: "admin@lumiereskin.com", username: "admin",  password: "Admin123!"   },
];

/**
 * Simulasikan proses login terhadap kredensial yang diketahui.
 * Meniru perilaku POST /api/auth/login tanpa memerlukan server.
 */
function simulateAuthentication(
  identifier: string,
  password: string
): { success: boolean; error?: string } {
  // Cari user berdasarkan email atau username
  const user = DEMO_USERS.find(
    (u) => u.email === identifier || u.username === identifier
  );
  if (!user) {
    return { success: false, error: "Email/username atau password salah" };
  }
  if (user.password !== password) {
    return { success: false, error: "Email/username atau password salah" };
  }
  return { success: true };
}

// ════════════════════════════════════════════════════════════════
// BACKGROUND STEPS
// ════════════════════════════════════════════════════════════════

Given("aplikasi LUMIÈRE SKIN sedang berjalan", function (this: LoginWorld) {
  this.appRunning = true;
  assert.strictEqual(this.appRunning, true, "Aplikasi harus berjalan");
});

Given(
  "tersedia akun pengguna dengan email {string} dan password {string}",
  function (this: LoginWorld, email: string, password: string) {
    const userExists = DEMO_USERS.some(
      (u) => u.email === email && u.password === password
    );
    assert.ok(userExists, `Akun ${email} harus tersedia di sistem`);
  }
);

// ════════════════════════════════════════════════════════════════
// GIVEN STEPS
// ════════════════════════════════════════════════════════════════

Given("saya berada di halaman login", function (this: LoginWorld) {
  this.currentPage = "/login";
  this.isAuthenticated = false;
  // Reset state
  this.formValidationResult = undefined;
  this.authResult = undefined;
});

// ════════════════════════════════════════════════════════════════
// WHEN STEPS
// ════════════════════════════════════════════════════════════════

When(
  "saya memasukkan email {string} dan password {string}",
  function (this: LoginWorld, email: string, password: string) {
    this.inputIdentifier = email;
    this.inputPassword   = password;

    // Langkah 1: Validasi format form (client-side)
    const validation = validateLoginCredentials({
      identifier: email,
      password:   password,
    });
    this.formValidationResult = validation;

    // Langkah 2: Jika format valid, lakukan simulasi autentikasi
    if (validation.valid) {
      this.authResult = simulateAuthentication(email, password);
      if (this.authResult.success) {
        this.isAuthenticated = true;
      }
    }
  }
);

When(
  "saya memasukkan username {string} dan password {string}",
  function (this: LoginWorld, username: string, password: string) {
    this.inputIdentifier = username;
    this.inputPassword   = password;

    const validation = validateLoginCredentials({
      identifier: username,
      password:   password,
    });
    this.formValidationResult = validation;

    if (validation.valid) {
      this.authResult = simulateAuthentication(username, password);
      if (this.authResult.success) {
        this.isAuthenticated = true;
      }
    }
  }
);

When(
  "saya memasukkan identifier {string} dan password {string}",
  function (this: LoginWorld, identifier: string, password: string) {
    this.inputIdentifier = identifier;
    this.inputPassword   = password;

    const validation = validateLoginCredentials({
      identifier: identifier,
      password:   password,
    });
    this.formValidationResult = validation;

    if (validation.valid) {
      this.authResult = simulateAuthentication(identifier, password);
      if (this.authResult.success) {
        this.isAuthenticated = true;
      }
    }
  }
);

// ════════════════════════════════════════════════════════════════
// THEN STEPS
// ════════════════════════════════════════════════════════════════

Then("sistem memvalidasi kredensial dengan sukses", function (this: LoginWorld) {
  assert.ok(
    this.formValidationResult?.valid,
    `Validasi form harus berhasil. Error: ${this.formValidationResult?.error}`
  );
  assert.ok(
    this.authResult?.success,
    `Autentikasi harus berhasil. Error: ${this.authResult?.error}`
  );
});

Then(
  "status autentikasi berubah menjadi {string}",
  function (this: LoginWorld, expectedStatus: string) {
    if (expectedStatus === "terautentikasi") {
      assert.strictEqual(
        this.isAuthenticated,
        true,
        "Pengguna harus terautentikasi"
      );
    } else {
      assert.strictEqual(
        this.isAuthenticated,
        false,
        "Pengguna tidak boleh terautentikasi"
      );
    }
  }
);

Then("sistem menolak login", function (this: LoginWorld) {
  const loginFailed =
    !this.formValidationResult?.valid ||
    (this.formValidationResult?.valid && !this.authResult?.success);
  assert.ok(loginFailed, "Sistem harus menolak login");
  assert.strictEqual(this.isAuthenticated, false, "Pengguna tidak boleh terautentikasi");
});

Then("pesan error mengandung {string}", function (this: LoginWorld, keyword: string) {
  const errorMsg =
    this.authResult?.error ?? this.formValidationResult?.error ?? "";
  assert.ok(
    errorMsg.toLowerCase().includes(keyword.toLowerCase()),
    `Pesan error "${errorMsg}" harus mengandung kata "${keyword}"`
  );
});

Then("validasi form gagal", function (this: LoginWorld) {
  assert.strictEqual(
    this.formValidationResult?.valid,
    false,
    "Validasi form harus gagal"
  );
  assert.strictEqual(
    this.isAuthenticated,
    false,
    "Pengguna tidak boleh terautentikasi"
  );
});

Then("pesan validasi mengandung {string}", function (this: LoginWorld, keyword: string) {
  const validationError = this.formValidationResult?.error ?? "";
  assert.ok(
    validationError.toLowerCase().includes(keyword.toLowerCase()),
    `Pesan validasi "${validationError}" harus mengandung kata "${keyword}"`
  );
});

Then(
  "hasil validasi adalah {string}",
  function (this: LoginWorld, expectedHasil: string) {
    switch (expectedHasil) {
      case "valid":
        assert.ok(
          this.formValidationResult?.valid && this.authResult?.success,
          `Harus berhasil. Form: ${this.formValidationResult?.valid}, Auth: ${this.authResult?.success}`
        );
        break;
      case "credentials_error":
        assert.ok(
          this.formValidationResult?.valid && !this.authResult?.success,
          `Harus gagal karena credentials. Auth error: ${this.authResult?.error}`
        );
        break;
      case "validation_error":
        assert.strictEqual(
          this.formValidationResult?.valid,
          false,
          `Harus gagal karena validasi form. Error: ${this.formValidationResult?.error}`
        );
        break;
      default:
        assert.fail(`Hasil tidak dikenal: ${expectedHasil}`);
    }
  }
);
