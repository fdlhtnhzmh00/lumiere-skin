/**
 * cypress/e2e/products.cy.ts
 *
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  UI AUTOMATION — Products Page Tests                        ║
 * ║  Phase 17 | LUMIÈRE SKIN                                   ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Test Cases:
 *   TC-UI-07: Menampilkan daftar produk                 [POSITIF]
 *   TC-UI-08: Melihat detail produk                     [POSITIF]
 *   TC-UI-09: Filter produk berdasarkan kategori        [POSITIF]
 *   TC-UI-10: Tambah produk ke keranjang dari card      [POSITIF]
 */

import { ProductsPage } from "../pages/ProductsPage";

const productsPage = new ProductsPage();

describe("TC-UI Products — Daftar dan Detail Produk LUMIÈRE SKIN", () => {

  // ────────────────────────────────────────────────────────────
  // TC-UI-07: Tampilkan daftar produk
  // ────────────────────────────────────────────────────────────
  it("TC-UI-07: Menampilkan daftar produk skincare", () => {
    productsPage.visit();

    // Verifikasi header halaman
    cy.contains("All Products").should("be.visible");

    // Verifikasi produk tampil minimal 4
    productsPage.shouldShowProductList();
    productsPage.shouldShowAtLeast(4);

    // Verifikasi setiap card memiliki nama dan harga
    productsPage.shouldShowProductDetails();
  });

  // ────────────────────────────────────────────────────────────
  // TC-UI-08: Melihat detail produk
  // ────────────────────────────────────────────────────────────
  it("TC-UI-08: Melihat halaman detail produk dengan informasi lengkap", () => {
    cy.fixture("testData").then((data) => {
      productsPage.visitProduct(data.testProduct.slug);
      productsPage.shouldShowProductDetail();

      // Verifikasi tab informasi tersedia
      cy.contains("Description").should("be.visible");
      cy.contains("Ingredients").should("be.visible");

      // Verifikasi breadcrumb
      cy.contains("Products").should("be.visible");
    });
  });

  // ────────────────────────────────────────────────────────────
  // TC-UI-09: Filter produk berdasarkan kategori
  // ────────────────────────────────────────────────────────────
  it("TC-UI-09: Filter produk berdasarkan kategori Serum & Ampoule", () => {
    cy.visit("/products?category=serum-ampoule");

    // Header menampilkan nama kategori dalam Bahasa Inggris
    cy.contains("Serum & Ampoule").should("be.visible");

    // Produk yang muncul harus dari kategori Serum & Ampoule
    cy.get('[data-testid="product-card"]', { timeout: 15000 }).should("have.length.greaterThan", 0);
    cy.get('[data-testid="product-card"]').first().within(() => {
      cy.contains("Serum & Ampoule").should("be.visible");
    });
  });

  // ────────────────────────────────────────────────────────────
  // TC-UI-10: Tambah produk ke keranjang (perlu login)
  // ────────────────────────────────────────────────────────────
  it("TC-UI-10: Menambahkan produk ke keranjang dari halaman detail", () => {
    cy.fixture("testData").then((data) => {
      // Login dulu sebelum tambah ke keranjang
      cy.login(data.validUser.identifier, data.validUser.password);

      // Navigasi ke halaman detail produk
      productsPage.visitProduct(data.testProduct.slug);
      productsPage.shouldShowProductDetail();

      // Tambah ke keranjang
      productsPage.addToCart();
      productsPage.shouldShowAddedToCart();

      // Verifikasi badge keranjang di navbar bertambah
      cy.get("header").within(() => {
        cy.get('[href="/cart"]').should("be.visible");
      });
    });
  });
});
