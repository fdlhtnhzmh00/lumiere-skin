/**
 * cypress/support/commands.ts
 *
 * Custom Cypress commands untuk LUMIÈRE SKIN UI Automation.
 * Digunakan oleh semua test specs.
 */

/// <reference types="cypress" />

// ─── Type Declarations ────────────────────────────────────────
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login via UI menggunakan halaman login.
       * @param identifier Email atau username
       * @param password   Password akun
       */
      login(identifier: string, password: string): Chainable<void>;

      /**
       * Tambah produk ke keranjang via halaman detail produk.
       * @param slug Slug produk
       */
      addToCart(slug: string): Chainable<void>;

      /**
       * Bersihkan cart dan localStorage auth sebelum test.
       */
      clearAppState(): Chainable<void>;
    }
  }
}

// ─── Custom Commands ──────────────────────────────────────────

/**
 * Login via UI — menggunakan data-testid yang sudah tersedia
 */
Cypress.Commands.add("login", (identifier: string, password: string) => {
  cy.visit("/login");
  cy.get('[data-testid="login-identifier"]').should("be.visible").clear().type(identifier);
  cy.get('[data-testid="login-password"]').clear().type(password);
  cy.get('[data-testid="login-submit"]').click();
  // Tunggu redirect setelah login berhasil
  cy.url().should("not.include", "/login", { timeout: 15000 });
});

/**
 * Tambah produk ke keranjang via halaman detail produk
 */
Cypress.Commands.add("addToCart", (slug: string) => {
  cy.visit(`/products/${slug}`);
  cy.get('[data-testid="btn-add-to-cart"]').should("be.visible").should("not.be.disabled").click();
  cy.get('[data-testid="btn-add-to-cart"]').should("contain.text", "Added", { timeout: 5000 });
});

/**
 * Bersihkan state aplikasi (auth + cart)
 */
Cypress.Commands.add("clearAppState", () => {
  cy.clearLocalStorage("lumiere_token");
  cy.clearLocalStorage("lumiere_user");
  cy.clearLocalStorage("lumiere_cart");
  cy.clearCookies();
});

export {};
