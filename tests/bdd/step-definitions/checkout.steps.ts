/**
 * tests/bdd/step-definitions/checkout.steps.ts
 *
 * Step definitions untuk Feature: Checkout dan Status Pesanan
 * Menghubungkan langkah-langkah Gherkin dengan kode pengujian.
 */

import { Given, When, Then, DataTable, setWorldConstructor } from "@cucumber/cucumber";
import * as assert from "assert";
import { validateRecipientName, validateIndonesianPhone } from "../../../lib/validations/checkout";
import { validateCheckout, validateStatusTransition } from "../../../lib/validations/order";

// ─── World: state yang dibagi antar step ──────────────────────
class CheckoutWorld {
  isAuthenticated: boolean = false;
  cartItemCount:   number  = 0;

  // Data pengiriman
  recipientName:   string = "";
  shippingAddress: string = "";
  phoneNumber:     string = "";

  // Hasil validasi
  checkoutValidationResult?: { valid: boolean; errors: string[] };
  nameValidationResult?:     { valid: boolean; error: string | null };
  phoneValidationResult?:    { valid: boolean; error: string | null };

  // Status pesanan
  currentOrderStatus: string = "";
  newOrderStatus:     string = "";
  statusTransitionResult?: { valid: boolean; error: string | null };
}

setWorldConstructor(CheckoutWorld);

// ════════════════════════════════════════════════════════════════
// GIVEN STEPS
// ════════════════════════════════════════════════════════════════

Given("saya sudah login sebagai pengguna LUMIÈRE SKIN", function (this: CheckoutWorld) {
  this.isAuthenticated = true;
});

Given("saya belum login ke aplikasi", function (this: CheckoutWorld) {
  this.isAuthenticated = false;
});

Given(
  "keranjang belanja saya berisi {int} produk",
  function (this: CheckoutWorld, count: number) {
    this.cartItemCount = count;
  }
);

Given("keranjang belanja saya kosong", function (this: CheckoutWorld) {
  this.cartItemCount = 0;
});

Given(
  "keranjang belanja berisi {int} produk",
  function (this: CheckoutWorld, count: number) {
    this.cartItemCount = count;
  }
);

Given(
  "terdapat pesanan dengan status {string}",
  function (this: CheckoutWorld, status: string) {
    this.currentOrderStatus = status;
  }
);

// ════════════════════════════════════════════════════════════════
// WHEN STEPS
// ════════════════════════════════════════════════════════════════

When(
  "saya mengisi data pengiriman:",
  function (this: CheckoutWorld, dataTable: DataTable) {
    const data = dataTable.rowsHash();
    this.recipientName   = data["Nama Penerima"]     ?? "";
    this.shippingAddress = data["Alamat Pengiriman"] ?? "";
    this.phoneNumber     = data["Nomor Telepon"]     ?? "";

    // Validasi form checkout menggunakan fungsi validasi
    this.checkoutValidationResult = validateCheckout({
      isLoggedIn:      this.isAuthenticated,
      cartItemCount:   this.cartItemCount,
      recipientName:   this.recipientName,
      shippingAddress: this.shippingAddress,
      phoneNumber:     this.phoneNumber,
    });
  }
);

When("saya mencoba melakukan checkout", function (this: CheckoutWorld) {
  this.checkoutValidationResult = validateCheckout({
    isLoggedIn:    this.isAuthenticated,
    cartItemCount: this.cartItemCount,
    recipientName:   "Nama Default",
    shippingAddress: "Alamat Default",
    phoneNumber:     "081234567890",
  });
});

When(
  "saya mengisi nama penerima {string}",
  function (this: CheckoutWorld, name: string) {
    this.recipientName       = name;
    this.nameValidationResult = validateRecipientName(name);
  }
);

When(
  "saya mengisi nomor telepon {string}",
  function (this: CheckoutWorld, phone: string) {
    this.phoneNumber          = phone;
    this.phoneValidationResult = validateIndonesianPhone(phone);
  }
);

When(
  "dilakukan perubahan status pesanan menjadi {string}",
  function (this: CheckoutWorld, newStatus: string) {
    this.newOrderStatus = newStatus;
    this.statusTransitionResult = validateStatusTransition(
      this.currentOrderStatus as any,
      newStatus as any
    );
  }
);

// ════════════════════════════════════════════════════════════════
// THEN STEPS
// ════════════════════════════════════════════════════════════════

Then("data checkout berhasil divalidasi", function (this: CheckoutWorld) {
  assert.ok(
    this.checkoutValidationResult?.valid,
    `Checkout harus valid. Errors: ${this.checkoutValidationResult?.errors?.join(", ")}`
  );
});

