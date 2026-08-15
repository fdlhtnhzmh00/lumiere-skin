/**
 * cypress/e2e/checkout.cy.ts
 *
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  UI AUTOMATION — Checkout Page Tests                        ║
 * ║  Phase 17 | LUMIÈRE SKIN                                   ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Test Cases:
 *   TC-UI-16: Checkout berhasil dengan data valid        [POSITIF]
 *   TC-UI-17: Checkout gagal - field kosong semua        [NEGATIF]
 *   TC-UI-18: Checkout gagal - nama penerima kosong      [NEGATIF]
 *   TC-UI-19: Checkout gagal - belum login               [NEGATIF]
 *   TC-UI-20: Checkout gagal - keranjang kosong          [NEGATIF]
 */

import { CheckoutPage } from "../pages/CheckoutPage";

const checkoutPage = new CheckoutPage();

describe("TC-UI Checkout — Proses Pemesanan LUMIÈRE SKIN", () => {

  // ────────────────────────────────────────────────────────────
  // TC-UI-16: Checkout berhasil dengan data valid
  // ────────────────────────────────────────────────────────────
  it("TC-UI-16: Checkout berhasil dan membuat pesanan DRAFT", () => {
    cy.fixture("testData").then((data) => {
      cy.clearAppState();
      cy.login(data.validUser.identifier, data.validUser.password);
      cy.addToCart(data.testProduct.slug);

      checkoutPage.visit();
      checkoutPage.shouldBeVisible();
      checkoutPage.shouldShowOrderSummary();

      checkoutPage.fillForm({
        recipientName:   data.checkoutValid.recipientName,
        shippingAddress: data.checkoutValid.shippingAddress,
        phoneNumber:     data.checkoutValid.phoneNumber,
        notes:           data.checkoutValid.notes,
      });

      checkoutPage.submit();

      // Setelah checkout berhasil, redirect ke halaman detail order
      checkoutPage.shouldRedirectToOrder();

      // Verifikasi order berhasil dibuat dengan status DRAFT
      cy.get('[data-testid="order-detail"]', { timeout: 15000 }).should("be.visible");
      cy.get('[data-testid="order-success-banner"]').should("be.visible");
      cy.contains("DRAFT").should("be.visible");
    });
  });

  // ────────────────────────────────────────────────────────────
  // TC-UI-17: Checkout gagal - semua field kosong
  // ────────────────────────────────────────────────────────────
  it("TC-UI-17: Checkout gagal ketika semua field pengiriman kosong", () => {
    cy.fixture("testData").then((data) => {
      cy.clearAppState();
      cy.login(data.validUser.identifier, data.validUser.password);
      cy.addToCart(data.testProduct.slug);

      checkoutPage.visit();
      checkoutPage.shouldBeVisible();

      // Submit tanpa mengisi apapun
      checkoutPage.submit();

      // Harus tetap di halaman checkout
      cy.url().should("include", "/checkout");
      checkoutPage.shouldShowInlineValidation();
    });
  });

  // ────────────────────────────────────────────────────────────
  // TC-UI-18: Checkout gagal - nama penerima kosong
  // ────────────────────────────────────────────────────────────
  it("TC-UI-18: Checkout gagal ketika nama penerima tidak diisi", () => {
    cy.fixture("testData").then((data) => {
      cy.clearAppState();
      cy.login(data.validUser.identifier, data.validUser.password);
      cy.addToCart(data.testProduct.slug);

      checkoutPage.visit();
      checkoutPage.shouldBeVisible();

      // Isi semua kecuali nama penerima
      checkoutPage.fillForm({
        recipientName:   "",   // Sengaja kosong
        shippingAddress: data.checkoutValid.shippingAddress,
        phoneNumber:     data.checkoutValid.phoneNumber,
      });
      checkoutPage.submit();

      // Tetap di checkout, ada validasi error
      cy.url().should("include", "/checkout");
      checkoutPage.shouldShowInlineValidation();
    });
  });

  // ────────────────────────────────────────────────────────────
  // TC-UI-19: Checkout ditolak - belum login
  // ────────────────────────────────────────────────────────────
  it("TC-UI-19: Checkout ditolak karena pengguna belum login", () => {
    cy.clearAppState();
    // Tidak login — langsung akses checkout
    checkoutPage.visit();

    // Harus redirect ke login atau menampilkan pesan perlu login
    cy.get("body").then(($body) => {
      // Bisa redirect ke /login atau menampilkan guard di halaman
      if ($body.find('[data-testid="checkout-page"]').length === 0) {
        // Guard: redirect ke login
        cy.url().should("include", "/login");
      } else {
        // Guard: tampilkan pesan di halaman
        cy.contains("Login").should("be.visible");
      }
    });
  });

  // ────────────────────────────────────────────────────────────
  // TC-UI-20: Checkout gagal - keranjang kosong
  // ────────────────────────────────────────────────────────────
  it("TC-UI-20: Checkout ditolak karena keranjang belanja kosong", () => {
    cy.fixture("testData").then((data) => {
      cy.clearAppState();
      cy.login(data.validUser.identifier, data.validUser.password);

      // Tidak tambah produk — checkout langsung dengan keranjang kosong
      checkoutPage.visit();

      // Harus menampilkan pesan keranjang kosong atau redirect
      cy.get("body").then(($body) => {
        if ($body.find('[data-testid="checkout-page"]').length === 0) {
          // Guard: redirect ke produk
          cy.url().should("include", "/products");
        } else {
          // Guard: tampilkan pesan di halaman
          cy.contains("kosong").should("be.visible");
        }
      });
    });
  });
});