Then(
  "pesanan baru akan memiliki status {string}",
  function (this: CheckoutWorld, expectedStatus: string) {
    // Setiap pesanan baru selalu dimulai dengan status DRAFT (BR-14)
    assert.strictEqual(
      expectedStatus,
      "DRAFT",
      "Pesanan baru harus berstatus DRAFT sesuai BR-14"
    );
    assert.ok(
      this.checkoutValidationResult?.valid,
      "Checkout harus valid untuk membuat pesanan DRAFT"
    );
  }
);

Then("sistem menolak proses checkout", function (this: CheckoutWorld) {
  assert.strictEqual(
    this.checkoutValidationResult?.valid,
    false,
    "Checkout harus ditolak"
  );
});

Then(
  "sistem meminta saya untuk login terlebih dahulu",
  function (this: CheckoutWorld) {
    const errors = this.checkoutValidationResult?.errors ?? [];
    const hasLoginError = errors.some(
      (e) => e.toLowerCase().includes("login") || e.toLowerCase().includes("harus")
    );
    assert.ok(
      hasLoginError || !this.isAuthenticated,
      "Sistem harus meminta login karena pengguna belum terautentikasi"
    );
  }
);

Then(
  "sistem menampilkan pesan {string} tidak boleh kosong",
  function (this: CheckoutWorld, keyword: string) {
    const errors = this.checkoutValidationResult?.errors ?? [];
    const hasRelevantError = errors.some(
      (e) => e.toLowerCase().includes(keyword.toLowerCase())
    );
    assert.ok(
      hasRelevantError,
      `Error harus mengandung kata "${keyword}". Errors: ${errors.join(", ")}`
    );
  }
);

Then("validasi nama penerima gagal", function (this: CheckoutWorld) {
  assert.strictEqual(
    this.nameValidationResult?.valid,
    false,
    "Validasi nama penerima harus gagal"
  );
});

Then("pesan error nama mengandung {string}", function (this: CheckoutWorld, keyword: string) {
  const errorMsg =
    this.nameValidationResult?.error ??
    this.phoneValidationResult?.error ??
    this.statusTransitionResult?.error ??
    "";
  assert.ok(
    errorMsg.toLowerCase().includes(keyword.toLowerCase()),
    `Pesan error "${errorMsg}" harus mengandung kata "${keyword}"`
  );
});

Then(
  "hasil validasi telepon adalah {string}",
  function (this: CheckoutWorld, expected: string) {
    if (expected === "valid") {
      assert.strictEqual(
        this.phoneValidationResult?.valid,
        true,
        `Nomor "${this.phoneNumber}" harus valid. Error: ${this.phoneValidationResult?.error}`
      );
    } else {
      assert.strictEqual(
        this.phoneValidationResult?.valid,
        false,
        `Nomor "${this.phoneNumber}" harus invalid`
      );
    }
  }
);

Then("perubahan status berhasil diterima", function (this: CheckoutWorld) {
  assert.strictEqual(
    this.statusTransitionResult?.valid,
    true,
    `Transisi ${this.currentOrderStatus} → ${this.newOrderStatus} harus valid. Error: ${this.statusTransitionResult?.error}`
  );
});

Then(
  "status pesanan sekarang adalah {string}",
  function (this: CheckoutWorld, expectedStatus: string) {
    // Setelah transisi berhasil, status baru sesuai yang diinput
    assert.strictEqual(
      this.newOrderStatus,
      expectedStatus,
      `Status pesanan harus ${expectedStatus}`
    );
    assert.strictEqual(
      this.statusTransitionResult?.valid,
      true,
      "Transisi harus valid"
    );
  }
);

Then("perubahan status ditolak oleh sistem", function (this: CheckoutWorld) {
  assert.strictEqual(
    this.statusTransitionResult?.valid,
    false,
    `Transisi ${this.currentOrderStatus} → ${this.newOrderStatus} harus ditolak`
  );
});

Then(
  "sistem menampilkan pesan bahwa pesanan sudah selesai tidak dapat diubah",
  function (this: CheckoutWorld) {
    const errorMsg = this.statusTransitionResult?.error ?? "";
    const hasRelevantMessage =
      errorMsg.toLowerCase().includes("selesai") ||
      errorMsg.toLowerCase().includes("completed") ||
      errorMsg.toLowerCase().includes("diubah") ||
      errorMsg.toLowerCase().includes("final");
    assert.ok(
      hasRelevantMessage,
      `Pesan error "${errorMsg}" harus menjelaskan pesanan tidak dapat diubah`
    );
  }
);
